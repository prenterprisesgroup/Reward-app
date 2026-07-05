import { useQuery } from '@tanstack/react-query';
import { workersApi } from '../api/workers.api';

export const useWorkerDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: ['worker', id],
    queryFn: () => workersApi.getWorkerDetails(id),
    enabled: !!id,
  });
};
