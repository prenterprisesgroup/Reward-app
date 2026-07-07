import {
  AnalyticsTrendsDTO,
  AnalyticsTrendsModel,
  AnalyticsGrowthDTO,
  AnalyticsOverviewModel,
  TopCompanyDTO,
  TopCompanyModel,
  TrendDataPointDTO,
  ChartDataPoint
} from '../types/analytics.types';

export class AnalyticsMapper {
  
  /**
   * Transforms raw trend arrays from backend to UI chart arrays.
   * STRICT RULE: Returns [] if array is empty. No fake points!
   */
  private static mapTrendArray(arr?: TrendDataPointDTO[]): ChartDataPoint[] {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      return [];
    }
    
    return arr.map(point => ({
      date: point._id,
      value: point.total || 0,
    }));
  }

  static mapTrends(dto?: AnalyticsTrendsDTO | null): AnalyticsTrendsModel {
    if (!dto) {
      return { rewards: [], withdrawals: [], companies: [] };
    }

    return {
      rewards: this.mapTrendArray(dto.rewards),
      withdrawals: this.mapTrendArray(dto.withdrawals),
      companies: this.mapTrendArray(dto.companies),
    };
  }

  static mapGrowth(dto?: AnalyticsGrowthDTO | null): AnalyticsOverviewModel {
    // Default safe fallback if endpoint returns null completely
    const fallbackMetric = { current: 0, previous: 0, change: 0, percentage: 0 };
    
    if (!dto) {
      return {
        companies: fallbackMetric,
        workers: fallbackMetric,
        rewards: fallbackMetric,
        batches: fallbackMetric,
      };
    }

    return {
      companies: dto.companies ?? fallbackMetric,
      workers: dto.workers ?? fallbackMetric,
      rewards: dto.rewards ?? fallbackMetric,
      batches: dto.batches ?? fallbackMetric,
    };
  }

  static mapTopCompanies(dto?: TopCompanyDTO[] | null): TopCompanyModel[] {
    if (!dto || !Array.isArray(dto) || dto.length === 0) {
      return [];
    }

    return dto.map(company => ({
      id: company.id,
      name: company.name,
      logoUrl: company.logo || undefined,
      value: company.value || 0,
      formattedValue: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(company.value || 0),
    }));
  }
}
