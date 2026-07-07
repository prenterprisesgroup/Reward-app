// Backend DTOs (What the API returns exactly)

export interface TrendDataPointDTO {
  _id: string; // The date string like "2026-07-07"
  total: number;
}

export interface AnalyticsTrendsDTO {
  rewards: TrendDataPointDTO[];
  withdrawals: TrendDataPointDTO[];
  companies: TrendDataPointDTO[];
}

export interface GrowthMetricDTO {
  current: number;
  previous: number;
  change: number;
  percentage: number;
}

export interface AnalyticsGrowthDTO {
  companies: GrowthMetricDTO;
  workers: GrowthMetricDTO;
  rewards: GrowthMetricDTO;
  batches: GrowthMetricDTO;
}

export interface TopCompanyDTO {
  id: string;
  name: string;
  logo: string | null;
  value: number;
}

// Frontend Normalized Models (What the UI consumes)

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface AnalyticsTrendsModel {
  rewards: ChartDataPoint[];
  withdrawals: ChartDataPoint[];
  companies: ChartDataPoint[];
}

export interface AnalyticsOverviewModel {
  companies: GrowthMetricDTO;
  workers: GrowthMetricDTO;
  rewards: GrowthMetricDTO;
  batches: GrowthMetricDTO;
}

export interface TopCompanyModel {
  id: string;
  name: string;
  logoUrl: string | undefined;
  value: number;
  formattedValue: string;
}
