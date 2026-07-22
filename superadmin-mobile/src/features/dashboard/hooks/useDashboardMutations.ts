import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { queryKeys } from '../../../api/queryKeys';
import { useGlobalToastStore } from '../../../store/useGlobalToastStore';

export const useApproveWithdrawalMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useGlobalToastStore(state => state.showToast);

  return useMutation({
    mutationFn: (id: string) => dashboardApi.approveWithdrawal(id),
    onSuccess: () => {
      showToast('Withdrawal approved successfully', 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.pendingWithdrawals });
    },
    onError: (err: any) => {
      showToast(`Failed to approve withdrawal. ${err?.response?.data?.message || err?.message || ''}`, 'error');
    }
  });
};

export const useRejectWithdrawalMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useGlobalToastStore(state => state.showToast);

  return useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => dashboardApi.rejectWithdrawal(id, reason),
    onSuccess: () => {
      showToast('Withdrawal rejected successfully', 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.pendingWithdrawals });
    },
    onError: (err: any) => {
      showToast(`Failed to reject withdrawal. ${err?.response?.data?.message || err?.message || ''}`, 'error');
    }
  });
};
