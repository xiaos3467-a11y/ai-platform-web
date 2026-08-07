/** API client — axios wrapper with auth, silent refresh and error handling */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '@/types';
import { useAuthStore } from '@/contexts/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// ---------------------------------------------------------------------------
// Refresh token queue — prevent concurrent refresh calls
// ---------------------------------------------------------------------------
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// ---------------------------------------------------------------------------
// Silent token refresh
// ---------------------------------------------------------------------------
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().getRefreshToken();
  if (!refreshToken) return null;

  try {
    const resp = await axios.post(`${API_BASE}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    const data = resp.data?.data;
    if (data?.token && data?.refresh_token) {
      useAuthStore.getState().updateTokens(data.token, data.refresh_token);
      return data.token as string;
    }
    return null;
  } catch {
    return null;
  }
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor — inject auth token + force HTTPS
    this.client.interceptors.request.use((config) => {
      // Belt-and-suspenders: if somehow the URL resolves to http://, force https
      if (config.url?.startsWith('http://')) {
        config.url = config.url.replace('http://', 'https://');
      }
      // Belt-and-suspenders #2: strip trailing slashes on relative URLs to avoid
      // FastAPI 307 redirects that expose the Railway origin and drop Authorization.
      if (config.url && !config.url.startsWith('http')) {
        config.url = config.url.replace(/\/+$/, '');
      }
      const token = localStorage.getItem('ai_platform_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor — handle errors + silent refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const status = error.response?.status;
        const originalRequest = error.config as typeof error.config & {
          _retry?: boolean;
        };

        // On 401, try silent refresh (once per request)
        if (
          status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/')
        ) {
          const refreshToken = useAuthStore.getState().getRefreshToken();
          if (refreshToken) {
            originalRequest._retry = true;

            if (isRefreshing) {
              // Queue this request until refresh completes
              return new Promise((resolve) => {
                addRefreshSubscriber((newToken: string) => {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                  resolve(this.client(originalRequest));
                });
              });
            }

            isRefreshing = true;
            try {
              const newToken = await refreshAccessToken();
              if (newToken) {
                isRefreshing = false;
                onTokenRefreshed(newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.client(originalRequest);
              }
            } catch {
              // fall through to logout
            } finally {
              isRefreshing = false;
            }
          }

          // Refresh failed or no refresh token — log out
          const token = localStorage.getItem('ai_platform_token');
          if (token) {
            localStorage.removeItem('ai_platform_token');
            localStorage.removeItem('ai_platform_refresh_token');
            if (!window.location.pathname.includes('/login')) {
              message.warning('登录已过期，请重新登录');
              window.location.href = '/login';
            }
          }
          return Promise.reject(error);
        }

        // Don't show error for cancelled requests
        if (axios.isCancel(error)) {
          return Promise.reject(error);
        }

        // Network error (no response at all)
        if (!error.response) {
          message.error('网络连接失败，请检查网络');
          return Promise.reject(error);
        }

        // Don't show duplicate toast for 403 (often handled inline)
        if (status === 403) {
          return Promise.reject(error);
        }

        const data = error.response?.data as ApiResponse | undefined;
        const msg = data?.message || error.message || '请求失败';
        message.error(msg);

        return Promise.reject(error);
      },
    );
  }

  // --- Generic methods ---

  async get<T>(
    url: string,
    params?: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<ApiResponse<T>> {
    const resp = await this.client.get<ApiResponse<T>>(url, { params, signal });
    return resp.data;
  }

  async getRaw<T>(url: string, params?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    const resp = await this.client.get<T>(url, { params, signal });
    return resp.data;
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const resp = await this.client.post<ApiResponse<T>>(url, data);
    return resp.data;
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const resp = await this.client.put<ApiResponse<T>>(url, data);
    return resp.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const resp = await this.client.delete<ApiResponse<T>>(url);
    return resp.data;
  }

  async upload<T>(url: string, file: File): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data;
  }

  // --- Streaming (SSE) ---

  async streamChat(
    messages: { role: string; content: string }[],
    model: string,
    onChunk: (content: string) => void,
    onDone: () => void,
    onError?: (error: string) => void,
    externalSignal?: AbortSignal,
  ): Promise<void> {
    const ctrl = new AbortController();
    const signal = externalSignal ?? ctrl.signal;

    const onAbort = () => ctrl.abort();
    externalSignal?.addEventListener('abort', onAbort);

    const token = localStorage.getItem('ai_platform_token');
    let resp: Response;
    let doneCalled = false;
    const markDone = () => {
      if (!doneCalled) {
        doneCalled = true;
        onDone();
      }
    };

    try {
      resp = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ model, messages, stream: true }),
        signal,
      });
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        onError?.('网络连接失败');
      }
      markDone();
      return;
    } finally {
      externalSignal?.removeEventListener('abort', onAbort);
    }

    if (!resp.ok) {
      const errMsg =
        resp.status === 401
          ? '登录已过期'
          : resp.status === 429
            ? '请求过于频繁，请稍后重试'
            : `请求失败 (${resp.status})`;
      onError?.(errMsg);
      markDone();
      return;
    }

    const reader = resp.body?.getReader();
    if (!reader) {
      onError?.('无法读取响应流');
      markDone();
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6);
            if (payload === '[DONE]') {
              markDone();
              return;
            }
            try {
              const chunk = JSON.parse(payload);
              const content = chunk?.choices?.[0]?.delta?.content;
              if (content) onChunk(content);
            } catch {
              // skip malformed JSON chunk
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        onError?.('读取响应流时出错');
      }
    } finally {
      reader.releaseLock();
    }
    markDone();
  }
}

export const api = new ApiClient();
