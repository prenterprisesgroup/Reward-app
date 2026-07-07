import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { ScanResponseData } from '../types/backend.types';

export const scannerApi = {
  scanBarcode: async (code: string, idempotencyKey: string): Promise<ScanResponseData> => {
    const { data } = await apiClient.post<ScanResponseData>(ENDPOINTS.SYSTEM.BARCODE_SCAN, { code }, {
      headers: {
        'idempotency-key': idempotencyKey,
      },
    });
    return data;
  }
};
