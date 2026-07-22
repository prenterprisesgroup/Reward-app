import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../../../constants/theme';
import { Typography } from '../../../../components/common/Typography';
import { Feather } from '@expo/vector-icons';
import { ToastAndroid, Platform, Alert } from 'react-native';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCompanyAdminSchema, CreateCompanyAdminFormValues } from '../../../../features/company-admins/schemas/company-admin.schema';
import { CompanyAdminForm } from '../../../../features/company-admins/components/CompanyAdminForm';
import { CompanyAdminSummaryCard } from '../../../../features/company-admins/components/CompanyAdminSummaryCard';
import { useCreateCompanyAdminMutation } from '../../../../features/company-admins/hooks/useCompanyAdmins';
import { CompanyAdminMapper } from '../../../../features/company-admins/mappers/company-admin.mapper';
import { useCompanyDetailsQuery } from '../../../../features/companies/hooks/useCompanies';

// Simple password generator
const generateSecurePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  // Ensure rules: Uppercase, lowercase, number, special
  password += 'A'; // Uppercase
  password += 'a'; // Lowercase
  password += '1'; // Number
  password += '!'; // Special
  
  for (let i = 4; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Shuffle password (optional but good)
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

export default function CreateCompanyAdminScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { data: companyDetails, isLoading: isCompanyLoading } = useCompanyDetailsQuery(id as string);
  const mutation = useCreateCompanyAdminMutation(id as string);

  const methods = useForm<any>({
    resolver: zodResolver(createCompanyAdminSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      employeeId: '',
      username: '',
      password: '',
      autoGenerate: false,
      sendWelcomeEmail: true,
      sendSmsCredentials: true,
      generateInviteLink: false,
    },
    mode: 'onChange'
  });

  const onSubmit = async (data: CreateCompanyAdminFormValues) => {
    let finalPassword = data.password;
    if (data.autoGenerate) {
      finalPassword = generateSecurePassword();
    }

    const payload = CompanyAdminMapper.toBackendRequest(data, finalPassword);
    
    mutation.mutate(payload, {
      onSuccess: () => {
        router.back();
      }
    });
  };

  const formValues = methods.watch();

  if (isCompanyLoading || !companyDetails) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Typography variant="headingMd" style={styles.headerTitle}>Create Company Admin</Typography>
          <Typography style={styles.headerSubtitle}>Assign an administrator to manage this company.</Typography>
        </View>
        <TouchableOpacity 
          style={styles.notificationBtn}
          onPress={() => {
            if (Platform.OS === 'android') ToastAndroid.show('Notifications coming soon', ToastAndroid.SHORT);
            else Alert.alert('Coming Soon', 'Notifications coming soon');
          }}
        >
          <Feather name="bell" size={24} color={theme.colors.text} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FormProvider {...methods}>
          <View style={styles.companySummaryContainer}>
            {/* Minimal Company Header based on design */}
            <View style={styles.companyLogoContainer}>
               <Typography style={styles.companyLogoText}>{companyDetails.company.name.substring(0, 2).toUpperCase()}</Typography>
            </View>
            <View style={styles.companyInfo}>
              <Typography variant="title" style={styles.companyName} numberOfLines={2}>{companyDetails.company.name}</Typography>
              <View style={styles.companyMeta}>
                <Typography style={styles.companyId}>Company ID: {companyDetails.company.displayId}</Typography>
                {companyDetails.verification.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Feather name="check-circle" size={12} color={theme.colors.success} />
                    <Typography style={styles.verifiedText}>Verified Company</Typography>
                  </View>
                )}
              </View>
            </View>
          </View>

          <CompanyAdminForm />
          
          <CompanyAdminSummaryCard company={companyDetails.company} values={formValues} />
        </FormProvider>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, mutation.isPending && styles.submitButtonDisabled]} 
          onPress={methods.handleSubmit(onSubmit)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <>
              <Feather name="plus-circle" size={20} color={theme.colors.surface} style={{ marginRight: 8 }} />
              <Typography style={styles.submitButtonText}>Create Company Admin</Typography>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={mutation.isPending}>
          <Typography style={styles.cancelButtonText}>Cancel</Typography>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  notificationBtn: {
    padding: theme.spacing.sm,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
    gap: 24,
  },
  companySummaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 16,
  },
  companyLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogoText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  companyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  companyName: {
    flexShrink: 1,
  },
  companyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  companyId: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flexShrink: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    color: theme.colors.success,
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    height: 48,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: theme.colors.surface,
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
    fontSize: 16,
  }
});
