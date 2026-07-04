import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';
import { User } from '../store/useAuthStore';

interface MeResponse {
  user: User;
}

export const useUserQuery = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<MeResponse> => {
      return await walletApi.getMe();
    },
    staleTime: 5 * 60 * 1000,
  });
};
