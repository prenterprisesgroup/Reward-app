import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { apiClient } from '../../../api/client';
import { useAuthStore } from '../../../store/useAuthStore';
import { 
  GenerateReportPayloadDTO, 
  ReportHistoryResponseDTO 
} from '../types/reports.types';

export const reportsApi = {
  getHistory: async (filters: Record<string, any> = {}, signal?: AbortSignal): Promise<ReportHistoryResponseDTO> => {
    const response = await apiClient.get<ReportHistoryResponseDTO>(
      '/api/v1/reports/history',
      { params: filters, signal }
    );
    return response.data;
  },

  generateReport: async (payload: GenerateReportPayloadDTO, signal?: AbortSignal): Promise<{ jobId: string }> => {
    const response = await apiClient.post<{ data: { jobId: string } }>(
      '/api/v1/reports/generate',
      payload,
      { signal }
    );
    return response.data.data;
  },

  downloadReportNative: async (jobId: string, format: string): Promise<void> => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error("Authentication required for download");

    const baseURL = apiClient.defaults.baseURL || 'http://10.63.130.135:5000';
    const url = `${baseURL}/api/v1/reports/${jobId}/download`;
    
    // Choose appropriate extension
    let extension = 'csv';
    if (format === 'EXCEL') extension = 'xlsx';
    if (format === 'PDF') extension = 'pdf';

    const fileUri = `${(FileSystem as any).documentDirectory}report_${jobId}.${extension}`;

    // Download to local file system
    const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (downloadRes.status !== 200) {
      throw new Error(`Download failed with status ${downloadRes.status}`);
    }

    // Share/save it natively
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(downloadRes.uri, {
        dialogTitle: 'Download Report',
        UTI: format === 'PDF' ? 'com.adobe.pdf' : 'public.comma-separated-values-text'
      });
    } else {
      throw new Error("Sharing not available on this device");
    }
  }
};
