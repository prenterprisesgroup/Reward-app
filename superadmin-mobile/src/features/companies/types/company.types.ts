export type CompanyStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
export type CompanyIndustry = 'Construction' | 'Manufacturing' | 'Retail' | 'IT' | 'Healthcare' | 'Education' | 'Other';

export interface BackendCompany {
  id: string;
  displayId: string | null;
  name: string;
  legalName: string | null;
  industry: CompanyIndustry;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  gstNumber: string | null;
  address: any | null;
  upiId: string | null;
  bankAccount: any | null;
  settlementMethod: 'AUTOMATIC' | 'MANUAL';
  settings: any;
  status: CompanyStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendPrimaryAdmin {
  id: string;
  name: string;
  email: string | null;
  phone: string;
}

// Normalized structure from listCompanies endpoint
export interface BackendCompanyListResponseItem extends BackendCompany {
  primaryAdmin: BackendPrimaryAdmin | null;
  workersCount: number;
  qrBatches: number;
  rewardsDistributed: number;
}

export interface BackendPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BackendListResponse<T> {
  data: T[];
  pagination: BackendPagination;
}

// Normalized structure from getCompany endpoint
export interface BackendCompanyDetailsResponse {
  company: BackendCompany;
  stats: {
    workforce: {
      workersCount: number;
      activeWorkers: number;
    };
    rewards: {
      distributed: number;
      pending: number;
    };
    withdrawals: {
      pending: number;
      approved: number;
      rejected: number;
      cancelled: number;
    };
    qr: {
      batches: number;
      activeBatches: number;
    };
  };
  primaryAdmin: BackendPrimaryAdmin | null;
  admins: any[];
  subscription: {
    plan: string;
    validUntil: string | null;
  };
  verification: {
    isVerified: boolean;
    verifiedAt: string | null;
  };
}

// Normalized structure for getCompanyActivity endpoint
export interface BackendActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  performedBy: {
    id: string;
    name: string;
    role: string;
  } | null;
  status: string;
}

export interface FrontendCompany {
  id: string;
  displayId: string;
  name: string;
  legalName: string;
  industry: CompanyIndustry;
  phone: string;
  email: string;
  logoUrl: string;
  status: CompanyStatus;
  createdAt: string;
  primaryAdminName: string;
  workersCount: number;
  qrBatches: number;
  rewardsDistributed: number;
}

export interface BackendCompanyWorker {
  id: string;
  name: string;
  phone: string;
  status: boolean;
  profilePhotoUrl: string | null;
  totalRewardsEarned: number;
  totalQrScans: number;
  lastScanDate: string;
  joinDate: string;
  lastRewardAmount: number;
}
