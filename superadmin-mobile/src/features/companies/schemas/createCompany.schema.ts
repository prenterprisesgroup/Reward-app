import { z } from 'zod';

export const step1Schema = z.object({
  logo: z.string().optional(),
  name: z.string().min(2, 'Company Name is required'),
  industry: z.string().min(1, 'Industry is required'),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i, 'Invalid GST Number format'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const step2Schema = z.object({
  addressLine: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits'),
  country: z.string().min(2, 'Country is required'),
});

export const step3Schema = z.object({
  settlementMethod: z.enum(['UPI', 'BANK']),
  upiId: z.string().optional(),
  bankAccount: z.string().optional(),
  ifscCode: z.string().optional(),
  settlementContact: z.string().min(2, 'Settlement Contact is required'),
}).refine((data) => {
  if (data.settlementMethod === 'UPI') {
    return !!data.upiId && data.upiId.includes('@');
  }
  return true;
}, {
  message: "Valid UPI ID is required",
  path: ["upiId"],
}).refine((data) => {
  if (data.settlementMethod === 'BANK') {
    return !!data.bankAccount && !!data.ifscCode;
  }
  return true;
}, {
  message: "Bank Account & IFSC are required",
  path: ["bankAccount"],
});

export const createCompanySchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
});

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;
export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step3Values = z.infer<typeof step3Schema>;
