import { useQuery } from '@tanstack/react-query';
import { barcodeBatchesApi } from '../api/barcode-batches.api';

export function useBarcodeBatchDetailsQuery(id: string) {
  return useQuery({
    queryKey: ['barcode-batch', id],
    queryFn: () => barcodeBatchesApi.getBarcodeBatch(id),
    enabled: !!id,
  });
}
