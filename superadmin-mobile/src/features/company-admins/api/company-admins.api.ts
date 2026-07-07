import { apiClient } from '../../../api/client';
import { BackendCreateCompanyAdminRequest, BackendCreateCompanyAdminResponse } from '../types/company-admin.types';

export const companyAdminsApi = {
  createCompanyAdmin: async (companyId: string, data: BackendCreateCompanyAdminRequest, signal?: AbortSignal): Promise<BackendCreateCompanyAdminResponse> => {
    const response = await apiClient.post<BackendCreateCompanyAdminResponse>(
      `/api/v1/admin/companies/${companyId}/admins`,
      data,
      { signal }
    );
    return response.data;
  }
};
