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

  getRecentActivity: async (page: number = 1, limit: number = 20, signal?: AbortSignal): Promise<RawActivityResponse> => {
    const response = await apiClient.get<RawActivityResponse>(ENDPOINTS.SUPER_ADMIN.GLOBAL_ACTIVITY, { 
      params: { page, limit },
      signal 
    });
    // analytics.controller returns { success, data: { pages: [...] }, meta }
    return (response.data as any).data;
  },

  getPendingWithdrawals: async (page: number = 1, limit: number = 10, signal?: AbortSignal): Promise<RawPendingWithdrawalsResponse> => {
    const response = await apiClient.get<RawPendingWithdrawalsResponse>(ENDPOINTS.SUPER_ADMIN.GLOBAL_WITHDRAWALS, {
      params: { status: 'PENDING', page, limit },
      signal
    });
    return response.data;
  },

  approveWithdrawal: async (id: string) => {
    const response = await apiClient.post(`/api/v1/admin/withdrawals/${id}/approve`, {});
    return response.data;
  },

  rejectWithdrawal: async (id: string, reason: string) => {
    const response = await apiClient.post(`/api/v1/admin/withdrawals/${id}/reject`, { reason });
    return response.data;
  }
};
