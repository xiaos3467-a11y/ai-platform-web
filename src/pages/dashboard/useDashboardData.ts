/**
 * useDashboardData — aggregates all dashboard queries into a single hook.
 * Uses React Query for caching, dedup, and automatic refetch.
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { CostSummary, DailyCost, HealthStatus } from '@/types';

export function useDashboardData() {
  const healthQuery = useQuery<HealthStatus>({
    queryKey: ['health'],
    queryFn: () => api.post<HealthStatus>('/health').then(r => r.data),
    staleTime: 15_000,
    retry: 2,
  });

  const costSummaryQuery = useQuery<CostSummary>({
    queryKey: ['costs', 'summary'],
    queryFn: async ({ signal }) => {
      const resp = await api.post<CostSummary>('/costs/summary', {}, signal);
      return resp.data;
    },
    staleTime: 60_000,
  });

  const dailyCostsQuery = useQuery<DailyCost[]>({
    queryKey: ['costs', 'daily', 14],
    queryFn: async ({ signal }) => {
      const resp = await api.post<DailyCost[]>('/costs/daily', { days: 14 }, signal);
      return resp.data || [];
    },
    staleTime: 60_000,
  });

  const isLoading =
    healthQuery.isLoading || costSummaryQuery.isLoading || dailyCostsQuery.isLoading;
  const allFailed = healthQuery.isError && costSummaryQuery.isError && dailyCostsQuery.isError;

  return {
    health: healthQuery.data ?? null,
    costSummary: costSummaryQuery.data ?? null,
    dailyCosts: dailyCostsQuery.data ?? [],
    isLoading,
    error: allFailed ? '无法连接到后端服务，请检查网络或联系管理员' : null,
    refetchAll: () => {
      healthQuery.refetch();
      costSummaryQuery.refetch();
      dailyCostsQuery.refetch();
    },
  };
}
