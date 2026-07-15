import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

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

const fetchNotifications = async (category: string, filter: string, page: number, limit: number): Promise<NotificationsResponse> => {
  const params: any = { page, limit };
  if (category !== 'ALL') params.category = category;
  if (filter === 'UNREAD') params.isRead = 'false';

  const { data } = await apiClient.get(ENDPOINTS.SYSTEM.NOTIFICATIONS, { params });
  return data;
};

export function useNotificationsInfiniteQuery(category: string = 'ALL', filter: string = 'ALL', limit: number = 20) {
  return useInfiniteQuery<NotificationsResponse, Error>({
    queryKey: ['notifications', 'list', category, filter, limit],
    queryFn: ({ pageParam = 1 }) => fetchNotifications(category, filter, pageParam as number, limit),
    getNextPageParam: (lastPage) => lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    refetchInterval: (query) => {
      // Adaptive polling from meta payload
      return query.state.data?.pages[0]?.meta?.pollingInterval || 15000;
    },
    refetchIntervalInBackground: false,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(ENDPOINTS.SYSTEM.NOTIFICATIONS_READ(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.patch(ENDPOINTS.SYSTEM.NOTIFICATIONS_READ_ALL);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(ENDPOINTS.SYSTEM.NOTIFICATIONS_DELETE(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}
