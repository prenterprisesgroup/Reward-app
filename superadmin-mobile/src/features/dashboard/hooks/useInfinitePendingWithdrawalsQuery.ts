import { useInfiniteQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardMapper } from '../mappers/dashboard.mapper';
import { queryKeys } from '../../../api/queryKeys';
import { useGlobalToastStore } from '../../../store/useGlobalToastStore';
import axios from 'axios';

export const useInfinitePendingWithdrawalsQuery = () => {
  const showToast = useGlobalToastStore(state => state.showToast);

  return useInfiniteQuery({
    queryKey: [...queryKeys.superAdmin.pendingWithdrawals, 'infinite'],
    queryFn: async ({ pageParam = 1, signal }) => {
      try {
        const limit = 20;
        const rawData = await dashboardApi.getPendingWithdrawals(pageParam, limit, signal);
        
        const mappedItems = dashboardMapper.toPendingWithdrawals(rawData);

        return {
          items: mappedItems,
          nextPage: rawData?.pagination?.hasNextPage ? pageParam + 1 : undefined,
        };
      } catch (error) {
        if (!axios.isCancel(error)) {
          showToast('Failed to load withdrawals.', 'error');
        }
        throw error;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 30 * 1000,
  });
};
