import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; phone?: string; email?: string }) => {
      return authApi.updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUploadProfileImageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => {
      return authApi.uploadProfileImage(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
