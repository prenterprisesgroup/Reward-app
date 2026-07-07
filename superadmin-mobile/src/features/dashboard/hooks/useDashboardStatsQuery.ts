import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardMapper } from '../mappers/dashboard.mapper';
import { queryKeys } from '../../../api/queryKeys';
import { useGlobalToastStore } from '../../../store/useGlobalToastStore';
import axios from 'axios';

export const useDashboardStatsQuery = () => {
  const showToast = useGlobalToastStore(state => state.showToast);

  return useQuery({
    queryKey: queryKeys.superAdmin.dashboard,
    queryFn: async ({ signal }) => {
      try {
        const rawData = await dashboardApi.getStats(signal);
        return dashboardMapper.toDashboardStats(rawData);
      } catch (error) {
        if (!axios.isCancel(error)) {
          showToast('Failed to load dashboard statistics.', 'error');
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
