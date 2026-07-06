import { useMutation } from '@tanstack/react-query';
import { useToast } from './useToast';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';

export function useDownloadBatchPdfMutation() {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, batchName }: { id: string; batchName: string }) => {
      const url = `${apiClient.defaults.baseURL}${ENDPOINTS.ADMIN.BATCH_PDF(id)}`;
      const safeFileName = batchName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileUri = `${FileSystem.documentDirectory}${safeFileName}_QR_Codes.pdf`;
      const token = useAuthStore.getState().token;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/pdf',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
        headers,
      });

      if (downloadRes.status !== 200) {
        throw new Error('Failed to download PDF');
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${batchName} QR Codes`,
        });
      } else {
        showToast('', 'success');
      }
    },
    onSuccess: () => {
      showToast('', 'success');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Failed to download PDF';
      showToast('error', message);
    }
  });
}
