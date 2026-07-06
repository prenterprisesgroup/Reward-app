import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';

export const useUserQuery = () => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: walletApi.getMe,
  });
};

export const useWalletQuery = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
  });
};

export const useWalletBreakdownQuery = () => {
  return useQuery({
    queryKey: ['wallet', 'breakdown'],
    queryFn: walletApi.getWalletBreakdown,
  });
};
