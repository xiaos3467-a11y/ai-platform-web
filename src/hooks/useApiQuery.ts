/**
 * useApiQuery — React Query wrapper for the project's API client.
 *
 * Replaces the repetitive `useEffect + AbortController + useState` pattern
 * found across every page with a single declarative hook.
 *
 * Usage:
 *   const { data, isLoading, error, refetch } = useApiQuery<User[]>({
 *     queryKey: ['users'],
 *     endpoint: '/users/list',
 *   });
 *
 *   // With body params
 *   const { data } = useApiQuery<CostSummary>({
 *     queryKey: ['costs', 'summary'],
 *     endpoint: '/costs/summary',
 *   });
 */

import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { ApiResponse } from '@/types';

export interface UseApiQueryOptions<T> {
  queryKey: QueryKey;
  endpoint: string;
  params?: Record<string, unknown>;
  enabled?: boolean;
  refetchInterval?: number | false;
  staleTime?: number;
  gcTime?: number;
  select?: (data: T) => unknown;
}

/**
 * Fetch paginated list endpoints (returns `{ items, total }`).
 */
export function useApiListQuery<T>(opts: UseApiQueryOptions<{ items: T[]; total: number }>) {
  return useQuery<{ items: T[]; total: number }, Error, { items: T[]; total: number }, QueryKey>({
    queryKey: opts.queryKey,
    queryFn: async ({ signal }) => {
      const resp = await api.post<{ items: T[]; total: number }>(opts.endpoint, opts.params || {}, signal);
      return resp.data ?? { items: [], total: 0 };
    },
    enabled: opts.enabled,
    staleTime: opts.staleTime ?? 30_000,
    gcTime: opts.gcTime ?? 5 * 60_000,
  });
}

/**
 * Generic API query — wraps `api.post<T>(endpoint)` into React Query.
 */
export function useApiQuery<T>(opts: UseApiQueryOptions<T>) {
  return useQuery<T, Error, T, QueryKey>({
    queryKey: opts.queryKey,
    queryFn: async ({ signal }) => {
      const resp: ApiResponse<T> = await api.post<T>(opts.endpoint, opts.params || {}, signal);
      return resp.data as T;
    },
    enabled: opts.enabled,
    refetchInterval: opts.refetchInterval,
    staleTime: opts.staleTime ?? 30_000,
    gcTime: opts.gcTime ?? 5 * 60_000,
    select: opts.select as (data: T) => T,
  });
}

/**
 * Raw API query — wraps `api.post<T>(endpoint)` for endpoints that
 * don't wrap responses in `{ code, data, message }`.
 */
export function useApiRawQuery<T>(opts: UseApiQueryOptions<T>) {
  return useQuery<T, Error, T, QueryKey>({
    queryKey: opts.queryKey,
    queryFn: async ({ signal }) => {
      const resp = await api.post<T>(opts.endpoint, opts.params || {}, signal);
      return resp.data as T;
    },
    enabled: opts.enabled,
    refetchInterval: opts.refetchInterval,
    staleTime: opts.staleTime ?? 10_000,
    gcTime: opts.gcTime ?? 2 * 60_000,
  });
}

// Re-export the underlying UseQueryOptions for custom use cases
export type { UseQueryOptions, QueryKey };