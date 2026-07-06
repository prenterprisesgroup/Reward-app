import { useQuery } from '@tanstack/react-query';
import { barcodeBatchesApi } from '../api/barcode-batches.api';

export function useBatchScanDetailsQuery(id: string) {
  return useQuery({
    queryKey: ['batch-scan', id],
    queryFn: () => barcodeBatchesApi.getBatchScanDetails(id),
    enabled: !!id,
  });
}
