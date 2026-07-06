export const queryKeys = {
  superAdmin: {
    dashboard: ['super-admin', 'dashboard'] as const,
    activity: ['super-admin', 'activity'] as const,
    pendingWithdrawals: ['super-admin', 'pending-withdrawals'] as const,
  },
  // Future modules can extend this factory:
  // company: {
  //   list: ['company', 'list'] as const,
  //   details: (id: string) => ['company', 'details', id] as const,
  // },
};
