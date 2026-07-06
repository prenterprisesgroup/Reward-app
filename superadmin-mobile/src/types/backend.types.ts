export interface UserData {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export interface RewardTransaction {
  id: string;
  companyName: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface PendingWithdrawal {
  id: string;
  companyName: string;
  amount: number;
  status: 'PENDING';
  date: string;
  upiId?: string;
}

export interface WalletData {
  balance: number;
  todayEarnings: number;
  lastUpdated: string;
  recentRewards?: RewardTransaction[];
  pendingWithdrawals?: PendingWithdrawal[];
}

export interface ScanResponseData {
  companyName: string;
  productName: string;
  rewardAmount: number;
  newWalletBalance: number;
  timestamp: string;
}
