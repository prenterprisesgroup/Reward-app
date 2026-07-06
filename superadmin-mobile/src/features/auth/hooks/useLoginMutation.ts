import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { authApi } from '../../../api/auth.api';
import { useAuthStore } from '../../../store/useAuthStore';
import { LoginFormData } from '../schemas/loginSchema';
import axios from 'axios';

export const useLoginMutation = () => {
  const router = useRouter();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation({
    mutationFn: (credentials: LoginFormData) => authApi.login(credentials),
    onSuccess: async (data) => {
      // 1. Securely save token & user state
      await setCredentials(data.token, data.user);
      
      // 2. Role-based navigation
      switch (data.user.role) {
        case 'WORKER':
          router.replace('/(worker)');
          break;
        case 'COMPANY_ADMIN':
          router.replace('/(admin)');
          break;
        case 'SUPER_ADMIN':
          router.replace('/(super-admin)');
          break;
        default:
          Alert.alert('Error', 'Unknown role provided by the server.');
          break;
      }
    },
    onError: (error) => {
      // Use existing Toast/Snackbar if it existed.
      // Falling back to native Alert as a generic robust UI indicator
      
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          Alert.alert('Network Error', 'No internet connection.');
        } else if (error.response.status === 400) {
          Alert.alert('Validation Error', error.response.data?.message || 'Invalid input.');
        } else if (error.response.status === 401) {
          Alert.alert('Login Failed', 'Invalid phone number or password.');
        } else if (error.response.status === 403) {
          Alert.alert('Access Denied', 'You do not have permission to log in.');
        } else {
          Alert.alert('Error', 'Something went wrong.\nPlease try again.');
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    },
  });
};
