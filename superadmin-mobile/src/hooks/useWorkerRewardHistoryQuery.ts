import { useInfiniteQuery } from '@tanstack/react-query';
import { workersApi, WorkerHistoryParams } from '../api/workers.api';

export const useWorkerRewardHistoryQuery = (id: string, params?: Omit<WorkerHistoryParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['worker', id, 'reward-history', params?.startDate, params?.endDate],
    queryFn: ({ pageParam = 1 }) => workersApi.getWorkerRewardHistory(id, { ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!id,
  });
};
