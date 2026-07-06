import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, WithdrawalsResponse } from '../api/admin.api';

export function useRejectWithdrawalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string, reason?: string }) => adminApi.rejectWithdrawal(id, reason),
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['payment-requests', 'PENDING'] });
      await queryClient.cancelQueries({ queryKey: ['admin', 'dashboard'] });
      await queryClient.cancelQueries({ queryKey: ['admin', 'activity'] });

      // Snapshot the previous values
      const previousRequests = queryClient.getQueriesData({ queryKey: ['payment-requests', 'PENDING'] });
      const previousDashboard = queryClient.getQueryData(['admin', 'dashboard']);
      const previousActivity = queryClient.getQueriesData({ queryKey: ['admin', 'activity'] });

      let rejectedItem: any = null;

      // Optimistically update to the new value (Payment Requests)
      queryClient.setQueriesData(
        { queryKey: ['payment-requests', 'PENDING'] },
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: WithdrawalsResponse) => {
              const item = page.withdrawals.find(w => w.id === id || (w as any)._id === id);
              if (item) rejectedItem = item;
              return {
                ...page,
                withdrawals: page.withdrawals.filter(w => w.id !== id && (w as any)._id !== id),
              };
            })
          };
        }
      );

      // Optimistically update Dashboard stats (decrease pending count)
      if (previousDashboard) {
        queryClient.setQueryData(['admin', 'dashboard'], (old: any) => {
          if (!old?.stats) return old;
          return {
            ...old,
            stats: {
              ...old.stats,
              pendingWithdrawals: Math.max(0, old.stats.pendingWithdrawals - 1)
            }
          };
        });
      }

      // Optimistically update Activity timeline
      if (rejectedItem) {
        queryClient.setQueriesData(
          { queryKey: ['admin', 'activity'] },
          (oldData: any) => {
            if (!oldData || !oldData.pages) return oldData;
            
            const newActivity = {
              id: `opt-${Date.now()}`,
              type: 'WITHDRAW_REQUEST',
              worker: rejectedItem.worker.name,
              workerAvatar: rejectedItem.worker.profilePhoto || null,
              amount: rejectedItem.amount.toString(),
              timestamp: new Date().toISOString(),
              status: 'REJECTED',
              company: 'Company'
            };

            const newPages = [...oldData.pages];
            if (newPages.length > 0) {
              newPages[0] = {
                ...newPages[0],
                items: [newActivity, ...newPages[0].items]
              };
            }
            return { ...oldData, pages: newPages };
          }
        );
      }

      return { previousRequests, previousDashboard, previousActivity };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newTodo, context: any) => {
      if (context?.previousRequests) {
        context.previousRequests.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(['admin', 'dashboard'], context.previousDashboard);
      }
      if (context?.previousActivity) {
        context.previousActivity.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'activity'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-withdrawals'] });
    },
  });
}
