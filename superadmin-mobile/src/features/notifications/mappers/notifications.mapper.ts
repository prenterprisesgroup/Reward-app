import { 
  NotificationLogDTO, 
  NotificationLogModel, 
  TemplateDTO, 
  TemplateModel,
  NotificationChannel,
  NotificationStatus
} from '../types/notifications.types';

export class NotificationsMapper {
  private static parseChannel(channel?: string): NotificationChannel {
    const valid: NotificationChannel[] = ['EMAIL', 'SMS', 'PUSH'];
    const c = (channel || '').toUpperCase() as NotificationChannel;
    return valid.includes(c) ? c : 'EMAIL';
  }

  private static parseStatus(status?: string): NotificationStatus {
    const valid: NotificationStatus[] = ['QUEUED', 'PROCESSING', 'SENT', 'FAILED'];
    const s = (status || '').toUpperCase() as NotificationStatus;
    return valid.includes(s) ? s : 'FAILED';
  }

  static toLogModel(dto: NotificationLogDTO): NotificationLogModel {
    let recipientName = 'Unknown User';
    if (dto.recipient && typeof dto.recipient === 'object' && dto.recipient.name) {
      recipientName = dto.recipient.name;
    }

    let templateName = 'Unknown Template';
    if (dto.template && typeof dto.template === 'object' && dto.template.name) {
      templateName = dto.template.name;
    }

    return {
      id: dto._id,
      channel: this.parseChannel(dto.channel),
      status: this.parseStatus(dto.status),
      recipientName,
      templateName,
      error: dto.error || null,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    };
  }

  static toTemplateModel(dto: TemplateDTO): TemplateModel {
    return {
      id: dto._id,
      name: dto.name || 'Unnamed',
      subject: dto.subject || 'No Subject',
      body: dto.body || '',
      type: dto.type || 'SYSTEM',
      status: dto.status || 'ACTIVE'
    };
  }
}
