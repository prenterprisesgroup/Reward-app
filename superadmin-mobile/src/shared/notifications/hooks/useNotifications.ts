
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotificationContext } from '../providers/NotificationProvider';

export interface InAppNotification {
  _id: string;
  title: string;
  message: string;
  category: 'SYSTEM' | 'REWARD' | 'PAYMENT' | 'QR' | 'COMPANY' | 'USER' | 'SECURITY' | 'ANNOUNCEMENT';
  iconType: 'GIFT' | 'WALLET_CHECK' | 'WALLET_X' | 'QR' | 'COMPANY' | 'USER' | 'SHIELD';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  action: 'OPEN_REWARD' | 'OPEN_WITHDRAWAL' | 'OPEN_QR_BATCH' | 'OPEN_COMPANY' | 'OPEN_WORKER' | 'OPEN_ANALYTICS' | 'OPEN_SETTINGS' | 'NONE';
  actionPayload: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: InAppNotification[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  meta: {
    unreadCount: number;
    pollingInterval: number;
    lastUpdated: string;
  };
}

export function useNotificationsInfiniteQuery(category: string = 'ALL', filter: string = 'ALL', limit: number = 20) {
  const { apiClient, endpoints } = useNotificationContext();
  
  return useInfiniteQuery<NotificationsResponse, Error>({
    queryKey: ['notifications', 'list', category, filter, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const params: any = { page: pageParam, limit };
      if (category !== 'ALL') params.category = category;
      if (filter === 'UNREAD') params.isRead = 'false';
    
      const { data } = await apiClient.get(endpoints.LIST, { params });
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    refetchInterval: (query: any) => {
      // Adaptive polling from meta payload
      return query.state.data?.pages[0]?.meta?.pollingInterval || 15000;
    },
    refetchIntervalInBackground: false,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  const { apiClient, endpoints } = useNotificationContext();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(endpoints.READ(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();
  const { apiClient, endpoints } = useNotificationContext();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.patch(endpoints.READ_ALL);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();
  const { apiClient, endpoints } = useNotificationContext();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(endpoints.DELETE(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

