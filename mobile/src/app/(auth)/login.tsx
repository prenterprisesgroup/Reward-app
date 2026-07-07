import React, { useRef } from 'react';
import { StyleSheet, View, Pressable, KeyboardAvoidingView, Platform, Image, useWindowDimensions, TextInput, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Reusable Enterprise Components
import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/cards/Card';
import { InputField } from '../../components/forms/InputField';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Authentication Foundation
import { loginSchema, LoginFormData } from '../../features/auth/schemas/loginSchema';
import { useLoginMutation } from '../../features/auth/hooks/useLoginMutation';

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // React Hook Form
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '' }
  });

  // Mutation
  const { mutate, isPending } = useLoginMutation();

  // Refs for Keyboard UX
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = (data: LoginFormData) => {
    Keyboard.dismiss();
    mutate(data);
  };

  return (
    <ScreenWrapper scroll paddingHorizontal={0} paddingVertical={0} safeAreaEdges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Decorative Hero Image positioned absolutely top-right */}
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
          {/* Top Header Section */}
          <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.topSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="home" size={36} color={theme.colors.primaryDark} />
            </View>
            <Typography variant="headingXl" color="textPrimary" weight="bold" style={styles.title}>
              Welcome Back
            </Typography>
            <Typography variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
              Sign in to continue managing{'\n'}your rewards.
            </Typography>
          </Animated.View>

          {/* Main Authentication Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600).springify()}>
            <Card variant="elevated" style={styles.authCard}>
              <Typography variant="headingMd" color="textPrimary" weight="bold" style={{ marginBottom: theme.spacing.xl }}>
                Login to your account
              </Typography>

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
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    error={errors.phone?.message}
                    editable={!isPending}
                    leftIcon={
                      <View style={styles.phonePrefixContainer}>
                        <Typography variant="title" style={{ marginRight: 4, fontSize: 18 }}>🇮🇳</Typography>
                        <Typography variant="body" color="textPrimary" style={styles.countryCode}>+91</Typography>
                        <Ionicons name="chevron-down" size={14} color={theme.colors.textSecondary} />
                      </View>
                    }
                    rightIcon={<Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />}
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
                    placeholder="Enter your password"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(handleLogin)}
                    error={errors.password?.message}
                    editable={!isPending}
                    leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />}
                  />
                )}
              />

              <View style={styles.forgotPasswordContainer}>
                <Pressable hitSlop={12} disabled={isPending} onPress={() => router.push('/(auth)/forgot-password')}>
                  <Typography variant="bodySmall" color="accent" style={{ textDecorationLine: 'underline' }}>
                    Forgot Password?
                  </Typography>
                </Pressable>
              </View>

              <PrimaryButton 
                title="Login"
                fullWidth
                loading={isPending}
                onPress={handleSubmit(handleLogin)}
                rightIcon={<Ionicons name="arrow-forward" size={20} color="#FFF" />}
                style={styles.loginButton}
              />



              <View style={styles.registerContainer}>
                <Typography variant="body" color="textSecondary">
                  Don't have an account?{' '}
                </Typography>
                <Pressable hitSlop={12}>
                  <Typography variant="body" color="accent" weight="semiBold">
                    Create Worker Account
                  </Typography>
                </Pressable>
              </View>
            </Card>
          </Animated.View>

          {/* Bottom Security Card */}
          <Animated.View entering={FadeInUp.delay(400).duration(600).springify()}>
            <Card variant="flat" style={styles.securityCard}>
              <View style={styles.securityContent}>
                <View style={styles.securityIcon}>
                  <Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodySmall" weight="semiBold" color="accent">
                    Your data is secure and encrypted
                  </Typography>
                  <Typography variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                    We never share your information.
                  </Typography>
                </View>
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
    marginTop: 80, // Reduced slightly since insets.top adds padding now
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
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  title: {
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
    fontWeight: '800', // Explicitly make it heavier
  },
  subtitle: {
    lineHeight: 24,
  },
  authCard: {
    padding: theme.spacing['2xl'],
    marginBottom: theme.spacing['3xl'],
    borderRadius: 32, // Matches reference exactly
    ...theme.shadows.lg,
  },
  phonePrefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
    borderRightWidth: 1,
    borderRightColor: theme.colors.borderLight,
    marginRight: 6,
  },
  countryCode: {
    marginLeft: 4,
    marginRight: 2,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  loginButton: {
    height: 58,
    borderRadius: 29, // Perfect pill shape
    marginBottom: theme.spacing['2xl'],
    backgroundColor: theme.colors.accent, // Sage Green
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityCard: {
    backgroundColor: theme.colors.background, // Uses warm white
    borderColor: theme.colors.borderLight,
    borderWidth: 1,
    alignSelf: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 40, // Pill shaped security card
    width: '95%',
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityIcon: {
    marginRight: theme.spacing.md,
  },
});
