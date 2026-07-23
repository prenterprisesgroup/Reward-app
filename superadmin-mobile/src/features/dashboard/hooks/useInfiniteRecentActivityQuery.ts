import { useInfiniteQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardMapper } from '../mappers/dashboard.mapper';
import { queryKeys } from '../../../api/queryKeys';
import { useGlobalToastStore } from '../../../store/useGlobalToastStore';
import axios from 'axios';

export const useInfiniteRecentActivityQuery = () => {
  const showToast = useGlobalToastStore(state => state.showToast);

  return useInfiniteQuery({
    queryKey: [...queryKeys.superAdmin.activity, 'infinite'],
    queryFn: async ({ pageParam = 1, signal }) => {
      try {
        const limit = 20;
        const rawData = await dashboardApi.getRecentActivity(pageParam, limit, signal);
        
        // Pass the raw data but we only want the mapped items.
        // We know rawData has structure: { pages: [{items: []}], page, limit, total, hasNextPage }
        // The dashboardMapper takes the whole rawData, but since we are fetching a specific page,
        // it still maps correctly if the items are inside pages[0].items
        const mappedItems = dashboardMapper.toRecentActivity(rawData);

        return {
          items: mappedItems,
          nextPage: (rawData as any)?.hasNextPage ? pageParam + 1 : undefined,
        };
      } catch (error) {
        if (!axios.isCancel(error)) {
          showToast('Failed to load activity.', 'error');
        }
        throw error;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 30 * 1000,
  });
};
