import { useMutation, useQueryClient } from '@tanstack/react-query';
import { barcodeBatchesApi, CreateBarcodeBatchPayload } from '../api/barcode-batches.api';
import { useToast } from './useToast';

export function useCreateBarcodeBatchMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: CreateBarcodeBatchPayload) => barcodeBatchesApi.createBarcodeBatch(data),
    retry: false, // duplicate submission prevention per requirement
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['barcode-batches'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-activity'] });

      showToast('success', 'Batch generated successfully!');
    },
    onError: (error: any) => {
      // Backend validation errors and other error handling
      const message = error?.response?.data?.message || error.message || 'Failed to create batch';
      showToast('error', message);
    },
  });
}
