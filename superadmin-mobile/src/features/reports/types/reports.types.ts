// Backend DTOs
export type ReportType = "COMPANIES" | "WORKERS" | "WITHDRAWALS" | "TRANSACTIONS" | "QR_BATCHES" | "AUDIT_LOGS";
export type ReportFormat = "CSV" | "EXCEL" | "PDF";
export type ReportStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface ReportJobDTO {
  _id: string;
  reportType: ReportType;
  status: ReportStatus;
  format: ReportFormat;
  progress: number;
  failureReason?: string;
  startedAt?: string;
  finishedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ReportHistoryResponseDTO {
  success: boolean;
  data: ReportJobDTO[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface GenerateReportPayloadDTO {
  reportType: ReportType;
  format: ReportFormat;
  filters?: Record<string, any>;
}

// Frontend Models
export interface ReportJobModel {
  id: string;
  reportType: ReportType;
  status: ReportStatus;
  format: ReportFormat;
  progress: number;
  failureReason: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  
  // Computed helpers for UI
  isDownloadable: boolean;
  isProcessing: boolean;
  isFailed: boolean;
  displayTitle: string;
}
