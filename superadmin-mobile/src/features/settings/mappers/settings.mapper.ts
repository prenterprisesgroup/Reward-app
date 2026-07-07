import { PlatformSettingsDTO, PlatformSettingsModel } from '../types/settings.types';

export class SettingsMapper {
  static toModel(dto: PlatformSettingsDTO | null): PlatformSettingsModel {
    // Defaults if backend returns empty or null somehow
    const safeDto = dto || {} as PlatformSettingsDTO;
    
    return {
      general: {
        maintenanceMode: safeDto.general?.maintenanceMode ?? false,
        supportEmail: safeDto.general?.supportEmail ?? 'support@example.com',
      },
      rewards: {
        minRewardAmount: safeDto.rewards?.minRewardAmount ?? 1,
        maxRewardAmount: safeDto.rewards?.maxRewardAmount ?? 10000,
      },
      withdrawals: {
        minWithdrawalAmount: safeDto.withdrawals?.minWithdrawalAmount ?? 100,
        dailyWithdrawalLimit: safeDto.withdrawals?.dailyWithdrawalLimit ?? 50000,
      },
      featureFlags: {
        analyticsEnabled: safeDto.featureFlags?.analyticsEnabled ?? true,
        reportsEnabled: safeDto.featureFlags?.reportsEnabled ?? true,
        notificationsEnabled: safeDto.featureFlags?.notificationsEnabled ?? true,
      },
      version: safeDto.version || 1,
      updatedAt: safeDto.updatedAt ? new Date(safeDto.updatedAt) : null,
      
      // Defaulting all to EDITABLE for now. Role logic can adjust this.
      permissions: {
        general: 'EDITABLE',
        rewards: 'EDITABLE',
        withdrawals: 'EDITABLE',
        featureFlags: 'EDITABLE',
      }
    };
  }

  static toPayload(model: Partial<PlatformSettingsModel>, currentVersion: number): Partial<PlatformSettingsDTO> & { version: number } {
    return {
      ...(model.general && { general: model.general }),
      ...(model.rewards && { rewards: model.rewards }),
      ...(model.withdrawals && { withdrawals: model.withdrawals }),
      ...(model.featureFlags && { featureFlags: model.featureFlags }),
      version: currentVersion
    };
  }
}
