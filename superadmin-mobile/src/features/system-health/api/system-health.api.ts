import { apiClient } from '../../../api/client';
import { DeepHealthDTO, QueueMetricsDTO } from '../types/system-health.types';

export const systemHealthApi = {
  getDeepHealth: async (signal?: AbortSignal): Promise<{ data: DeepHealthDTO, uptime: number }> => {
    const response = await apiClient.get<{ success: boolean; data: DeepHealthDTO, meta: { uptime: number } }>(
      '/api/v1/system/health/deep',
      { signal }
    );
    return { data: response.data.data, uptime: response.data.meta?.uptime || 0 };
  },

  getQueueMetrics: async (signal?: AbortSignal): Promise<QueueMetricsDTO> => {
    const response = await apiClient.get<{ success: boolean; data: QueueMetricsDTO }>(
      '/api/v1/system/queues',
      { signal }
    );
    return response.data.data;
  }
};
