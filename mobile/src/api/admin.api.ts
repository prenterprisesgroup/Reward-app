import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface CompanyInfo {
  id: string;
  name: string;
  logo: string | null;
}

export interface DashboardStats {
  totalWorkers: number;
  activeWorkers: number;
  pendingWithdrawals: number;
  qrBatchCount: number;
  rewardsDistributed: number;
  todayRewards: number;
  thisWeekRewards: number;
  thisMonthRewards: number;
}

export interface DashboardTrends {
  workers: string;
  withdrawals: string;
  rewards: string;
  batches: string;
}

export interface DashboardStatsResponse {
  company: CompanyInfo;
  stats: DashboardStats;
  trends: DashboardTrends;
}

export interface ActivityItem {
  id: string;
  type: 'QR_SCAN' | 'WITHDRAW_REQUEST' | 'REWARD_DISTRIBUTED' | 'MANUAL_REWARD';
  worker: string;
  workerAvatar: string | null;
  amount: string;
  batch: string | null;
  timestamp: string;
  status: string;
  company: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

export interface PendingWithdrawal {
  id: string;
  worker: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
  amount: number;
  upiId: string;
  status: string;
  createdAt: string;
}

export interface WithdrawalsResponse {
  withdrawals: PendingWithdrawal[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.DASHBOARD_STATS);
    return response.data;
  },

  getRecentActivity: async (page = 1, limit = 20): Promise<PaginatedResponse<ActivityItem>> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.DASHBOARD_ACTIVITY, {
      params: { page, limit }
    });
    return response.data;
  },

  getPendingWithdrawals: async (page = 1, limit = 20): Promise<WithdrawalsResponse> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.PENDING_WITHDRAWALS, {
      params: { status: 'PENDING', page, limit }
    });
    return response.data;
  },

  getPaymentRequests: async (
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID',
    page = 1,
    limit = 20,
    search?: string,
    filters?: any
  ): Promise<WithdrawalsResponse> => {
    const params: any = { status, page, limit };
    if (search) params.search = search;
    // Apply additional backend filters if supported
    if (filters && filters.dateFilter) params.dateFilter = filters.dateFilter;
    if (filters && filters.sort) params.sort = filters.sort;

    const response = await apiClient.get(ENDPOINTS.ADMIN.PAYMENT_REQUESTS, { params });
    return response.data;
  },

  approveWithdrawal: async (id: string): Promise<any> => {
    const idempotencyKey = `approve-${id}-${Date.now()}`;
    const response = await apiClient.post(ENDPOINTS.ADMIN.APPROVE_WITHDRAWAL(id), {}, {
      headers: { 'idempotency-key': idempotencyKey }
    });
    return response.data;
  },

  rejectWithdrawal: async (id: string, reason?: string): Promise<any> => {
    const idempotencyKey = `reject-${id}-${Date.now()}`;
    const response = await apiClient.post(ENDPOINTS.ADMIN.REJECT_WITHDRAWAL(id), { reason }, {
      headers: { 'idempotency-key': idempotencyKey }
    });
    return response.data;
  }
};
