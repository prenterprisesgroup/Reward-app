import apiClient from '../../../api/client';
import { AnalyticsTrendsDTO, AnalyticsGrowthDTO, TopCompanyDTO } from '../types/analytics.types';

export const analyticsApi = {
  getTrends: async (period: string = 'daily', signal?: AbortSignal): Promise<AnalyticsTrendsDTO> => {
    const response = await apiClient.get<{ success: boolean; data: AnalyticsTrendsDTO; meta: any }>(
      '/api/v1/analytics/trends',
      { params: { period }, signal }
    );
    return response.data.data;
  },

  getGrowth: async (period: string = '30d', signal?: AbortSignal): Promise<AnalyticsGrowthDTO> => {
    const response = await apiClient.get<{ success: boolean; data: AnalyticsGrowthDTO; meta: any }>(
      '/api/v1/analytics/growth',
      { params: { period }, signal }
    );
    return response.data.data;
  },

  getTopCompanies: async (period: string = '30d', signal?: AbortSignal): Promise<TopCompanyDTO[]> => {
    const response = await apiClient.get<{ success: boolean; data: TopCompanyDTO[]; meta: any }>(
      '/api/v1/analytics/top-companies',
      { params: { period, sortBy: 'rewards' }, signal }
    );
    return response.data.data;
  }
};
