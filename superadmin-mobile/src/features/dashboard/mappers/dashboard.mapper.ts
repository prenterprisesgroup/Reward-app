import {
  RawDashboardStatsResponse,
  RawActivityResponse,
  RawPendingWithdrawalsResponse,
  DashboardStats,
  RecentActivity,
  PendingWithdrawal
} from '../types/dashboard.types';

export const dashboardMapper = {
  toDashboardStats: (raw: RawDashboardStatsResponse | undefined): DashboardStats => {
    // Gracefully handle undefined or missing fields
    return {
      totalCompanies: raw?.totalCompanies ?? 0,
      activeWorkers: raw?.totalLabour ?? 0,
      qrGenerated: raw?.totalQrGenerated ?? 0,
      qrRedeemed: raw?.totalQrRedeemed ?? 0,
      totalRewardsPaid: raw?.totalRewardsDistributed ?? 0,
      pendingWithdrawalsCount: raw?.pendingWithdrawals ?? 0,
    };
  },

  toRecentActivity: (raw: RawActivityResponse | undefined): RecentActivity[] => {
    if (!raw?.pages || !Array.isArray(raw.pages) || raw.pages.length === 0) {
      return [];
    }

    const items = raw.pages[0]?.items || [];
    
    return items.map(item => {
      // Normalize activity type
      let normalizedType: RecentActivity['type'] = 'UNKNOWN';
      if (item.type === 'BARCODE_REWARD') normalizedType = 'REWARD';
      if (item.type === 'WITHDRAW_REQUEST') normalizedType = 'WITHDRAWAL';

      // Normalize status
      let normalizedStatus: RecentActivity['status'] = 'UNKNOWN';
      if (['PENDING', 'SUCCESS', 'REJECTED', 'FAILED'].includes(item.status)) {
        normalizedStatus = item.status as RecentActivity['status'];
      }

      return {
        id: item.id || Math.random().toString(36).substring(7),
        type: normalizedType,
        amount: Number(item.amount) || 0,
        status: normalizedStatus,
        timestamp: new Date(item.timestamp || Date.now()),
        workerName: item.worker || 'Unknown Worker',
        companyName: item.company || 'Unknown Company',
      };
    });
  },

  toPendingWithdrawals: (raw: RawPendingWithdrawalsResponse | undefined): PendingWithdrawal[] => {
    if (!raw?.withdrawals || !Array.isArray(raw.withdrawals)) {
      return [];
    }

    return raw.withdrawals.map(item => {
      const worker = (item.worker as any) || {};
      
      return {
        id: item._id || Math.random().toString(36).substring(7),
        amount: Number(item.amount) || 0,
        status: 'PENDING',
        requestDate: new Date(item.createdAt || Date.now()),
        worker: {
          id: worker._id || '',
          name: worker.name || 'Unknown Worker',
          phone: worker.phone || 'N/A',
        },
        companyName: item.company?.name || 'Unknown Company',
      };
    });
  }
};
