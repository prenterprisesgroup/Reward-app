import { useInfiniteQuery } from '@tanstack/react-query';
import { workersApi, WorkersParams } from '../api/workers.api';

export const useWorkersQuery = (params?: Omit<WorkersParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['workers', params?.search, params?.status],
    queryFn: async ({ pageParam = 1 }) => {
      // The current backend GET /workers returns { workers: [...] } without pagination or status filtering.
      // We wrap it in our standard format and do local status filtering if needed.
      const res = await workersApi.getWorkers({ search: params?.search });
      
      let filtered = res.workers || [];
      if (params?.status && params.status.toUpperCase() !== 'ALL') {
        filtered = filtered.filter((w: any) => 
          (w.status || '').toUpperCase() === params.status?.toUpperCase() ||
          (params.status?.toUpperCase() === 'ACTIVE' && w.isActive) ||
          (params.status?.toUpperCase() === 'INACTIVE' && !w.isActive)
        );
      }

      return {
        data: filtered,
        pagination: {
          page: 1,
          limit: filtered.length,
          total: filtered.length,
          totalPages: 1,
          hasNextPage: false,
        }
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};
