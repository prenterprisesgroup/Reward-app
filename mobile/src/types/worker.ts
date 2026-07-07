export enum WorkerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export type WorkerVerificationStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export interface Worker {
  _id: string;
  id?: string;
  workerId?: string;
  name: string;
  phone: string;
  profilePhoto?: string;
  profilePhotoUrl?: string;
  walletBalance: number;
  pendingWithdrawal?: number;
  pendingWithdrawalBalance?: number;
  totalEarned?: number;
  status?: WorkerStatus;
  verificationStatus?: WorkerVerificationStatus;
  isActive?: boolean;
}

export interface WorkerStats {
  totalWorkers: number;
  activeToday: number;
  rewardsDistributed: number;
}
