import apiClient from './client';

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

export interface CompanyProfile {
  id: string;
  companyId: string;
  companyName: string;
  logo: string | null;
  verified: boolean;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  createdAt: string;
  upiId: string;
  bankName: string;
  bankAccountMasked: string;
  ifscCode: string;
  accountHolderName: string;
  settlementMethod: 'AUTOMATIC' | 'MANUAL';
  language: string;
  notifications: CompanySettings['notifications'];
}

export const getCompanyProfile = async (): Promise<CompanyProfile> => {
  const { data } = await apiClient.get('/company/me');
  return data;
};

export const updateCompanyProfile = async (
  payload: Partial<CompanyProfile> & { accountNumber?: string }
): Promise<CompanyProfile> => {
  const { data } = await apiClient.patch('/company/me', payload);
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

  const { data } = await apiClient.post('/company/me/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const updateCompanySettings = async (
  settings: Partial<CompanySettings>
): Promise<CompanyProfile> => {
  const { data } = await apiClient.patch('/company/settings', settings);
  return data;
};
