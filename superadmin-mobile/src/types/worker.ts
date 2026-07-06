export enum WorkerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export type WorkerVerificationStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export interface Worker {
  _id: string;
  workerId: string;
  name: string;
  phone: string;
  profilePhoto?: string;
  walletBalance: number;
  pendingWithdrawal: number;
  totalEarned: number;
  status: WorkerStatus;
  verificationStatus: WorkerVerificationStatus;
}

export interface WorkerStats {
  totalWorkers: number;
  activeToday: number;
  rewardsDistributed: number;
}
