import { AuditLogDTO, AuditLogModel } from '../types/audit.types';

export class AuditMapper {
  static toModel(dto: AuditLogDTO): AuditLogModel {
    let actorName = 'System User';
    let actorRole: string | null = null;
    
    if (dto.performedBy) {
      actorName = dto.performedBy.name;
      actorRole = dto.performedBy.role;
    } else if (dto.workerId) {
      actorName = `Worker (${dto.workerId})`;
      actorRole = 'SYSTEM';
    }

    return {
      id: dto.id,
      action: dto.action,
      actorName,
      actorRole,
      companyName: dto.company ? dto.company.name : null,
      beforeState: dto.beforeState || null,
      afterState: dto.afterState || null,
      timestamp: new Date(dto.createdAt),
    };
  }
}
