import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { auditApi } from '../api/audit.api';
import { AuditFilters } from '../types/audit.types';

export const useAuditLogsQuery = (filters: AuditFilters, limit = 20) => {
  return useInfiniteQuery({
    queryKey: queryKeys.audit.global(filters),
    queryFn: async ({ pageParam = 1, signal }) => {
      return await auditApi.getGlobalLogs(pageParam as number, limit, filters, signal);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
