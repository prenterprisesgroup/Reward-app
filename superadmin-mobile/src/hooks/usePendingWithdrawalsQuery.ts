import { useInfiniteQuery } from '@tanstack/react-query';
import { adminApi, WithdrawalsResponse } from '../api/admin.api';

export function usePendingWithdrawalsQuery(limit: number = 20) {
  return useInfiniteQuery<WithdrawalsResponse, Error>({
    queryKey: ['admin', 'pending-withdrawals', limit],
    queryFn: ({ pageParam = 1 }) => adminApi.getPendingWithdrawals(pageParam as number, limit),
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: 2,
  });
}
