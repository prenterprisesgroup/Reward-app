import { CreateCompanyFormValues } from '../schemas/createCompany.schema';

export const CompanyFormDataMapper = {
  toFormData: (values: CreateCompanyFormValues): FormData => {
    const formData = new FormData();

    // Map basic text fields
    formData.append('name', values.name);
    formData.append('legalName', values.name);
    const validIndustries = ["Construction", "Manufacturing", "Retail", "IT", "Healthcare", "Education", "Other"];
    const inputIndustry = String(values.industry || '').trim();
    const matchedIndustry = validIndustries.find(i => i.toLowerCase() === inputIndustry.toLowerCase());
    
    formData.append('industry', matchedIndustry || 'Other');
    formData.append('phone', values.phone);
    if (values.email) formData.append('email', values.email);
    if (values.website) formData.append('website', values.website);
    if (values.gstNumber) formData.append('gstNumber', values.gstNumber);
    if (values.upiId) formData.append('upiId', values.upiId);

    // settlementMethod mapped locally in frontend but we don't send it to backend's settlementMethod which expects AUTOMATIC/MANUAL

    // Map nested address object
    const address = {
      line1: values.addressLine,
      line2: '',
      city: values.city,
      state: values.state,
      pincode: values.pincode,
      country: values.country,
    };
    formData.append('address', JSON.stringify(address));

    // Map nested bankAccount object
    if (values.settlementMethod !== 'UPI') {
      const bankAccount = {
        bankName: values.bankAccount || '',
        accountNumber: values.bankAccount || '', // assuming these are standard mapped
        accountHolderName: values.settlementContact || '',
        ifscCode: values.ifscCode || '',
      };
      formData.append('bankAccount', JSON.stringify(bankAccount));
    }

    // Map the logo image if present
    if (values.logo) {
      const filename = values.logo.split('/').pop() || 'logo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('logo', {
        uri: values.logo,
        name: filename,
        type: type,
      } as any);
    }

    return formData;
  },
};
