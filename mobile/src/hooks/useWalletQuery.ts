import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';

export const useUserQuery = () => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: walletApi.getMe,
  });
};

export const useWalletQuery = (params?: { section?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: params ? ['wallet', params] : ['wallet'],
    queryFn: () => walletApi.getWallet(params),
  });
};

export const useWalletInfiniteQuery = (section: 'transactions' | 'withdrawals', limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['wallet', section, { limit }],
    queryFn: async ({ pageParam = 1 }) => {
      return walletApi.getWallet({ section, page: pageParam as number, limit });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
};

export const useWalletBreakdownQuery = () => {
  return useQuery({
    queryKey: ['wallet', 'breakdown'],
    queryFn: walletApi.getWalletBreakdown,
  });
};
