import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { workersApi, WorkersParams } from '../api/workers.api';

export const useWorkersQuery = (params?: Omit<WorkersParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['workers', params?.search, params?.status],
    queryFn: ({ pageParam = 1 }) => workersApi.getWorkers({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 120 * 1000, // 2 minutes
    placeholderData: keepPreviousData,
  });
};
