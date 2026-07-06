import { useInfiniteQuery } from '@tanstack/react-query';
import { workersApi, WorkerHistoryParams } from '../api/workers.api';

export const useWorkerWithdrawalHistoryQuery = (id: string, params?: Omit<WorkerHistoryParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['worker', id, 'withdrawals', params?.status, params?.startDate, params?.endDate],
    queryFn: ({ pageParam = 1 }) => workersApi.getWorkerWithdrawalHistory(id, { ...params, page: pageParam }),
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
