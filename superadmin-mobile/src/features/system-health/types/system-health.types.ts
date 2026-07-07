export type HealthStatus = 'HEALTHY' | 'WARNING' | 'DEGRADED' | 'CRITICAL' | 'NOT_CONFIGURED';

// Backend DTOs
export interface ServiceHealthDTO {
  status: string;
  latency?: number;
  message?: string;
  details?: Record<string, any>;
}

export interface DeepHealthDTO {
  overallStatus: string;
  healthScore: number;
  services: {
    database: ServiceHealthDTO;
    redis: ServiceHealthDTO;
    cloudinary: ServiceHealthDTO;
  };
  queues: {
    status: string;
    activeWorkers: number;
    errorRate: number;
  };
  storage: {
    status: string;
    freeSpaceGB: number;
    totalSpaceGB: number;
    usagePercent: number;
  };
  metrics: {
    cpu: { usagePercent: number };
    memory: { usedGB: number; totalGB: number; usagePercent: number };
  };
  modules: {
    analytics: string;
    reports: string;
    notifications: string;
  };
}

export interface QueueMetricsDTO {
  totalJobs: number;
  active: number;
  waiting: number;
  delayed: number;
  failed: number;
  completed: number;
}

// Frontend Models
export interface ServiceHealthModel {
  name: string;
  status: HealthStatus;
  latency: number | null;
  message: string | null;
}

export interface SystemResourceModel {
  label: string;
  usagePercent: number;
  usedLabel: string;
  totalLabel: string;
}

export interface DeepHealthModel {
  overallStatus: HealthStatus;
  healthScore: number;
  
  services: ServiceHealthModel[];
  
  resources: {
    cpu: SystemResourceModel;
    memory: SystemResourceModel;
    storage: SystemResourceModel;
  };

  uptimeLabel: string;
  lastUpdated: Date;
}

export interface QueueMetricsModel {
  active: number;
  waiting: number;
  delayed: number;
  failed: number;
  total: number;
  lastUpdated: Date;
}
