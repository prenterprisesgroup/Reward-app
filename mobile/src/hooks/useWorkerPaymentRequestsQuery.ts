import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface WorkerWithdrawal {
  id: string;
  _id?: string;
  amount: number;
  upiId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface WorkerWithdrawalsResponse {
  withdrawals: WorkerWithdrawal[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

const fetchWorkerPaymentRequests = async (
  status: string,
  page: number,
  limit: number,
  search?: string
): Promise<WorkerWithdrawalsResponse> => {
  const params: any = { status, page, limit };
  if (search) params.search = search;

  const { data } = await apiClient.get(ENDPOINTS.SYSTEM.WITHDRAW, { params });
  return data;
};

export function useWorkerPaymentRequestsQuery(
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' = 'PENDING',
  search: string = '',
  limit: number = 20
) {
  return useInfiniteQuery<WorkerWithdrawalsResponse, Error>({
    queryKey: ['worker', 'payment-requests', status, search, limit],
    queryFn: ({ pageParam = 1 }) =>
      fetchWorkerPaymentRequests(status, pageParam as number, limit, search),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: 2,
  });
}
