import { CreateCompanyFormValues } from '../schemas/createCompany.schema';

export interface CreateCompanyRequestV1 {
  version: '1.0';
  name: string;
  industry: string;
  gstNumber: string;
  contactDetails: {
    email: string;
    phone: string;
    website?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  settlementMethod: 'UPI' | 'BANK';
  upiId?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
  };
  settlementContact: string;
}

export function mapFormToDTO(formValues: CreateCompanyFormValues): CreateCompanyRequestV1 {
  return {
    version: '1.0',
    name: formValues.name,
    industry: formValues.industry,
    gstNumber: formValues.gstNumber,
    contactDetails: {
      email: formValues.email,
      phone: formValues.phone,
      website: formValues.website || undefined,
    },
    address: {
      street: formValues.addressLine,
      city: formValues.city,
      state: formValues.state,
      pincode: formValues.pincode,
      country: formValues.country,
    },
    settlementMethod: formValues.settlementMethod,
    upiId: formValues.settlementMethod === 'UPI' ? formValues.upiId : undefined,
    bankDetails: formValues.settlementMethod === 'BANK' ? {
      accountNumber: formValues.bankAccount!,
      ifscCode: formValues.ifscCode!,
    } : undefined,
    settlementContact: formValues.settlementContact,
  };
}
