import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyAdminsApi } from '../api/company-admins.api';
import { queryKeys } from '../../companies/hooks/queryKeys';
import { ToastAndroid, Platform, Alert } from 'react-native';
import { BackendCreateCompanyAdminRequest } from '../types/company-admin.types';
import { CompanyAdminMapper } from '../mappers/company-admin.mapper';

const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert('Notice', message);
  }
};

export const useCreateCompanyAdminMutation = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BackendCreateCompanyAdminRequest) => {
      // AbortSignal is handled implicitly if we pass it, but useMutation doesn't natively provide signal to mutationFn in standard setup unless using variables object.
      // We'll keep it simple: cancellation on unmount is handled if the component passes signal, but React Query v5 supports cancellation.
      return companyAdminsApi.createCompanyAdmin(companyId, data);
    },
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if ([401, 403, 422].includes(status)) return false;
      return failureCount < 1;
    },
    onSuccess: (response) => {
      showToast('Company Admin created successfully.');
      
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.companies.detail(companyId) });
      // If we had a specific admins list query:
      // queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.companies.admins(companyId) });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      
      if (status === 409) {
        showToast('A Company Admin with this email or phone already exists.');
      } else if (status === 400) {
        showToast('Invalid details provided. Please check the form.');
      } else if (status === 403) {
        showToast("Permission denied. You don't have access to create an admin here.");
      } else if (status === 404) {
        showToast("Company not found. It may have been deleted.");
      } else {
        const errorMsg = error?.response?.data?.message || error.message || 'Failed to create company admin.';
        showToast(errorMsg);
      }
    }
  });
};
