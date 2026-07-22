import { 
  BackendCompanyListResponseItem, 
  FrontendCompany, 
  BackendCompanyDetailsResponse 
} from '../types/company.types';

export const CompanyMapper = {
  toFrontendCompany(backendCompany: BackendCompanyListResponseItem): FrontendCompany {
    return {
      id: backendCompany.id,
      displayId: backendCompany.displayId || backendCompany.id.substring(0, 8).toUpperCase(),
      name: backendCompany.name || 'Unnamed Company',
      legalName: backendCompany.legalName || 'N/A',
      industry: backendCompany.industry || 'Other',
      phone: backendCompany.phone || 'N/A',
      email: backendCompany.email || 'N/A',
      logoUrl: backendCompany.logoUrl || '',
      status: backendCompany.status || 'PENDING',
      createdAt: backendCompany.createdAt || new Date().toISOString(),
      primaryAdminName: backendCompany.primaryAdmin?.name || 'No Admin Assigned',
      workersCount: backendCompany.workersCount || 0,
      qrBatches: backendCompany.qrBatches || 0,
      rewardsDistributed: backendCompany.rewardsDistributed || 0,
    };
  },

  toFrontendCompanyDetails(backendData: BackendCompanyDetailsResponse) {
    const company = backendData.company;
    return {
      company: {
        id: company.id,
        displayId: company.displayId || company.id.substring(0, 8).toUpperCase(),
        name: company.name || 'Unnamed Company',
        legalName: company.legalName || 'N/A',
        industry: company.industry || 'Other',
        phone: company.phone || 'N/A',
        email: company.email || 'N/A',
        website: company.website || 'N/A',
        logoUrl: company.logoUrl || '',
        gstNumber: company.gstNumber || 'N/A',
        address: company.address || null,
          settlementMethod: company.settlementMethod || 'MANUAL',
          upiId: company.upiId || '',
          bankAccount: company.bankAccount || null,
        status: company.status || 'PENDING',
        createdAt: company.createdAt || new Date().toISOString(),
      },
      stats: {
        workforce: {
          workersCount: backendData.stats?.workforce?.workersCount || 0,
          activeWorkers: backendData.stats?.workforce?.activeWorkers || 0,
        },
        rewards: {
          distributed: backendData.stats?.rewards?.distributed || 0,
          pending: backendData.stats?.rewards?.pending || 0,
        },
        withdrawals: {
          pending: backendData.stats?.withdrawals?.pending || 0,
          approved: backendData.stats?.withdrawals?.approved || 0,
          rejected: backendData.stats?.withdrawals?.rejected || 0,
          cancelled: backendData.stats?.withdrawals?.cancelled || 0,
        },
        qr: {
          batches: backendData.stats?.qr?.batches || 0,
          activeBatches: backendData.stats?.qr?.activeBatches || 0,
        }
      },
      primaryAdmin: backendData.primaryAdmin ? {
        id: backendData.primaryAdmin.id,
        name: backendData.primaryAdmin.name || 'N/A',
        email: backendData.primaryAdmin.email || 'N/A',
        phone: backendData.primaryAdmin.phone || 'N/A',
        profilePhotoUrl: (backendData.primaryAdmin as any).profilePhotoUrl || null,
      } : null,
      admins: backendData.admins || [],
      subscription: backendData.subscription || { plan: 'Standard', validUntil: null },
      verification: backendData.verification || { isVerified: false, verifiedAt: null }
    };
  }
};
