import { useQuery } from '@tanstack/react-query';
import { adminApi, DashboardStatsResponse } from '../api/admin.api';

export function useAdminDashboardStatsQuery() {
  return useQuery<DashboardStatsResponse, Error>({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
  });
}
