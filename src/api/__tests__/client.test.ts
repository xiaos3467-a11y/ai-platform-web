/**
 * API client (api/client.ts) — integration tests.
 *
 * We mock axios and fetch to test:
 *   1. Request interceptor injects Bearer token from localStorage.
 *   2. Response interceptor clears token & redirects on 401.
 *   3. Response interceptor shows message.error on network / server errors.
 *   4. Response interceptor does NOT redirect if already on /login.
 *   5. Cancelled requests don't trigger error toasts.
 *   6. Generic methods (get/post/put/delete/upload) unwrap resp.data.
 *   7. streamChat reads SSE chunks and calls onChunk/onDone/onError.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// ── Mocks ───────────────────────────────────────────────────────────

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      error: vi.fn(),
      warning: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
    },
  };
});

// We need to mock axios.create BEFORE importing the client, because
// ApiClient instantiates on module load. We do this via vi.mock at top.
const mockInterceptors = {
  request: { use: vi.fn(), eject: vi.fn() },
  response: { use: vi.fn(), eject: vi.fn() },
};

const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: mockInterceptors,
  defaults: { headers: { common: {} } },
};

vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      ...(actual as object),
      create: vi.fn(() => mockAxiosInstance),
      isCancel: vi.fn(() => false),
      isAxiosError: vi.fn(() => true),
    },
    create: vi.fn(() => mockAxiosInstance),
    isCancel: vi.fn(() => false),
  };
});

// Capture interceptor handlers so we can invoke them in tests
let requestHandler: (config: unknown) => unknown;
let responseSuccessHandler: (response: unknown) => unknown;
let responseErrorHandler: (error: unknown) => Promise<never>;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();

  // Reset module cache so ApiClient constructor runs fresh
  vi.resetModules();

  // Explicitly clear interceptor mock counts — vi.clearAllMocks may not
  // catch these when module state leaks between test files under coverage.
  mockInterceptors.request.use.mockClear();
  mockInterceptors.response.use.mockClear();
  mockAxiosInstance.get.mockClear();
  mockAxiosInstance.post.mockClear();
  mockAxiosInstance.put.mockClear();
  mockAxiosInstance.delete.mockClear();
});

/**
 * Helper: import the client and capture the interceptor handlers
 * that were registered in the constructor.
 */
async function loadClient() {
  // Clear interceptor counts right before import so we get exactly 1 call
  // from this import's constructor, regardless of prior state.
  mockInterceptors.request.use.mockClear();
  mockInterceptors.response.use.mockClear();

  const mod = await import('../client');
  const requestUse = mockInterceptors.request.use as ReturnType<typeof vi.fn>;
  const responseUse = mockInterceptors.response.use as ReturnType<typeof vi.fn>;

  requestHandler = requestUse.mock.calls[0][0] as (config: unknown) => unknown;
  responseSuccessHandler = responseUse.mock.calls[0][0] as (response: unknown) => unknown;
  responseErrorHandler = responseUse.mock.calls[0][1] as (error: unknown) => Promise<never>;

  return mod;
}

// ── Tests ───────────────────────────────────────────────────────────

describe('ApiClient', () => {
  describe('constructor', () => {
    it('creates an axios instance with the correct baseURL', async () => {
      await loadClient();
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.any(String),
          timeout: 60000,
        }),
      );
    }, 15000);

    it('registers request and response interceptors', async () => {
      await loadClient();
      expect(mockInterceptors.request.use).toHaveBeenCalledTimes(1);
      expect(mockInterceptors.response.use).toHaveBeenCalledTimes(1);
    }, 15000);
  });

  describe('request interceptor', () => {
    it('injects Bearer token from localStorage', async () => {
      localStorage.setItem('ai_platform_token', 'my-jwt-token');
      await loadClient();

      const config = { headers: {} as Record<string, string> };
      const result = requestHandler(config) as { headers: Record<string, string> };
      expect(result.headers.Authorization).toBe('Bearer my-jwt-token');
    });

    it('does NOT add Authorization when no token stored', async () => {
      await loadClient();
      const config = { headers: {} as Record<string, string> };
      const result = requestHandler(config) as { headers: Record<string, string> };
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor — error handling', () => {
    it('401: clears token and redirects to /login (no refresh token)', async () => {
      localStorage.setItem('ai_platform_token', 'expired');
      // Set window.location mock
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/dashboard', href: '' },
      });
      await loadClient();

      const error = {
        response: { status: 401 },
        config: { url: '/test', _retry: false },
        isAxiosError: true,
        message: 'Unauthorized',
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(localStorage.getItem('ai_platform_token')).toBeNull();
      expect(window.location.href).toBe('/login');
    });

    it('401 on /login page does NOT redirect again (avoid loop)', async () => {
      localStorage.setItem('ai_platform_token', 'expired');
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/login', href: '' },
      });
      await loadClient();

      const error = {
        response: { status: 401 },
        config: { url: '/test', _retry: false },
      };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      // Should NOT have set href
      expect(window.location.href).toBe('');
    });

    it('cancelled requests are rejected silently', async () => {
      vi.mocked(axios.isCancel).mockReturnValue(true);
      await loadClient();

      const error = { message: 'cancelled' };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
    });

    it('network errors (no response) show error toast', async () => {
      vi.mocked(axios.isCancel).mockReturnValue(false);
      const { message: antMessage } = await import('antd');
      await loadClient();

      const error = { message: 'Network Error' };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(antMessage.error).toHaveBeenCalledWith('网络连接失败，请检查网络');
    });

    it('403 is rejected without toast', async () => {
      vi.mocked(axios.isCancel).mockReturnValue(false);
      const { message: antMessage } = await import('antd');
      await loadClient();

      const error = { response: { status: 403 } };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(antMessage.error).not.toHaveBeenCalled();
    });

    it('500 shows server error message from response data', async () => {
      vi.mocked(axios.isCancel).mockReturnValue(false);
      const { message: antMessage } = await import('antd');
      await loadClient();

      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
        message: 'Server Error',
      };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(antMessage.error).toHaveBeenCalledWith('Internal server error');
    });

    it('500 without data.message falls back to error.message', async () => {
      vi.mocked(axios.isCancel).mockReturnValue(false);
      const { message: antMessage } = await import('antd');
      await loadClient();

      const error = {
        response: { status: 500, data: {} },
        message: 'Something went wrong',
      };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(antMessage.error).toHaveBeenCalledWith('Something went wrong');
    });

    it('successful responses pass through unchanged', async () => {
      await loadClient();
      const response = { data: { ok: true }, status: 200 };
      expect(responseSuccessHandler(response)).toBe(response);
    });
  });

  describe('generic methods', () => {
    it('post() unwraps response.data', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { code: 0, data: { id: 1 }, message: 'ok' },
      });
      const { api } = await loadClient();
      const result = await api.post('/test');
      expect(result).toEqual({ code: 0, data: { id: 1 }, message: 'ok' });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', undefined, { signal: undefined });
    });

    it('post() returns raw response.data shape', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { code: 0, data: { status: 'ok', version: '1.0' }, message: 'ok' },
      });
      const { api } = await loadClient();
      const result = await api.post('/health');
      expect(result).toEqual({ code: 0, data: { status: 'ok', version: '1.0' }, message: 'ok' });
    });

    it('post() passes body', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { code: 0, data: { id: 'new' }, message: '' },
      });
      const { api } = await loadClient();
      await api.post('/items', { name: 'x' });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/items', { name: 'x' }, { signal: undefined });
    });

    it('post() updates a resource', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { code: 0, data: null, message: '' } });
      const { api } = await loadClient();
      await api.post('/items/1', { name: 'y' });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/items/1', { name: 'y' }, { signal: undefined });
    });

    it('post() deletes a resource', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { code: 0, data: null, message: '' } });
      const { api } = await loadClient();
      await api.post('/items/1');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/items/1', undefined, { signal: undefined });
    });

    it('upload() sends FormData with multipart header', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { code: 0, data: { id: 'file' }, message: '' },
      });
      const { api } = await loadClient();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      await api.upload('/upload', file);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );
    });
  });
});

// ── streamChat (SSE) ────────────────────────────────────────────────

describe('streamChat', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });
  }

  it('calls onChunk for each SSE data line', async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n',
      'data: [DONE]\n',
    ];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: makeStream(chunks),
    }) as unknown as typeof fetch;

    const { api } = await loadClient();
    const received: string[] = [];
    const onDone = vi.fn();

    await api.streamChat(
      [{ role: 'user', content: 'Hi' }],
      'gpt-4',
      (c) => received.push(c),
      onDone,
    );

    expect(received).toEqual(['Hello', ' world']);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('calls onError on non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    }) as unknown as typeof fetch;

    const { api } = await loadClient();
    const onError = vi.fn();
    const onDone = vi.fn();

    await api.streamChat([{ role: 'user', content: 'Hi' }], 'gpt-4', () => {}, onDone, onError);

    expect(onError).toHaveBeenCalledWith('请求过于频繁，请稍后重试');
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('401 returns specific expired message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    }) as unknown as typeof fetch;

    const { api } = await loadClient();
    const onError = vi.fn();

    await api.streamChat(
      [{ role: 'user', content: 'Hi' }],
      'gpt-4',
      () => {},
      () => {},
      onError,
    );

    expect(onError).toHaveBeenCalledWith('登录已过期');
  });

  it('calls onError on network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

    const { api } = await loadClient();
    const onError = vi.fn();
    const onDone = vi.fn();

    await api.streamChat([{ role: 'user', content: 'Hi' }], 'gpt-4', () => {}, onDone, onError);

    expect(onError).toHaveBeenCalledWith('网络连接失败');
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onError on AbortError', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    globalThis.fetch = vi.fn().mockRejectedValue(abortError) as unknown as typeof fetch;

    const { api } = await loadClient();
    const onError = vi.fn();

    await api.streamChat(
      [{ role: 'user', content: 'Hi' }],
      'gpt-4',
      () => {},
      () => {},
      onError,
    );

    expect(onError).not.toHaveBeenCalled();
  });

  it('includes Authorization header with token', async () => {
    localStorage.setItem('ai_platform_token', 'my-token');
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: makeStream(['data: [DONE]\n']),
    }) as unknown as typeof fetch;

    const { api } = await loadClient();
    await api.streamChat(
      [{ role: 'user', content: 'Hi' }],
      'gpt-4',
      () => {},
      () => {},
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat/completions'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      }),
    );
  });

  it('skips malformed JSON chunks without crashing', async () => {
    const chunks = [
      'data: not-json\n',
      'data: {"choices":[{"delta":{"content":"OK"}}]}\n',
      'data: [DONE]\n',
    ];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: makeStream(chunks),
    }) as unknown as typeof fetch;

    const { api } = await loadClient();
    const received: string[] = [];

    await api.streamChat(
      [{ role: 'user', content: 'Hi' }],
      'gpt-4',
      (c) => received.push(c),
      () => {},
    );

    expect(received).toEqual(['OK']);
  });
});
