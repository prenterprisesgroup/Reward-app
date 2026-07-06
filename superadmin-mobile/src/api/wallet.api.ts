import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export const walletApi = {
  getMe: async () => {
    const { data } = await apiClient.get(ENDPOINTS.AUTH.ME);
    return data;
  },
  getWallet: async () => {
    const { data } = await apiClient.get(ENDPOINTS.SYSTEM.WALLET);
    return data;
  },
  getWalletBreakdown: async () => {
    const { data } = await apiClient.get(ENDPOINTS.SYSTEM.WALLET_BREAKDOWN);
    return data;
  },
  updateUpi: async (data: { upiId: string }) => {
    const response = await apiClient.patch(ENDPOINTS.SYSTEM.WALLET_UPI, data);
    return response.data;
  }
};
