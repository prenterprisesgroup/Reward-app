export const queryKeys = {
  superAdmin: {
    companies: {
      all: ['superAdmin', 'companies'] as const,
      list: (filters: Record<string, any>) => [...queryKeys.superAdmin.companies.all, 'list', filters] as const,
      detail: (id: string) => [...queryKeys.superAdmin.companies.all, 'detail', id] as const,
      activity: (id: string) => [...queryKeys.superAdmin.companies.all, 'activity', id] as const,
      stats: (id: string) => [...queryKeys.superAdmin.companies.all, 'stats', id] as const,
    },
    dashboard: ['superAdmin', 'dashboard'] as const,
  }
};
