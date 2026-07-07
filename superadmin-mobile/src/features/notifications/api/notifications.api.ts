import { apiClient } from '../../../api/client';
import { 
  NotificationFilters, 
  NotificationLogModel, 
  TemplateModel,
  RecipientModel 
} from '../types/notifications.types';
import { NotificationsMapper } from '../mappers/notifications.mapper';

export const notificationsApi = {
  getHistory: async (
    page: number, 
    limit: number, 
    filters: NotificationFilters, 
    signal?: AbortSignal
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.status) params.append('status', filters.status);
    if (filters.channel) params.append('channel', filters.channel);
    if (filters.recipient) params.append('recipient', filters.recipient);

    const response = await apiClient.get<any>(`/api/v1/notifications/history?${params.toString()}`, { signal });
    
    return {
      data: response.data.data.map(NotificationsMapper.toLogModel) as NotificationLogModel[],
      pagination: response.data.pagination
    };
  },

  getTemplates: async (signal?: AbortSignal) => {
    const response = await apiClient.get<any>('/api/v1/notifications/templates', { signal });
    return response.data.data.map(NotificationsMapper.toTemplateModel) as TemplateModel[];
  },

  searchRecipients: async (search: string, signal?: AbortSignal): Promise<RecipientModel[]> => {
    if (!search || search.length < 2) return [];
    
    // We leverage the admin users endpoint for searching recipients
    const response = await apiClient.get<any>(`/api/v1/admin/users?search=${encodeURIComponent(search)}`, { signal });
    return response.data.data.map((user: any) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    }));
  },

  sendEmail: async (payload: { recipientId: string, templateId: string, variables?: Record<string, string> }) => {
    return await apiClient.post('/api/v1/notifications/email', payload);
  },

  sendSMS: async (payload: { recipientId: string, templateId: string, variables?: Record<string, string> }) => {
    return await apiClient.post('/api/v1/notifications/sms', payload);
  },

  sendPush: async (payload: { recipientId: string, templateId: string, variables?: Record<string, string> }) => {
    return await apiClient.post('/api/v1/notifications/push', payload);
  }
};
