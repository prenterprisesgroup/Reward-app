import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export const withdrawApi = {
  withdrawFunds: async (payload: { amount: number; upiId: string; company: string }) => {
    const { data } = await apiClient.post(ENDPOINTS.SYSTEM.WITHDRAW, payload);
    return data;
  }
};
