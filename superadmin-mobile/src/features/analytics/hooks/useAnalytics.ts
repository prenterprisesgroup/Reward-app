import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { analyticsApi } from '../api/analytics.api';
import { AnalyticsMapper } from '../mappers/analytics.mapper';
import { AnalyticsTrendsModel, AnalyticsOverviewModel, TopCompanyModel } from '../types/analytics.types';

export const useAnalyticsTrendsQuery = (period: string = 'daily') => {
  return useQuery<AnalyticsTrendsModel, Error>({
    queryKey: queryKeys.analytics.trends(period),
    queryFn: async ({ signal }) => {
      const dto = await analyticsApi.getTrends(period, signal);
      return AnalyticsMapper.mapTrends(dto);
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useGrowthQuery = (period: string = '30d') => {
  return useQuery<AnalyticsOverviewModel, Error>({
    queryKey: queryKeys.analytics.growth(period),
    queryFn: async ({ signal }) => {
      try {
        const dto = await analyticsApi.getGrowth(period, signal);
        return AnalyticsMapper.mapGrowth(dto);
      } catch (err) {
        console.error('useGrowthQuery Error:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useTopCompaniesQuery = (period: string = '30d') => {
  return useQuery<TopCompanyModel[], Error>({
    queryKey: queryKeys.analytics.topCompanies(period),
    queryFn: async ({ signal }) => {
      const dto = await analyticsApi.getTopCompanies(period, signal);
      return AnalyticsMapper.mapTopCompanies(dto);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
