import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { LoginFormData } from '../features/auth/schemas/loginSchema';
import { User } from '../store/useAuthStore';

interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (credentials: LoginFormData): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },
  updateProfile: async (data: { name?: string; phone?: string; email?: string }): Promise<{ user: User }> => {
    const response = await apiClient.patch<{ user: User }>(ENDPOINTS.AUTH.UPDATE_ME, data);
    return response.data;
  },
  uploadProfileImage: async (formData: FormData): Promise<{ user: User }> => {
    const response = await apiClient.post<{ user: User }>(ENDPOINTS.AUTH.UPDATE_PHOTO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  changePassword: async (data: any): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>('/auth/change-password', data);
    return response.data;
  },
};
