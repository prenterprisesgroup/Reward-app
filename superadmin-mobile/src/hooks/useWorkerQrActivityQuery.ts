import { useInfiniteQuery } from '@tanstack/react-query';
import { workersApi, WorkerHistoryParams } from '../api/workers.api';

export const useWorkerQrActivityQuery = (id: string, params?: Omit<WorkerHistoryParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['worker', id, 'qr-activity', params?.startDate, params?.endDate],
    queryFn: ({ pageParam = 1 }) => workersApi.getWorkerQrActivity(id, { ...params, page: pageParam }),
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
