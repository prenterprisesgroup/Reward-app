import { apiClient } from '../../../api/client';
import { 
  BackendListResponse, 
  BackendCompanyListResponseItem,
  BackendCompanyDetailsResponse,
  BackendActivity,
  BackendCompanyWorker
} from '../types/company.types';

export interface GetCompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export interface CompanyStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
}

export const companiesApi = {
  createCompany: async (data: FormData, signal?: AbortSignal) => {
    const response = await apiClient.post('/api/v1/admin/companies', data, {
      signal,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCompanyStats: async (signal?: AbortSignal) => {
    const response = await apiClient.get<CompanyStats>('/api/v1/admin/companies/stats', {
      signal
    });
    return response.data;
  },

  getCompanies: async (params: GetCompaniesParams, signal?: AbortSignal) => {
    const response = await apiClient.get<BackendListResponse<BackendCompanyListResponseItem>>('/api/v1/admin/companies', { 
      params,
      signal 
    });
    return response.data;
  },

  getCompanyDetails: async (id: string, signal?: AbortSignal) => {
    const response = await apiClient.get<BackendCompanyDetailsResponse>(`/api/v1/admin/companies/${id}`, {
      signal
    });
    return response.data;
  },

  getCompanyActivity: async (id: string, params: { page?: number, limit?: number }, signal?: AbortSignal) => {
    const response = await apiClient.get<BackendListResponse<BackendActivity>>(`/api/v1/admin/companies/${id}/activity`, {
      params,
      signal
    });
    return response.data;
  },

  getCompanyWorkers: async (id: string, params: GetCompaniesParams, signal?: AbortSignal) => {
    const response = await apiClient.get<BackendListResponse<BackendCompanyWorker>>(`/api/v1/admin/companies/${id}/workers`, {
      params,
      signal
    });
    return response.data;
  },

  approveCompany: async (id: string) => {
    const response = await apiClient.post(`/api/v1/admin/companies/${id}/approve`, {});
    return response.data;
  },

  createCompanyAdmin: async (companyId: string, data: any) => {
    const response = await apiClient.post(`/api/v1/admin/companies/${companyId}/admins`, data);
    return response.data;
  },

  updateCompany: async (id: string, data: any) => {
    const response = await apiClient.put(`/api/v1/admin/companies/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  rejectCompany: async (id: string) => {
    const response = await apiClient.post(`/api/v1/admin/companies/${id}/reject`, {});
    return response.data;
  },

  suspendCompany: async (id: string) => {
    const response = await apiClient.post(`/api/v1/admin/companies/${id}/suspend`, {});
    return response.data;
  }
};
