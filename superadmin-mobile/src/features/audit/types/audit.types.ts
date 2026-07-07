export interface PaginationDTO {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AuditLogDTO {
  id: string;
  action: string;
  company: {
    id: string;
    name: string;
    displayId: string;
  } | null;
  performedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  workerId?: string;
  beforeState: any;
  afterState: any;
  createdAt: string;
}

export interface AuditLogModel {
  id: string;
  action: string;
  actorName: string;
  actorRole: string | null;
  companyName: string | null;
  beforeState: Record<string, any> | null;
  afterState: Record<string, any> | null;
  timestamp: Date;
}

export interface AuditFilters {
  search?: string;
  action?: string;
  startDate?: string; // ISO String
  endDate?: string;   // ISO String
  companyId?: string;
}

export interface AuditResponseModel {
  data: AuditLogModel[];
  pagination: PaginationDTO;
}
