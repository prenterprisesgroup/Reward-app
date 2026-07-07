import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { settingsApi } from '../api/settings.api';
import { SettingsMapper } from '../mappers/settings.mapper';
import { PlatformSettingsModel, UpdatePlatformSettingsPayload } from '../types/settings.types';
import { useGlobalToastStore } from '../../../store/useGlobalToastStore';

export const usePlatformSettingsQuery = () => {
  return useQuery({
    queryKey: queryKeys.settings.all(),
    queryFn: async ({ signal }) => {
      const dto = await settingsApi.getSettings(signal);
      return SettingsMapper.toModel(dto);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdatePlatformSettingsMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useGlobalToastStore(state => state.showToast);

  return useMutation({
    mutationFn: async (payload: UpdatePlatformSettingsPayload) => {
      return await settingsApi.updateSettings(payload);
    },
    onMutate: async (newSettingsPayload) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.all() });

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData<PlatformSettingsModel>(queryKeys.settings.all());

      // Optimistically update to the new value (Only apply toggle updates optimistically to be safe)
      if (previousSettings) {
        queryClient.setQueryData<PlatformSettingsModel>(queryKeys.settings.all(), {
          ...previousSettings,
          general: {
            ...previousSettings.general,
            maintenanceMode: newSettingsPayload.general?.maintenanceMode ?? previousSettings.general.maintenanceMode,
          },
          featureFlags: {
            ...previousSettings.featureFlags,
            ...(newSettingsPayload.featureFlags || {})
          }
        });
      }

      // Return a context object with the snapshotted value
      return { previousSettings };
    },
    onSuccess: (updatedDto) => {
      showToast('Settings saved successfully', 'success');
      // Update cache with the real server response
      queryClient.setQueryData(queryKeys.settings.all(), SettingsMapper.toModel(updatedDto));
    },
    onError: (error: any, newSettings, context) => {
      // Rollback to the previous value
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKeys.settings.all(), context.previousSettings);
      }

      if (error.response?.status === 409) {
        showToast('Settings were updated by another admin. Refreshing to latest version.', 'error');
        queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() });
      } else {
        const msg = error.response?.data?.message || 'Failed to update settings';
        showToast(msg, 'error');
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() });
    },
  });
};
