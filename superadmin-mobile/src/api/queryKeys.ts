export const queryKeys = {
  superAdmin: {
    dashboard: ['super-admin', 'dashboard'] as const,
    activity: ['super-admin', 'activity'] as const,
    pendingWithdrawals: ['super-admin', 'pending-withdrawals'] as const,
    workers: (filters: Record<string, any>) => ['super-admin', 'workers', filters] as const,
    workerDetail: (id: string) => ['super-admin', 'worker', id] as const,
    qrBatches: (filters: Record<string, any>) => ['super-admin', 'qr-batches', filters] as const,
    qrScans: (filters: Record<string, any>) => ['super-admin', 'qr-scans', filters] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    activity: ['dashboard', 'activity'] as const,
    withdrawals: ['dashboard', 'withdrawals'] as const,
  },
  analytics: {
    trends: (period: string) => ['analytics', 'trends', period] as const,
    growth: (period: string) => ['analytics', 'growth', period] as const,
    topCompanies: (period: string) => ['analytics', 'top-companies', period] as const,
  },
  reports: {
    history: (filters: Record<string, any>) => ['reports', 'history', filters] as const,
  },
  settings: {
    all: () => ['settings', 'all'] as const,
    detail: () => ['settings', 'detail'] as const,
    featureFlags: () => ['settings', 'featureFlags'] as const,
    limits: () => ['settings', 'limits'] as const,
  },
  systemHealth: {
    deep: () => ['systemHealth', 'deep'] as const,
    queues: () => ['systemHealth', 'queues'] as const,
    infrastructure: () => ['systemHealth', 'infrastructure'] as const,
  },
  audit: {
    global: (filters: Record<string, any>) => ['audit', 'global', filters] as const,
    timeline: (entityType: string, entityId: string, filters: Record<string, any>) => ['audit', 'timeline', entityType, entityId, filters] as const,
  },
  notifications: {
    history: (filters: Record<string, any>) => ['notifications', 'history', filters] as const,
    templates: () => ['notifications', 'templates'] as const,
    queue: () => ['notifications', 'queue'] as const,
    recipients: (search: string) => ['notifications', 'recipients', search] as const,
  },
  // Future modules can extend this factory:
  // company: {
  //   list: ['company', 'list'] as const,
  //   details: (id: string) => ['company', 'details', id] as const,
  // },
};
