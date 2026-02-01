import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type {
  SystemMetrics,
  QueueMetrics,
  RequestStats,
  MetricsHistory,
  RequestHistory,
  HistoryRange,
} from '$lib/types/system-metrics';

export const systemMetricsKeys = {
  all: ['system-metrics'] as const,
  current: () => [...systemMetricsKeys.all, 'current'] as const,
  history: (range: HistoryRange, type?: string) =>
    [...systemMetricsKeys.all, 'history', range, type] as const,
  queues: () => [...systemMetricsKeys.all, 'queues'] as const,
  requests: () => [...systemMetricsKeys.all, 'requests'] as const,
  requestsHistory: (range: HistoryRange) =>
    [...systemMetricsKeys.all, 'requests', 'history', range] as const,
};

export function useCurrentMetrics(refetchIntervalGetter: () => number = () => 5000) {
  return createQuery(() => ({
    queryKey: systemMetricsKeys.current(),
    queryFn: async () => {
      const { data } = await api.get<{ data: SystemMetrics }>('/api/system-metrics/current');
      return data.data;
    },
    refetchInterval: refetchIntervalGetter(),
  }));
}

export function useMetricsHistory(
  rangeGetter: () => HistoryRange,
  typeGetter: () => string = () => 'all',
) {
  return createQuery(() => ({
    queryKey: systemMetricsKeys.history(rangeGetter(), typeGetter()),
    queryFn: async () => {
      const { data } = await api.get<{ data: MetricsHistory }>('/api/system-metrics/history', {
        params: { range: rangeGetter(), type: typeGetter() },
      });
      return data.data;
    },
    refetchInterval: 15000,
  }));
}

export function useQueueMetrics(refetchIntervalGetter: () => number = () => 5000) {
  return createQuery(() => ({
    queryKey: systemMetricsKeys.queues(),
    queryFn: async () => {
      const { data } = await api.get<{ data: { queues: QueueMetrics[] } }>(
        '/api/system-metrics/queues',
      );
      return data.data;
    },
    refetchInterval: refetchIntervalGetter(),
  }));
}

export function useRequestStats(refetchIntervalGetter: () => number = () => 5000) {
  return createQuery(() => ({
    queryKey: systemMetricsKeys.requests(),
    queryFn: async () => {
      const { data } = await api.get<{ data: RequestStats }>('/api/system-metrics/requests');
      return data.data;
    },
    refetchInterval: refetchIntervalGetter(),
  }));
}

export function useRequestHistory(rangeGetter: () => HistoryRange) {
  return createQuery(() => ({
    queryKey: systemMetricsKeys.requestsHistory(rangeGetter()),
    queryFn: async () => {
      const { data } = await api.get<{ data: RequestHistory }>(
        '/api/system-metrics/requests/history',
        { params: { range: rangeGetter() } },
      );
      return data.data;
    },
    refetchInterval: 15000,
  }));
}
