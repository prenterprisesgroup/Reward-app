import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export const scannerApi = {
  scanBarcode: async (code: string, idempotencyKey: string) => {
    const { data } = await apiClient.post(ENDPOINTS.SYSTEM.BARCODE_SCAN, { code }, {
      headers: {
        'idempotency-key': idempotencyKey,
      },
    });
    return data;
  }
};
