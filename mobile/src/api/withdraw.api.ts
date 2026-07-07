import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export const withdrawApi = {
  withdrawFunds: async (payload: { amount: number; upiId?: string; company: string; idempotencyKey?: string }) => {
    const { data } = await apiClient.post(
      ENDPOINTS.SYSTEM.WITHDRAW,
      {
        amount: payload.amount,
        upiId: payload.upiId,
        company: payload.company,
      },
      {
        headers: {
          ...(payload.idempotencyKey ? { 'idempotency-key': payload.idempotencyKey } : {}),
        },
      }
    );

    return data;
  }
};
