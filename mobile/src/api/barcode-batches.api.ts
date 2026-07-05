import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { QRBatch } from '../components/admin/QRBatchCard';

export interface GetBarcodeBatchesParams {
  search?: string;
  status?: string | null;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateBarcodeBatchPayload {
  batchName: string;
  rewardPerQR: number;
  totalQRCodes: number;
  description?: string;
  expiresAt?: string;
}

export interface UpdateBarcodeBatchPayload {
  productName?: string;
  expiresAt?: string | null;
}

export const mapBatchToUpdatePayload = (batch: QRBatch): UpdateBarcodeBatchPayload => {
  return {
    productName: batch.batchName,
    expiresAt: batch.expiresAt,
  };
};

export interface PaginatedBarcodeBatchesResponse {
  batches: QRBatch[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetBatchScansParams {
  filters: any;
  page?: number;
  limit?: number;
}

export interface PaginatedBatchScansResponse {
  scans: any[]; // Maps to BatchScan in component
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const barcodeBatchesApi = {
  getBarcodeBatches: async (params: GetBarcodeBatchesParams): Promise<PaginatedBarcodeBatchesResponse> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.BARCODE_BATCHES, { params });
    return response.data;
  },

  getBatchScans: async (params: GetBatchScansParams): Promise<PaginatedBatchScansResponse> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.BARCODE_BATCHES_SCANS, { params });
    return response.data;
  },

  getBatchScanDetails: async (id: string): Promise<any> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.BATCH_SCAN(id));
    return response.data;
  },

  getBarcodeBatch: async (id: string): Promise<QRBatch> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.BARCODE_BATCH(id));
    return response.data;
  },

  createBarcodeBatch: async (data: CreateBarcodeBatchPayload): Promise<QRBatch> => {
    const payload = {
      productName: data.batchName,
      rewardAmount: data.rewardPerQR,
      quantity: data.totalQRCodes,
      expiresAt: data.expiresAt,
    };
    const response = await apiClient.post(ENDPOINTS.ADMIN.BARCODE_BATCHES, payload);
    return response.data;
  },

  updateBarcodeBatch: async (id: string, payload: UpdateBarcodeBatchPayload): Promise<QRBatch> => {
    const response = await apiClient.patch(ENDPOINTS.ADMIN.BARCODE_BATCH(id), payload);
    return response.data;
  },

  duplicateBarcodeBatch: async (id: string): Promise<QRBatch> => {
    const response = await apiClient.post(ENDPOINTS.ADMIN.DUPLICATE_BATCH(id));
    return response.data;
  },

  deleteBarcodeBatch: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.ADMIN.BARCODE_BATCH(id));
  },

  downloadBatchPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.BATCH_PDF(id), {
      responseType: 'blob',
    });
    return response.data;
  }
};
