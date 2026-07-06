import { useInfiniteQuery } from '@tanstack/react-query';
import { adminApi, ActivityItem, PaginatedResponse } from '../api/admin.api';

export const useRecentActivityQuery = (limit = 10) => {
  return useInfiniteQuery<PaginatedResponse<ActivityItem>, Error>({
    queryKey: ['admin', 'activity', limit],
    queryFn: ({ pageParam = 1 }) => adminApi.getRecentActivity(pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 30, // 30 seconds
    retry: 2,
  });
};
