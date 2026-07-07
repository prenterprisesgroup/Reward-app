import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { reportsApi } from '../api/reports.api';
import { ReportsMapper } from '../mappers/reports.mapper';
import { GenerateReportPayloadDTO, ReportJobModel } from '../types/reports.types';
import { useGlobalToastStore } from '../../../store/useGlobalToastStore';

export const useReportsHistoryQuery = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.reports.history(filters),
    queryFn: async ({ signal }) => {
      const res = await reportsApi.getHistory(filters, signal);
      return {
        ...res,
        data: ReportsMapper.toModels(res.data)
      };
    },
    // We want to refetch relatively often to see processing updates (poll every 10s if active)
    refetchInterval: (query) => {
      // If there are any jobs processing/pending, poll every 5 seconds
      const hasPending = query.state.data?.data.some(job => job.isProcessing);
      return hasPending ? 5000 : false;
    },
    staleTime: 1000 * 30, // 30 sec
  });
};

export const useGenerateReportMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useGlobalToastStore(state => state.showToast);

  return useMutation({
    mutationFn: async (payload: GenerateReportPayloadDTO) => {
      return await reportsApi.generateReport(payload);
    },
    onSuccess: () => {
      showToast('Report generation started', 'success');
      // Invalidate to trigger a fresh list and start polling
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate report';
      showToast(message, 'error');
    }
  });
};

export const useDownloadReportMutation = () => {
  const showToast = useGlobalToastStore(state => state.showToast);

  return useMutation({
    mutationFn: async ({ id, format }: { id: string; format: string }) => {
      await reportsApi.downloadReportNative(id, format);
    },
    onSuccess: () => {
      showToast('Report downloaded successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to download report', 'error');
    }
  });
};
