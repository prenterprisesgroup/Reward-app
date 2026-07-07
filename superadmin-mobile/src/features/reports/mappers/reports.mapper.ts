import { ReportJobDTO, ReportJobModel } from '../types/reports.types';

export class ReportsMapper {
  
  private static formatReportTitle(type: string): string {
    const formatted = type.replace(/_/g, ' ').toLowerCase();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1) + ' Report';
  }

  static toModel(dto: ReportJobDTO): ReportJobModel {
    return {
      id: dto._id,
      reportType: dto.reportType,
      status: dto.status,
      format: dto.format,
      progress: dto.progress || 0,
      failureReason: dto.failureReason || null,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
      completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
      createdAt: new Date(dto.createdAt),
      
      isDownloadable: dto.status === 'COMPLETED',
      isProcessing: dto.status === 'PENDING' || dto.status === 'PROCESSING',
      isFailed: dto.status === 'FAILED',
      displayTitle: this.formatReportTitle(dto.reportType)
    };
  }

  static toModels(dtos: ReportJobDTO[]): ReportJobModel[] {
    if (!dtos || !Array.isArray(dtos)) return [];
    return dtos.map(dto => this.toModel(dto));
  }
}
