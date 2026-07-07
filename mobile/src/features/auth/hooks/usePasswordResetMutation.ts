import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../../api/auth.api';
import { Alert } from 'react-native';
import axios from 'axios';

export const useRequestPasswordResetMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.requestPasswordReset(data),
    onSuccess: (data) => {
      Alert.alert('OTP Sent', data.message);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', error.response?.data?.message || 'Could not send OTP.');
      } else {
        Alert.alert('Error', 'Could not send OTP.');
      }
    },
  });
};

export const useVerifyPasswordResetMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; otpCode: string }) => authApi.verifyPasswordReset(data),
    onSuccess: (data) => {
      Alert.alert('Verified', data.message);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', error.response?.data?.message || 'OTP verification failed.');
      } else {
        Alert.alert('Error', 'OTP verification failed.');
      }
    },
  });
};

export const useCompletePasswordResetMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; otpCode: string; newPassword: string; confirmPassword: string }) => authApi.completePasswordReset(data),
    onSuccess: (data) => {
      Alert.alert('Success', data.message);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', error.response?.data?.message || 'Password reset failed.');
      } else {
        Alert.alert('Error', 'Password reset failed.');
      }
    },
  });
};
