import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface WorkersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface WorkerHistoryParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export const workersApi = {
  getWorkers: async (params?: WorkersParams) => {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.WORKERS, { params });
    return data;
  },

  getWorkerDetails: async (id: string) => {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.WORKER_DETAILS(id));
    return data;
  },

  getWorkerRewardHistory: async (id: string, params?: WorkerHistoryParams) => {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.WORKER_REWARDS(id), { params });
    return data;
  },

  getWorkerWithdrawalHistory: async (id: string, params?: WorkerHistoryParams) => {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.WORKER_WITHDRAWALS(id), { params });
    return data;
  },

  getWorkerQrActivity: async (id: string, params?: WorkerHistoryParams) => {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.WORKER_QR_ACTIVITY(id), { params });
    return data;
  },
};
