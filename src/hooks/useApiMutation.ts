/**
 * useApiMutation — React Query wrapper for API mutations (POST-only).
 *
 * Provides optimistic update support, automatic query invalidation,
 * and consistent error handling via the existing API client interceptor.
 *
 * Usage:
 *   const mutation = useApiMutation<User>({
 *     endpoint: '/users/create',
 *     invalidateKeys: [['users']],
 *   });
 *
 *   mutation.mutate(values, {
 *     onSuccess: () => message.success('Created'),
 *   });
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';
import { api } from '@/api/client';
import type { ApiResponse } from '@/types';

export interface UseApiMutationOptions<TData = unknown, TVariables = unknown> {
  endpoint: string | ((variables: TVariables) => string);
  invalidateKeys?: QueryKey[];
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables) => void;
}

export function useApiMutation<TData = unknown, TVariables = unknown>(
  opts: UseApiMutationOptions<TData, TVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const url = typeof opts.endpoint === 'function' ? opts.endpoint(variables) : opts.endpoint;
      const resp: ApiResponse<TData> = await api.post<TData>(url, variables);
      return resp.data;
    },
    onSuccess: async (data, variables) => {
      // Invalidate related queries
      if (opts.invalidateKeys) {
        await Promise.all(
          opts.invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })),
        );
      }
      await opts.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      opts.onError?.(error, variables);
    },
  } as UseMutationOptions<TData, Error, TVariables>);
}