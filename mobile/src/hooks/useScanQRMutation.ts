import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scannerApi } from '../api/scanner.api';

export const useScanQRMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ code, idempotencyKey }: { code: string; idempotencyKey: string }) => scannerApi.scanBarcode(code, idempotencyKey),
    onSuccess: () => {
      // Invalidate both wallet and user query after a successful scan
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
