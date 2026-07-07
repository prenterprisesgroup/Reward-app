import { apiClient } from '../../../api/client';
import { PlatformSettingsDTO, UpdatePlatformSettingsPayload } from '../types/settings.types';

export const settingsApi = {
  getSettings: async (signal?: AbortSignal): Promise<PlatformSettingsDTO> => {
    const response = await apiClient.get<{ success: boolean; data: PlatformSettingsDTO }>(
      '/api/v1/settings',
      { signal }
    );
    return response.data.data;
  },

  updateSettings: async (payload: UpdatePlatformSettingsPayload, signal?: AbortSignal): Promise<PlatformSettingsDTO> => {
    const response = await apiClient.patch<{ success: boolean; data: PlatformSettingsDTO }>(
      '/api/v1/settings',
      payload,
      { signal }
    );
    return response.data.data;
  }
};
