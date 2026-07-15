import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import axios from 'axios';
import { authApi } from '../../../api/auth.api';
import { useAuthStore } from '../../../store/useAuthStore';
import { RegisterFormData } from '../schemas/registerSchema';

export const useRegisterMutation = () => {
  const router = useRouter();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation({
    mutationFn: (credentials: RegisterFormData) => authApi.register(credentials),
    onSuccess: async (data) => {
      await setCredentials(data.token, data.user);
      router.replace('/(worker)');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          Alert.alert('Network Error', 'No internet connection.');
        } else if (error.response.status === 400) {
          Alert.alert('Validation Error', error.response.data?.message || 'Invalid input.');
        } else if (error.response.status === 409) {
          Alert.alert('Registration Failed', error.response.data?.message || 'User already exists.');
        } else {
          Alert.alert('Error', 'Something went wrong. Please try again.');
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    },
  });
};
