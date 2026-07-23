
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

interface NotificationEndpoints {
  LIST: string;
  READ: (id: string) => string;
  READ_ALL: string;
  DELETE: (id: string) => string;
}

interface NotificationContextValue {
  apiClient: any; // AxiosInstance
  endpoints: NotificationEndpoints;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({
  apiClient,
  endpoints,
  children
}: {
  apiClient: any;
  endpoints: NotificationEndpoints;
  children: ReactNode;
}) => {
  // Centralized polling for unread count
  // We fetch only 1 item to keep the payload as light as possible,
  // we just need the meta.unreadCount from the server.
  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await apiClient.get(endpoints.LIST, {
        params: { page: 1, limit: 1, isRead: 'false' }
      });
      return data;
    },
    // Adaptive polling could be used, but we default to 15s for the badge
    refetchInterval: 15000, 
    refetchIntervalInBackground: false,
  });

  const unreadCount = data?.meta?.unreadCount || 0;

  const value = useMemo(
    () => ({ apiClient, endpoints, unreadCount }),
    [apiClient, endpoints, unreadCount]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

