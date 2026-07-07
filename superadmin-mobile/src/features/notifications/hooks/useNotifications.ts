import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { notificationsApi } from '../api/notifications.api';
import { NotificationFilters, NotificationChannel } from '../types/notifications.types';

export const useNotificationHistoryQuery = (filters: NotificationFilters, limit = 20) => {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.history(filters),
    queryFn: async ({ pageParam = 1, signal }) => {
      return await notificationsApi.getHistory(pageParam as number, limit, filters, signal);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    // Intelligent Polling: Only poll if any item on the visible pages is QUEUED or PROCESSING
    refetchInterval: (query) => {
      const hasPending = query.state.data?.pages?.some(page => 
        page.data.some(log => log.status === 'QUEUED' || log.status === 'PROCESSING')
      );
      return hasPending ? 5000 : false;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTemplatesQuery = () => {
  return useQuery({
    queryKey: queryKeys.notifications.templates(),
    queryFn: async ({ signal }) => {
      return await notificationsApi.getTemplates(signal);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useRecipientSearchQuery = (search: string) => {
  return useQuery({
    queryKey: queryKeys.notifications.recipients(search),
    queryFn: async ({ signal }) => {
      return await notificationsApi.searchRecipients(search, signal);
    },
    enabled: search.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSendNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      channel, 
      recipientId, 
      templateId, 
      variables 
    }: { 
      channel: NotificationChannel, 
      recipientId: string, 
      templateId: string, 
      variables?: Record<string, string> 
    }) => {
      switch (channel) {
        case 'EMAIL':
          return await notificationsApi.sendEmail({ recipientId, templateId, variables });
        case 'SMS':
          return await notificationsApi.sendSMS({ recipientId, templateId, variables });
        case 'PUSH':
          return await notificationsApi.sendPush({ recipientId, templateId, variables });
      }
    },
    onSuccess: () => {
      // Invalidate history to load the new QUEUED notification
      queryClient.invalidateQueries({ queryKey: ['notifications', 'history'] });
    }
  });
};
