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
        if (error.response?.status === 401) {
          localStorage.removeItem('ai_platform_token');
          window.location.href = '/login';
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
  ): Promise<void> {
    const token = localStorage.getItem('ai_platform_token');
    const resp = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    const reader = resp.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

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
            // skip malformed
          }
        }
      }
    }
    onDone();
  }
}

export const api = new ApiClient();
