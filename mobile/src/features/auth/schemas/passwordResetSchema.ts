import { z } from 'zod';

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetSchema = z
  .object({
    email: z.string().email('Enter a valid email address'),
    otpCode: z.string().min(6, 'OTP code must be at least 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
