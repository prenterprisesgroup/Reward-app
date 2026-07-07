import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { systemHealthApi } from '../api/system-health.api';
import { SystemHealthMapper } from '../mappers/system-health.mapper';
import { DeepHealthModel, QueueMetricsModel } from '../types/system-health.types';

// Helper hook to track AppState for Adaptive Polling
const useAdaptivePolling = (intervalMs: number) => {
  const [isActive, setIsActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setIsActive(nextAppState === 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return isActive ? intervalMs : false;
};

export const useSystemHealthQuery = () => {
  // Poll every 30 seconds only if App is in Foreground
  const refetchInterval = useAdaptivePolling(30000);

  return useQuery<DeepHealthModel, Error>({
    queryKey: queryKeys.systemHealth.deep(),
    queryFn: async ({ signal }) => {
      const { data, uptime } = await systemHealthApi.getDeepHealth(signal);
      return SystemHealthMapper.toHealthModel(data, uptime);
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 10000, // 10 seconds stale time
    retry: 2,
  });
};

export const useQueueMetricsQuery = () => {
  // Poll every 15 seconds for queues as they change faster
  const refetchInterval = useAdaptivePolling(15000);

  return useQuery<QueueMetricsModel, Error>({
    queryKey: queryKeys.systemHealth.queues(),
    queryFn: async ({ signal }) => {
      const dto = await systemHealthApi.getQueueMetrics(signal);
      return SystemHealthMapper.toQueueMetricsModel(dto);
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 5000,
    retry: 2,
  });
};
