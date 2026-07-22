import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface SuperAdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  companyId?: string;
  role?: string;
}

export const superAdminApi = {
  getWorkers: async (params?: SuperAdminQueryParams) => {
    const { data } = await apiClient.get(ENDPOINTS.SUPER_ADMIN.LIST_USERS, { 
      params: { ...params, role: 'WORKER' } 
    });
    return data;
  },

  getWorkerDetails: async (id: string) => {
    const { data } = await apiClient.get(`/api/v1/admin/users/${id}`);
    return data;
  },

  getQrBatches: async (params?: SuperAdminQueryParams) => {
    const { data } = await apiClient.get(ENDPOINTS.SUPER_ADMIN.QR_BATCHES, { params });
    return data;
  },

  getQrScans: async (params?: SuperAdminQueryParams) => {
    const { data } = await apiClient.get(ENDPOINTS.SUPER_ADMIN.QR_SCANS, { params });
    return data;
  },
};
