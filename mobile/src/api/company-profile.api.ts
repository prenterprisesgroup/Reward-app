import { apiClient } from './client';

export interface CompanySettings {
  language: string;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  timezone: string;
  currency: string;
}

export interface CompanyAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface CompanyProfile {
  id: string;
  companyId: string;
  companyName: string;
  logo: string | null;
  verified: boolean;
  email: string;
  phone: string;
  address: string | CompanyAddress | null;
  gstNumber: string;
  createdAt: string;
  upiId: string | null;
  bankName: string;
  bankAccountMasked: string;
  ifscCode: string;
  accountHolderName: string;
  settlementMethod: 'AUTOMATIC' | 'MANUAL';
  language: string;
  notifications: CompanySettings['notifications'];
}

export type UpdateCompanyProfilePayload = Partial<CompanyProfile> & {
  name?: string;
  accountNumber?: string;
};

export const getCompanyProfile = async (): Promise<CompanyProfile> => {
  const { data } = await apiClient.get('/api/v1/company/me');
  return data;
};

export const updateCompanyProfile = async (
  payload: UpdateCompanyProfilePayload
): Promise<CompanyProfile> => {
  const { data } = await apiClient.patch('/api/v1/company/me', payload);
  return data;
};

export const uploadCompanyLogo = async (fileUri: string): Promise<CompanyProfile> => {
  const formData = new FormData();
  
  // Extract filename and type from URI
  const filename = fileUri.split('/').pop() || 'logo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  
  formData.append('logo', {
    uri: fileUri,
    name: filename,
    type,
  } as any);

  const { data } = await apiClient.post('/api/v1/company/me/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const updateCompanySettings = async (
  settings: Partial<CompanySettings>
): Promise<CompanyProfile> => {
  const { data } = await apiClient.patch('/api/v1/company/settings', settings);
  return data;
};
