export interface BackendCreateCompanyAdminRequest {
  name: string;
  phone: string;
  email?: string;
  password?: string; // Optional if frontend wants to omit it in certain future flows, but required in API today.
}

export interface BackendCreateCompanyAdminResponse {
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
    company: string;
    upiId?: string;
    walletBalance?: number;
    profilePhotoUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface FrontendCompanyAdmin {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
}
