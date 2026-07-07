import { z } from 'zod';

export const settingsValidationSchema = z.object({
  general: z.object({
    maintenanceMode: z.boolean(),
    supportEmail: z.string().email("Invalid email address"),
  }),
  rewards: z.object({
    minRewardAmount: z.number().min(1, "Minimum reward amount must be at least 1"),
    maxRewardAmount: z.number().min(1, "Maximum reward amount must be at least 1"),
  }).refine(data => data.maxRewardAmount >= data.minRewardAmount, {
    message: "Max reward must be greater than or equal to Min reward",
    path: ["maxRewardAmount"],
  }),
  withdrawals: z.object({
    minWithdrawalAmount: z.number().min(1, "Minimum withdrawal must be at least 1"),
    dailyWithdrawalLimit: z.number().min(1, "Daily limit must be at least 1"),
  }).refine(data => data.dailyWithdrawalLimit >= data.minWithdrawalAmount, {
    message: "Daily limit must be greater than or equal to Min withdrawal",
    path: ["dailyWithdrawalLimit"],
  }),
  featureFlags: z.object({
    analyticsEnabled: z.boolean(),
    reportsEnabled: z.boolean(),
    notificationsEnabled: z.boolean(),
  })
});

export type SettingsFormValues = z.infer<typeof settingsValidationSchema>;
