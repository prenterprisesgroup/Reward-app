import { useMutation, useQueryClient } from '@tanstack/react-query';
import { withdrawApi } from '../api/withdraw.api';

export const useWithdrawMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: { amount: number; upiId?: string; company: string; idempotencyKey: string }) => withdrawApi.withdrawFunds(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    },
  });
};
