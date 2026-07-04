import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';

export const useUpdateUpiMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { upiId: string }) => {
      return walletApi.updateUpi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
