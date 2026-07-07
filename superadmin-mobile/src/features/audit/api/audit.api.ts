import { apiClient } from '../../../api/client';
import { AuditResponseModel, AuditFilters } from '../types/audit.types';
import { AuditMapper } from '../mappers/audit.mapper';

export const auditApi = {
  getGlobalLogs: async (
    page: number, 
    limit: number, 
    filters: AuditFilters, 
    signal?: AbortSignal
  ): Promise<AuditResponseModel> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.search) params.append('search', filters.search);
    if (filters.action) params.append('action', filters.action);
    if (filters.companyId) params.append('company', filters.companyId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get<any>(`/api/v1/audit-logs/global?${params.toString()}`, { signal });
    
    return {
      data: response.data.data.map(AuditMapper.toModel),
      pagination: response.data.pagination
    };
  }
};
