export interface PaginationDTO {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface RecipientDTO {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface TemplateDTO {
  _id: string;
  name: string;
  subject: string;
  body: string; // Typically containing {{variables}}
  type: string;
  status: string;
}

export interface NotificationLogDTO {
  _id: string;
  channel: string; // EMAIL, SMS, PUSH
  status: string; // QUEUED, PROCESSING, SENT, FAILED
  recipient: RecipientDTO | string | null;
  template: TemplateDTO | string | null;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Frontend Models
export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';
export type NotificationStatus = 'QUEUED' | 'PROCESSING' | 'SENT' | 'FAILED';

export interface RecipientModel {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface TemplateModel {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  status: string;
}

export interface NotificationLogModel {
  id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipientName: string;
  templateName: string;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationFilters {
  status?: string;
  channel?: string;
  recipient?: string;
}
