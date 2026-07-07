import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardMapper } from '../mappers/dashboard.mapper';
import { queryKeys } from '../../../api/queryKeys';
import { useGlobalToastStore } from '../../../store/useGlobalToastStore';
import axios from 'axios';

export const usePendingWithdrawalsQuery = () => {
  const showToast = useGlobalToastStore(state => state.showToast);

  return useQuery({
    queryKey: queryKeys.superAdmin.pendingWithdrawals,
    queryFn: async ({ signal }) => {
      try {
        const rawData = await dashboardApi.getPendingWithdrawals(signal);
        return dashboardMapper.toPendingWithdrawals(rawData);
      } catch (error) {
        if (!axios.isCancel(error)) {
          showToast('Failed to load pending withdrawals.', 'error');
        }
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};
