/** API client — axios wrapper with auth and error handling */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor — inject auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('ai_platform_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor — handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status;

        if (status === 401) {
          // Only clear token and redirect if we haven't already
          const token = localStorage.getItem('ai_platform_token');
          if (token) {
            localStorage.removeItem('ai_platform_token');
            // Avoid redirect loop — only redirect if not already on login page
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

  async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const resp = await this.client.get<ApiResponse<T>>(url, { params });
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
  ): Promise<void> {
    const token = localStorage.getItem('ai_platform_token');
    let resp: Response;
    try {
      resp = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ model, messages, stream: true }),
      });
    } catch (err) {
      onError?.('网络连接失败');
      onDone();
      return;
    }

    if (!resp.ok) {
      const errMsg = resp.status === 401
        ? '登录已过期'
        : resp.status === 429
          ? '请求过于频繁，请稍后重试'
          : `请求失败 (${resp.status})`;
      onError?.(errMsg);
      onDone();
      return;
    }

    const reader = resp.body?.getReader();
    if (!reader) {
      onError?.('无法读取响应流');
      onDone();
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
              onDone();
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
    } catch {
      onError?.('读取响应流时出错');
    } finally {
      reader.releaseLock();
    }
    onDone();
  }
}

export const api = new ApiClient();
