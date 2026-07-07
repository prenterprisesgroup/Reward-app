import React, { useState } from 'react';
import { StyleSheet, View, Pressable, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/cards/Card';
import { InputField } from '../../components/forms/InputField';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { OTPInput } from '../../components/forms/OTPInput';
import { passwordResetRequestSchema, passwordResetSchema, PasswordResetFormData, PasswordResetRequestFormData } from '../../features/auth/schemas/passwordResetSchema';
import { useRequestPasswordResetMutation, useCompletePasswordResetMutation } from '../../features/auth/hooks/usePasswordResetMutation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<'request' | 'complete'>('request');
  const [email, setEmail] = useState('');

  const requestResetMutation = useRequestPasswordResetMutation();
  const completeResetMutation = useCompletePasswordResetMutation();

  const requestForm = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: '' },
  });

  const completeForm = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: '', otpCode: '', newPassword: '', confirmPassword: '' },
  });

  const { control: requestControl, handleSubmit: handleRequestSubmit, formState: { errors: requestErrors } } = requestForm;
  const { control: completeControl, handleSubmit: handleCompleteSubmit, formState: { errors: completeErrors } } = completeForm;

  const handleRequestReset = async (data: PasswordResetRequestFormData) => {
    Keyboard.dismiss();
    await requestResetMutation.mutateAsync(data);
    setEmail(data.email);
    completeForm.setValue('email', data.email);
    setCurrentStep('complete');
  };

  const handleResendCode = async () => {
    const targetEmail = email || completeForm.getValues('email');
    if (!targetEmail) return;

    Keyboard.dismiss();
    await requestResetMutation.mutateAsync({ email: targetEmail });
  };

  const handleCompleteReset = async (data: PasswordResetFormData) => {
    Keyboard.dismiss();
    await completeResetMutation.mutateAsync(data);
    router.replace('/(auth)/reset-success');
  };

  return (
    <ScreenWrapper scroll paddingHorizontal={0} paddingVertical={0} safeAreaEdges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={[styles.contentPadding, { paddingTop: insets.top + theme.spacing.lg }]}> 
          <Typography variant="headingXl" color="textPrimary" weight="bold" style={styles.title}>
            {currentStep === 'request' ? 'Reset Password' : 'Verify OTP & Set New Password'}
          </Typography>
          <Typography variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
            {currentStep === 'request'
              ? 'Enter your registered email to receive a reset code.'
              : 'Enter the code and a new password to complete reset.'}
          </Typography>

          <Card variant="elevated" style={styles.authCard}>
            {currentStep === 'request' ? (
              <>
                <Typography variant="bodySmall" weight="semiBold" style={{ color: '#52796F', marginBottom: 8 }}>
                  Email Address
                </Typography>
                <Controller
                  control={requestControl}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={(text) => onChange(text)}
                      error={requestErrors.email?.message}
                      editable={!requestResetMutation.isPending}
                    />
                  )}
                />

                <PrimaryButton
                  title="Send OTP"
                  fullWidth
                  loading={requestResetMutation.isPending}
                  onPress={handleRequestSubmit(handleRequestReset)}
                  style={styles.loginButton}
                />
              </>
            ) : (
              <>
                <Typography variant="bodySmall" weight="semiBold" style={{ color: '#52796F', marginBottom: 8 }}>
                  Email Address
                </Typography>
                <Controller
                  control={completeControl}
                  name="email"
                  render={({ field: { value } }) => (
                    <InputField
                      value={value}
                      editable={false}
                      containerStyle={styles.disabledInput}
                    />
                  )}
                />

                <Typography variant="bodySmall" weight="semiBold" style={{ color: '#52796F', marginBottom: 8, marginTop: theme.spacing.md }}>
                  OTP Code
                </Typography>
                <Controller
                  control={completeControl}
                  name="otpCode"
                  render={({ field: { value, onChange } }) => (
                    <OTPInput
                      value={value}
                      onChange={onChange}
                      error={completeErrors.otpCode?.message}
                      autoFocus
                      disabled={completeResetMutation.isPending}
                    />
                  )}
                />
                <Pressable
                  onPress={handleResendCode}
                  disabled={requestResetMutation.isPending || completeResetMutation.isPending}
                  style={styles.resendContainer}
                >
                  <Typography variant="bodySmall" color="accent" weight="semiBold">
                    {requestResetMutation.isPending ? 'Sending...' : 'Resend Code'}
                  </Typography>
                </Pressable>

                <Typography variant="bodySmall" weight="semiBold" style={{ color: '#52796F', marginBottom: 8 }}>
                  New Password
                </Typography>
                <Controller
                  control={completeControl}
                  name="newPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PasswordInput
                      placeholder="Enter new password"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={completeErrors.newPassword?.message}
                      showStrength
                      showRequirements
                      editable={!completeResetMutation.isPending}
                    />
                  )}
                />

                <Typography variant="bodySmall" weight="semiBold" style={{ color: '#52796F', marginBottom: 8 }}>
                  Confirm Password
                </Typography>
                <Controller
                  control={completeControl}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PasswordInput
                      placeholder="Confirm new password"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={completeErrors.confirmPassword?.message}
                      editable={!completeResetMutation.isPending}
                    />
                  )}
                />

                <PrimaryButton
                  title="Reset Password"
                  fullWidth
                  loading={completeResetMutation.isPending}
                  onPress={handleCompleteSubmit(handleCompleteReset)}
                  style={styles.loginButton}
                />
              </>
            )}

            <View style={styles.registerContainer}>
              <Pressable onPress={() => router.replace('/(auth)/login')}>
                <Typography variant="bodySmall" color="accent" weight="semiBold">
                  Back to login
                </Typography>
              </Pressable>
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentPadding: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    marginBottom: theme.spacing['2xl'],
    lineHeight: 24,
  },
  authCard: {
    padding: theme.spacing['2xl'],
    borderRadius: 32,
    ...theme.shadows.lg,
  },
  loginButton: {
    height: 58,
    borderRadius: 29,
    marginTop: theme.spacing['2xl'],
    backgroundColor: theme.colors.accent,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  registerContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  disabledInput: {
    opacity: 0.6,
  },
});
