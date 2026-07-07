import { 
  DeepHealthDTO, 
  DeepHealthModel, 
  HealthStatus, 
  QueueMetricsDTO, 
  QueueMetricsModel 
} from '../types/system-health.types';

export class SystemHealthMapper {
  private static parseStatus(status?: string): HealthStatus {
    const validStatuses: HealthStatus[] = ['HEALTHY', 'WARNING', 'DEGRADED', 'CRITICAL', 'NOT_CONFIGURED'];
    const s = (status || 'CRITICAL').toUpperCase() as HealthStatus;
    return validStatuses.includes(s) ? s : 'CRITICAL';
  }

  static toHealthModel(dto: DeepHealthDTO | null, uptimeSeconds?: number): DeepHealthModel {
    if (!dto) {
      return {
        overallStatus: 'CRITICAL',
        healthScore: 0,
        services: [],
        resources: {
          cpu: { label: 'CPU', usagePercent: 0, usedLabel: '0%', totalLabel: '100%' },
          memory: { label: 'RAM', usagePercent: 0, usedLabel: '0 GB', totalLabel: '0 GB' },
          storage: { label: 'Storage', usagePercent: 0, usedLabel: '0 GB', totalLabel: '0 GB' },
        },
        uptimeLabel: 'Offline',
        lastUpdated: new Date()
      };
    }

    // Format Uptime
    const uptime = uptimeSeconds || 0;
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    let uptimeLabel = `${hours}h`;
    if (days > 0) uptimeLabel = `${days}d ${hours}h`;

    return {
      overallStatus: this.parseStatus(dto.overallStatus),
      healthScore: dto.healthScore || 0,
      
      services: [
        {
          name: 'MongoDB',
          status: this.parseStatus(dto.services?.database?.status),
          latency: dto.services?.database?.latency ?? null,
          message: dto.services?.database?.message ?? null,
        },
        {
          name: 'Redis',
          status: this.parseStatus(dto.services?.redis?.status),
          latency: dto.services?.redis?.latency ?? null,
          message: dto.services?.redis?.message ?? null,
        },
        {
          name: 'BullMQ',
          status: this.parseStatus(dto.queues?.status),
          latency: null,
          message: `Active Workers: ${dto.queues?.activeWorkers || 0}`,
        },
        {
          name: 'Cloudinary',
          status: this.parseStatus(dto.services?.cloudinary?.status),
          latency: dto.services?.cloudinary?.latency ?? null,
          message: dto.services?.cloudinary?.message ?? null,
        }
      ],
      
      resources: {
        cpu: {
          label: 'CPU Usage',
          usagePercent: dto.metrics?.cpu?.usagePercent || 0,
          usedLabel: `${Math.round(dto.metrics?.cpu?.usagePercent || 0)}%`,
          totalLabel: '100%',
        },
        memory: {
          label: 'RAM Usage',
          usagePercent: dto.metrics?.memory?.usagePercent || 0,
          usedLabel: `${(dto.metrics?.memory?.usedGB || 0).toFixed(1)} GB`,
          totalLabel: `${(dto.metrics?.memory?.totalGB || 0).toFixed(1)} GB`,
        },
        storage: {
          label: 'Disk Space',
          usagePercent: dto.storage?.usagePercent || 0,
          usedLabel: `${((dto.storage?.totalSpaceGB || 0) - (dto.storage?.freeSpaceGB || 0)).toFixed(1)} GB`,
          totalLabel: `${(dto.storage?.totalSpaceGB || 0).toFixed(1)} GB`,
        }
      },
      
      uptimeLabel,
      lastUpdated: new Date()
    };
  }

  static toQueueMetricsModel(dto: QueueMetricsDTO | null): QueueMetricsModel {
    if (!dto) {
      return { active: 0, waiting: 0, delayed: 0, failed: 0, total: 0, lastUpdated: new Date() };
    }
    
    return {
      active: dto.active || 0,
      waiting: dto.waiting || 0,
      delayed: dto.delayed || 0,
      failed: dto.failed || 0,
      total: dto.totalJobs || 0,
      lastUpdated: new Date()
    };
  }
}
