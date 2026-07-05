import { useMutation, useQueryClient } from '@tanstack/react-query';
import { barcodeBatchesApi, UpdateBarcodeBatchPayload } from '../api/barcode-batches.api';
import { useToast } from './useToast';

export function useUpdateBarcodeBatchMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBarcodeBatchPayload }) => 
      barcodeBatchesApi.updateBarcodeBatch(id, payload),
    retry: false, // Prevent duplicate update calls
    onSuccess: (_, variables) => {
      // Invalidate relevant queries as per enterprise architecture
      queryClient.invalidateQueries({ queryKey: ['barcode-batches'] });
      queryClient.invalidateQueries({ queryKey: ['barcode-batch', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-activity'] });

      showToast('success', 'Batch updated successfully!');
    },
    onError: (error: any) => {
      // Global error handling mapping to user-friendly toast
      const message = error?.response?.data?.message || error.message || 'Failed to update batch';
      showToast('error', message);
    },
  });
}
