// Backend Raw Response Interfaces (DO NOT USE DIRECTLY IN UI)

export interface RawDashboardStatsResponse {
  totalCompanies: number;
  approvedCompanies: number;
  totalLabour: number;
  totalQrGenerated: number;
  totalQrRedeemed: number;
  totalRewardsDistributed: number;
  pendingWithdrawals: number;
}

export interface RawActivityItem {
  id: string;
  type: string;
  amount: number;
  status: string;
  timestamp: string;
  worker: string;
  company: string;
}

export interface RawActivityResponse {
  pages: Array<{
    items: RawActivityItem[];
  }>;
}

export interface RawWithdrawalWorker {
  _id: string;
  name?: string;
  phone?: string;
  profilePhoto?: string;
}

export interface RawWithdrawalCompany {
  _id: string;
  name?: string;
}

export interface RawWithdrawalItem {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  worker?: RawWithdrawalWorker;
  company?: RawWithdrawalCompany;
}

export interface RawPendingWithdrawalsResponse {
  withdrawals: RawWithdrawalItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

// Normalized Frontend Models (USE THESE IN UI)

export interface DashboardStats {
  totalCompanies: number;
  activeWorkers: number;
  qrGenerated: number;
  qrRedeemed: number;
  totalRewardsPaid: number;
  pendingWithdrawalsCount: number;
}

export interface RecentActivity {
  id: string;
  type: 'REWARD' | 'WITHDRAWAL' | 'UNKNOWN';
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'REJECTED' | 'FAILED' | 'UNKNOWN';
  timestamp: Date;
  workerName: string;
  companyName: string;
}

export interface PendingWithdrawal {
  id: string;
  amount: number;
  status: 'PENDING';
  requestDate: Date;
  worker: {
    id: string;
    name: string;
    phone: string;
  };
  companyName: string;
}
