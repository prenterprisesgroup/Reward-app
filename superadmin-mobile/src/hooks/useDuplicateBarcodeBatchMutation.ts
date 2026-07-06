import { useMutation, useQueryClient } from '@tanstack/react-query';
import { barcodeBatchesApi } from '../api/barcode-batches.api';
import { useToast } from './useToast';

export function useDuplicateBarcodeBatchMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => barcodeBatchesApi.duplicateBarcodeBatch(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['barcode-batches'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-activity'] });
      showToast('success', `Duplicated ${data.batchName} successfully!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to duplicate batch';
      showToast('error', message);
    }
  });
}
