import { useMutation, useQueryClient } from '@tanstack/react-query';
import { barcodeBatchesApi } from '../api/barcode-batches.api';
import { useToast } from './useToast';

export function useDeleteBarcodeBatchMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => barcodeBatchesApi.deleteBarcodeBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcode-batches'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-activity'] });
      showToast('', 'success');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete batch';
      showToast('error', message);
    }
  });
}
