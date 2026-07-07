import * as z from 'zod';

export const createCompanyAdminSchema = z.object({
  fullName: z.string().min(2, 'Name is required').max(100),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').or(z.literal('')),
  employeeId: z.string().optional(),
  username: z.string().optional(),
  autoGenerate: z.boolean().default(false),
  password: z.string().optional(),
  sendWelcomeEmail: z.boolean().default(true),
  sendSmsCredentials: z.boolean().default(true),
  generateInviteLink: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (!data.autoGenerate && (!data.password || data.password.length < 8)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must be at least 8 characters',
      path: ['password'],
    });
  }
});

export type CreateCompanyAdminFormValues = z.infer<typeof createCompanyAdminSchema>;
