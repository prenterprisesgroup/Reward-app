import { useInfiniteQuery } from '@tanstack/react-query';
import { adminApi, WithdrawalsResponse } from '../api/admin.api';

export function usePaymentRequestsQuery(
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID',
  search?: string,
  filters?: any,
  limit: number = 20
) {
  return useInfiniteQuery<WithdrawalsResponse, Error>({
    queryKey: ['payment-requests', status, search, filters, limit],
    queryFn: ({ pageParam = 1 }) => 
      adminApi.getPaymentRequests(status, pageParam as number, limit, search, filters),
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: 2,
    keepPreviousData: true,
  });
}
