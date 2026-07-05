import { useInfiniteQuery } from '@tanstack/react-query';
import { barcodeBatchesApi, GetBarcodeBatchesParams } from '../api/barcode-batches.api';

export function useBarcodeBatchesQuery(params: Omit<GetBarcodeBatchesParams, 'page' | 'limit'>) {
  return useInfiniteQuery({
    queryKey: ['barcode-batches', params],
    queryFn: ({ pageParam = 1 }) => 
      barcodeBatchesApi.getBarcodeBatches({
        ...params,
        page: pageParam,
        limit: 10,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
