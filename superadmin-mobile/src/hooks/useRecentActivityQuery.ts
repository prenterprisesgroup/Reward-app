import { useInfiniteQuery } from '@tanstack/react-query';
import { adminApi, ActivityItem, PaginatedResponse } from '../api/admin.api';

export function useRecentActivityQuery(limit: number = 20) {
  return useInfiniteQuery<PaginatedResponse<ActivityItem>, Error>({
    queryKey: ['admin', 'activity', limit],
    queryFn: ({ pageParam = 1 }) => adminApi.getRecentActivity(pageParam as number, limit),
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: 2,
  });
}
