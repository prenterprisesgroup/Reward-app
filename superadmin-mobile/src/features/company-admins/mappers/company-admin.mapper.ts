import { BackendCreateCompanyAdminRequest, BackendCreateCompanyAdminResponse, FrontendCompanyAdmin } from '../types/company-admin.types';
import { CreateCompanyAdminFormValues } from '../schemas/company-admin.schema';

export const CompanyAdminMapper = {
  toBackendRequest: (values: CreateCompanyAdminFormValues, generatedPassword?: string): BackendCreateCompanyAdminRequest => {
    return {
      name: values.fullName,
      phone: values.phone,
      email: values.email || undefined,
      password: values.autoGenerate && generatedPassword ? generatedPassword : values.password,
    };
  },

  toFrontendResponse: (response: BackendCreateCompanyAdminResponse): FrontendCompanyAdmin => {
    return {
      id: response.user.id,
      name: response.user.name,
      phone: response.user.phone,
      email: response.user.email || null,
      role: response.user.role,
      companyId: response.user.company,
      isActive: response.user.isActive,
      createdAt: response.user.createdAt,
    };
  }
};
