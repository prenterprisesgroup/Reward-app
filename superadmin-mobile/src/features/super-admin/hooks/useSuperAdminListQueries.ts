import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { superAdminApi, SuperAdminQueryParams } from '../../../api/superAdmin.api';
import { queryKeys } from '../../../api/queryKeys';

export const useWorkersList = (filters: SuperAdminQueryParams) => {
  return useInfiniteQuery({
    queryKey: queryKeys.superAdmin.workers(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      return superAdminApi.getWorkers({ ...filters, page: pageParam });
    },
    getNextPageParam: (lastPage: any) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
  });
};

export const useWorkerDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.superAdmin.workerDetail(id),
    queryFn: async () => {
      return superAdminApi.getWorkerDetails(id);
    },
    enabled: !!id,
  });
};

export const useQrBatchesList = (filters: SuperAdminQueryParams) => {
  return useInfiniteQuery({
    queryKey: queryKeys.superAdmin.qrBatches(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      return superAdminApi.getQrBatches({ ...filters, page: pageParam });
    },
    getNextPageParam: (lastPage: any) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
  });
};

export const useQrScansList = (filters: SuperAdminQueryParams) => {
  return useInfiniteQuery({
    queryKey: queryKeys.superAdmin.qrScans(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      return superAdminApi.getQrScans({ ...filters, page: pageParam });
    },
    getNextPageParam: (lastPage: any) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
  });
};
