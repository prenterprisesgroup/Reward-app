import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  updateCompanySettings,
  CompanyProfile,
  CompanySettings
} from '../api/company-profile.api';
import { authApi } from '../api/auth.api';

const COMPANY_PROFILE_KEY = ['company-profile'];
const COMPANY_SETTINGS_KEY = ['company-settings'];

export const useCompanyProfileQuery = () => {
  return useQuery({
    queryKey: COMPANY_PROFILE_KEY,
    queryFn: getCompanyProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });
};

export const useUpdateCompanyProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompanyProfile,
    onMutate: async (newProfile) => {
      await queryClient.cancelQueries({ queryKey: COMPANY_PROFILE_KEY });
      const previousProfile = queryClient.getQueryData<CompanyProfile>(COMPANY_PROFILE_KEY);
      
      if (previousProfile) {
        queryClient.setQueryData<CompanyProfile>(COMPANY_PROFILE_KEY, {
          ...previousProfile,
          ...newProfile,
        });
      }
      return { previousProfile };
    },
    onError: (err, newProfile, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(COMPANY_PROFILE_KEY, context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_PROFILE_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-activity'] });
    },
  });
};

export const useUploadCompanyLogoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadCompanyLogo,
    onSuccess: (data) => {
      queryClient.setQueryData(COMPANY_PROFILE_KEY, data);
    },
  });
};

export const useCompanySettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompanySettings,
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: COMPANY_PROFILE_KEY });
      const previousProfile = queryClient.getQueryData<CompanyProfile>(COMPANY_PROFILE_KEY);
      
      if (previousProfile) {
        queryClient.setQueryData<CompanyProfile>(COMPANY_PROFILE_KEY, {
          ...previousProfile,
          ...newSettings,
          notifications: {
            ...previousProfile.notifications,
            ...newSettings.notifications,
          },
        });
      }
      return { previousProfile };
    },
    onError: (err, newSettings, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(COMPANY_PROFILE_KEY, context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_PROFILE_KEY });
      queryClient.invalidateQueries({ queryKey: COMPANY_SETTINGS_KEY });
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
};
