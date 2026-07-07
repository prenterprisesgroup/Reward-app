export interface PlatformSettingsDTO {
  general: {
    maintenanceMode: boolean;
    supportEmail: string;
  };
  rewards: {
    minRewardAmount: number;
    maxRewardAmount: number;
  };
  withdrawals: {
    minWithdrawalAmount: number;
    dailyWithdrawalLimit: number;
  };
  featureFlags: {
    analyticsEnabled: boolean;
    reportsEnabled: boolean;
    notificationsEnabled: boolean;
  };
  version: number;
  updatedBy?: string;
  updatedAt?: string;
}

export type PermissionLevel = 'EDITABLE' | 'READ_ONLY' | 'HIDDEN';

export interface PlatformSettingsModel {
  general: {
    maintenanceMode: boolean;
    supportEmail: string;
  };
  rewards: {
    minRewardAmount: number;
    maxRewardAmount: number;
  };
  withdrawals: {
    minWithdrawalAmount: number;
    dailyWithdrawalLimit: number;
  };
  featureFlags: {
    analyticsEnabled: boolean;
    reportsEnabled: boolean;
    notificationsEnabled: boolean;
  };
  version: number;
  updatedAt: Date | null;
  
  // Future-proofing for field-level RBAC (can be populated dynamically based on role later)
  permissions: {
    general: PermissionLevel;
    rewards: PermissionLevel;
    withdrawals: PermissionLevel;
    featureFlags: PermissionLevel;
  };
}

export type UpdatePlatformSettingsPayload = Partial<PlatformSettingsDTO> & { version: number };
