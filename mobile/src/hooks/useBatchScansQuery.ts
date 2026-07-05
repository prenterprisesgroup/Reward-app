import { useInfiniteQuery } from '@tanstack/react-query';
import { barcodeBatchesApi, GetBatchScansParams } from '../api/barcode-batches.api';

export function useBatchScansQuery(params: Omit<GetBatchScansParams, 'page' | 'limit'>) {
  return useInfiniteQuery({
    queryKey: ['batch-scans', params],
    queryFn: ({ pageParam = 1 }) => 
      barcodeBatchesApi.getBatchScans({
        ...params,
        page: pageParam,
        limit: 15,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
