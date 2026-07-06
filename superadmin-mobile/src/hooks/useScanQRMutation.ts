import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scannerApi } from '../api/scanner.api';

export const useScanQRMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (code: string) => scannerApi.scanBarcode(code),
    onSuccess: () => {
      // Invalidate both wallet and user query after a successful scan
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
