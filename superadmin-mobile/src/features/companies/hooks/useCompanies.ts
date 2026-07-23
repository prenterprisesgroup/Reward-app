import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi, GetCompaniesParams } from '../api/companies.api';
import { CompanyMapper } from '../mappers/company.mapper';
import { queryKeys } from './queryKeys';
import { ToastAndroid, Platform, Alert } from 'react-native';

const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('', message);
  }
};

export const useCompaniesQuery = (params: GetCompaniesParams) => {
  return useInfiniteQuery({
    queryKey: queryKeys.superAdmin.companies.list(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1, signal }) => {
      const response = await companiesApi.getCompanies({ ...params, page: pageParam }, signal);
      return {
        data: response.data.map(CompanyMapper.toFrontendCompany),
        pagination: response.pagination,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if ([400, 401, 403, 422].includes(status)) return false;
      return failureCount < 1;
    },
  });
};

export const useCompanyStatsQuery = () => {
  return useQuery({
    queryKey: queryKeys.superAdmin.companies.globalStats(),
    queryFn: async ({ signal }) => {
      return companiesApi.getCompanyStats(signal);
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useCompanyDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.superAdmin.companies.detail(id),
    queryFn: async ({ signal }) => {
      const response = await companiesApi.getCompanyDetails(id, signal);
      return CompanyMapper.toFrontendCompanyDetails(response);
    },
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if ([400, 401, 403, 422].includes(status)) return false;
      return failureCount < 1;
    },
  });
};

export const useCompanyActivityQuery = (id: string) => {
  return useInfiniteQuery({
    queryKey: queryKeys.superAdmin.companies.activity(id),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1, signal }) => {
      const response = await companiesApi.getCompanyActivity(id, { page: pageParam, limit: 10 }, signal);
      return response;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if ([400, 401, 403, 422].includes(status)) return false;
      return failureCount < 1;
    },
  });
};

const useOptimisticMutation = (mutationFn: (id: string) => Promise<any>, successMessage: string, optimisticStatus?: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.superAdmin.companies.detail(id) });

      // Snapshot previous value
      const previousDetails = queryClient.getQueryData<any>(queryKeys.superAdmin.companies.detail(id));

      // Optimistically update to the new value
      if (optimisticStatus && previousDetails?.company) {
        queryClient.setQueryData(queryKeys.superAdmin.companies.detail(id), {
          ...previousDetails,
          company: {
            ...previousDetails.company,
            status: optimisticStatus
          }
        });
      }
      
      return { previousDetails };
    },
    onError: (err: any, id, context) => {
      if (err?.response?.status === 403) {
        showToast("Permission denied. You don't have access to perform this action.");
      } else {
        showToast(`Failed to update company. ${err?.message || ''}`);
      }
      // Rollback
      if (context?.previousDetails) {
        queryClient.setQueryData(queryKeys.superAdmin.companies.detail(id), context.previousDetails);
      }
    },
    onSuccess: (data, id) => {
      showToast(successMessage);
      // Invalidate relevant queries to keep cache consistent
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.companies.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.companies.activity(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.companies.all }); // Invalidates list
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.dashboard });
    },
  });
};

export const useCreateCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => companiesApi.createCompany(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.companies.list({}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.companies.activity('global') }); // if global activity exists
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 409) {
        showToast('Company with this name or email already exists.');
      } else if (status === 413) {
        showToast('Logo image is too large (max 5MB).');
      } else if (status === 415) {
        showToast('Unsupported image format.');
      } else if (status === 422) {
        showToast('Validation failed. Please check the entered details.');
      } else if (status === 403) {
        showToast("Permission denied. You don't have access.");
      } else {
        const errorMsg = error?.response?.data?.message || error.message || 'Failed to create company.';
        showToast(errorMsg);
      }
    }
  });
};

export const useApproveCompanyMutation = () => {
  return useOptimisticMutation(companiesApi.approveCompany, 'Company approved successfully', 'ACTIVE');
};

export const useRejectCompanyMutation = () => {
  return useOptimisticMutation(companiesApi.rejectCompany, 'Company rejected successfully', 'REJECTED');
};

export const useSuspendCompanyMutation = () => {
  return useOptimisticMutation(companiesApi.suspendCompany, 'Company suspended successfully', 'SUSPENDED');
};

export const useUpdateCompanyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => companiesApi.updateCompany(id, data),
    onSuccess: (_, { id }) => {
      showToast('Company updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.companies.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.companies.detail(id) });
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to update company.';
      showToast(errorMsg);
    }
  });
};

export const useCompanyWorkersQuery = (id: string, params: GetCompaniesParams) => {
  return useInfiniteQuery({
    queryKey: queryKeys.superAdmin.companies.workers(id, params),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1, signal }) => {
      const response = await companiesApi.getCompanyWorkers(id, { ...params, page: pageParam }, signal);
      return response;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
};
