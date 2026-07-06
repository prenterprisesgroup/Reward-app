import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authApi } from '../../../api/auth.api';
import { useAuthStore } from '../../../store/useAuthStore';
import { LoginFormData } from '../schemas/loginSchema';
import { useGlobalToastStore } from '../../../store/useGlobalToastStore';
import { queryClient } from '../../../api/queryClient';
import axios from 'axios';

export const useLoginMutation = () => {
  const router = useRouter();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const logout = useAuthStore((state) => state.logout);
  const showToast = useGlobalToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (credentials: LoginFormData) => authApi.login(credentials),
    onSuccess: async (data) => {
      // 1. Strictly verify SUPER_ADMIN role before granting session
      if (data.user.role !== 'SUPER_ADMIN') {
        showToast('Access Denied: Super Admin privileges required.', 'error');
        // Do not set credentials. Trigger logout just in case.
        await logout();
        return;
      }

      // 2. Securely save token & user state
      await setCredentials(data.token, data.user);
      
      // 3. Navigate directly to dashboard
      showToast('Welcome back, Super Admin!', 'success');
      router.replace('/(super-admin)/dashboard');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          showToast('Network Error: No internet connection.', 'error');
        } else if (error.response.status === 400) {
          showToast(error.response.data?.message || 'Invalid input.', 'error');
        } else if (error.response.status === 401) {
          showToast('Login Failed: Invalid phone number or password.', 'error');
        } else if (error.response.status === 403) {
          showToast('Access Denied: You do not have permission to log in.', 'error');
        } else {
          showToast('Something went wrong. Please try again.', 'error');
        }
      } else {
        showToast('An unexpected error occurred.', 'error');
      }
    },
  });
};

