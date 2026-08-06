/**
 * useConversations — React Query hooks for conversation data.
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { Conversation, Message } from '@/types';

export const CONVERSATIONS_KEY = ['conversations'];

export function useConversations() {
  return useQuery<{ items: Conversation[]; total: number }>({
    queryKey: CONVERSATIONS_KEY,
    queryFn: async ({ signal }) => {
      const resp = await api.get<{ items: Conversation[]; total: number }>(
        '/conversations/',
        undefined,
        signal,
      );
      return resp.data ?? { items: [], total: 0 };
    },
    staleTime: 30_000,
  });
}

export function useConversationMessages(convId: string | null) {
  return useQuery<Message[]>({
    queryKey: ['conversations', convId, 'messages'],
    queryFn: async ({ signal }) => {
      if (!convId) return [];
      const resp = await api.get<Message[]>(`/conversations/${convId}/messages`, undefined, signal);
      return resp.data || [];
    },
    enabled: !!convId,
    staleTime: 60_000,
  });
}
