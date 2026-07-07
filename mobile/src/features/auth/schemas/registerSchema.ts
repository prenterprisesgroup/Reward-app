import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .length(10, 'Phone number must be exactly 10 digits')
    .regex(/^\d+$/, 'Phone number can only contain digits'),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => value?.length ? value : undefined)
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: 'Email must be valid',
    }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  upiId: z
    .string()
    .trim()
    .optional()
    .transform((value) => value?.length ? value : undefined),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      path: ['confirmPassword'],
      message: 'Passwords must match',
    });
  }
});

export type RegisterFormData = z.infer<typeof registerSchema>;
