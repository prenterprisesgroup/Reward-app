import { apiClient } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { 
  RawDashboardStatsResponse, 
  RawActivityResponse, 
  RawPendingWithdrawalsResponse 
} from '../types/dashboard.types';

export const dashboardApi = {
  getStats: async (signal?: AbortSignal): Promise<RawDashboardStatsResponse> => {
    const response = await apiClient.get<RawDashboardStatsResponse>(ENDPOINTS.SUPER_ADMIN.DASHBOARD_SUMMARY, { signal });
    return response.data;
  },

  getRecentActivity: async (limit: number = 20, signal?: AbortSignal): Promise<RawActivityResponse> => {
    const response = await apiClient.get<RawActivityResponse>(ENDPOINTS.SUPER_ADMIN.GLOBAL_ACTIVITY, { 
      params: { limit },
      signal 
    });
    return response.data;
  },

  getPendingWithdrawals: async (signal?: AbortSignal): Promise<RawPendingWithdrawalsResponse> => {
    // We only fetch first page with a reasonable limit for dashboard summary
    const response = await apiClient.get<RawPendingWithdrawalsResponse>(ENDPOINTS.SUPER_ADMIN.GLOBAL_WITHDRAWALS, {
      params: { status: 'PENDING', page: 1, limit: 10 },
      signal
    });
    return response.data;
  }
};
