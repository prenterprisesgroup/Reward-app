import React, { useRef } from 'react';
import { StyleSheet, View, Pressable, KeyboardAvoidingView, Platform, Image, useWindowDimensions, TextInput, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import Animated, { FadeInUp } from 'react-native-reanimated';

import { registerSchema, RegisterFormData } from '../../features/auth/schemas/registerSchema';
import { useRegisterMutation } from '../../features/auth/hooks/useRegisterMutation';

export default function RegisterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', phone: '', email: '', password: '', confirmPassword: '', upiId: '' },
  });

  const { mutate, isPending } = useRegisterMutation();
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const upiRef = useRef<TextInput>(null);

  const handleRegister = (data: RegisterFormData) => {
    Keyboard.dismiss();
    mutate(data);
  };

  return (
    <ScreenWrapper scroll paddingHorizontal={0} paddingVertical={0} safeAreaEdges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Animated.View
          entering={FadeInUp.duration(800)}
          style={{ position: 'absolute', top: 0, right: 0, zIndex: -1 }}
        >
          <Image
            source={require('../../../assets/images/hero_plant_lamp.png')}
            style={[styles.heroImage, { width: width * 0.65 }]}
            resizeMode="cover"
          />
        </Animated.View>

        <View style={[styles.contentPadding, { paddingTop: insets.top }]}> 
          <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.topSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="home" size={36} color={theme.colors.primaryDark} />
            </View>
            <Typography variant="headingXl" color="textPrimary" weight="bold" style={styles.title}>
              Create Worker Account
            </Typography>
            <Typography variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
              Register now to start scanning QR codes{'
'}and earning rewards.
            </Typography>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(600).springify()}>
            <Card variant="elevated" style={styles.authCard}>
              <Typography variant="headingMd" color="textPrimary" weight="bold" style={{ marginBottom: theme.spacing.xl }}>
                Register your worker account
              </Typography>

              <Typography variant="bodySmall" weight="semiBold" style={{ color: '#52796F', marginBottom: 8 }}>
                Full Name
              </Typography>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField
                    placeholder="Enter your full name"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.name?.message}
                    editable={!isPending}
                  />
                )}
              />

              <View style={{ height: theme.spacing.lg }} />

              <Typography variant="bodySmall" weight="semiBold" style={{ color: '#52796F', marginBottom: 8 }}>
                Phone Number
              </Typography>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.phone?.message}
                    editable={!isPending}
                    leftIcon={
                      <View style={styles.phonePrefixContainer}>
                        <Typography variant="title" style={{ marginRight: 4, fontSize: 18 }}>🇮🇳</Typography>
                        <Typography variant="body" color="textPrimary" style={styles.countryCode}>+91</Typography>
                      </View>
                    }
                  />
                )}
              />

              <View style={{ height: theme.spacing.lg }} />

              <Typography variant="bodySmall" weight="semiBold" style={{ color: '#52796F', marginBottom: 8 }}>
                Email (optional)
              </Typography>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.email?.message}
                    editable={!isPending}
                    leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />}
                  />
                )}
              />

              <View style={{ height: theme.spacing.lg }} />

              <Typography variant="bodySmall" weight="semiBold" style={{ color: '#52796F', marginBottom: 8 }}>
                Password
              </Typography>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    ref={passwordRef}
                    placeholder="Create a password"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.password?.message}
                    editable={!isPending}
                    leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  />
                )}
              />

              <View style={{ height: theme.spacing.lg }} />

              <Typography variant="bodySmall" weight="semiBold" style={{ color: '#52796F', marginBottom: 8 }}>
                Confirm Password
              </Typography>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    ref={confirmPasswordRef}
                    placeholder="Confirm your password"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.confirmPassword?.message}
                    editable={!isPending}
                    leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />}
                    returnKeyType="next"
                    onSubmitEditing={() => upiRef.current?.focus()}
                  />
                )}
              />

              <View style={{ height: theme.spacing.lg }} />

              <Typography variant="bodySmall" weight="semiBold" style={{ color: '#52796F', marginBottom: 8 }}>
                UPI ID (optional)
              </Typography>
              <Controller
                control={control}
                name="upiId"
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField
                    ref={upiRef}
                    placeholder="Enter your UPI ID"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.upiId?.message}
                    editable={!isPending}
                    leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.textSecondary} />}
                  />
                )}
              />

              <PrimaryButton
                title="Create Account"
                fullWidth
                loading={isPending}
                onPress={handleSubmit(handleRegister)}
                rightIcon={<Ionicons name="arrow-forward" size={20} color="#FFF" />}
                style={styles.loginButton}
              />

              <View style={styles.registerContainer}>
                <Typography variant="body" color="textSecondary">
                  Already have an account?{' '}
                </Typography>
                <Pressable hitSlop={12} disabled={isPending} onPress={() => router.push('/(auth)/login')}>
                  <Typography variant="body" color="accent" weight="semiBold">
                    Login
                  </Typography>
                </Pressable>
              </View>
            </Card>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroImage: {
    height: 400,
    borderBottomLeftRadius: 60,
    opacity: 0.95,
  },
  contentPadding: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
  },
  topSection: {
    marginTop: 80,
    marginBottom: theme.spacing['3xl'],
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 68,
    height: 68,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    lineHeight: 24,
  },
  authCard: {
    padding: theme.spacing['2xl'],
  },
  loginButton: {
    marginTop: theme.spacing['2xl'],
  },
  registerContainer: {
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phonePrefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    fontWeight: '600',
  },
});