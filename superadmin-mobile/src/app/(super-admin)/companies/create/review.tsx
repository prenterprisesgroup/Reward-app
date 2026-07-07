import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Platform, ToastAndroid, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFormContext } from 'react-hook-form';
import { Typography } from '../../../../components/common/Typography';
import { theme } from '../../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { CreateCompanyFormValues } from '../../../../features/companies/schemas/createCompany.schema';
import { useWizardStore } from '../../../../features/companies/store/useWizardStore';
import { CompanyFormDataMapper } from '../../../../features/companies/mappers/company.formdata.mapper';
import { useCreateCompanyMutation } from '../../../../features/companies/hooks/useCompanies';

export default function ReviewCompany() {
  const router = useRouter();
  const { watch } = useFormContext<CreateCompanyFormValues>();
  const { nextStep, previousStep, markStepComplete } = useWizardStore();
  const formValues = watch();
  
  const createCompanyMutation = useCreateCompanyMutation();

  const handleCreate = async () => {
    if (createCompanyMutation.isPending) return; // Idempotency protection
    
    const formData = CompanyFormDataMapper.toFormData(formValues);
    
    createCompanyMutation.mutate(formData, {
      onSuccess: (data: any) => {
        useWizardStore.getState().setDraftStatus('COMPLETED');
        markStepComplete(4);
        nextStep();
        const companyId = data?.company?.id || data?.company?._id || '';
        router.push(`/companies/create/success?companyId=${companyId}`);
      }
      // Notice we do NOT navigate on error, preserving the form state.
      // Error is handled in the mutation's onError callback.
    });
  };

  const Section = ({ title, editPath, step, children }: { title: string, editPath: string, step: number, children: React.ReactNode }) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Feather name={step === 1 ? "info" : step === 2 ? "map-pin" : "credit-card"} size={16} color={theme.colors.success} style={{ marginRight: 8 }} />
          <Typography style={styles.sectionTitle}>{title}</Typography>
        </View>
        <TouchableOpacity 
          onPress={() => router.push(editPath as any)}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${title}`}
        >
          <Typography style={styles.editText}>Edit</Typography>
        </TouchableOpacity>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.infoRow}>
      <Typography style={styles.label}>{label}</Typography>
      <Typography style={styles.value}>{value}</Typography>
    </View>
  );

  return (
    <View style={styles.container}>
      <Typography variant="title" style={styles.pageTitle}>Review Company Details</Typography>
      <Typography style={styles.subtitle}>Review & confirm company details before creating.</Typography>

      <Section title="Company Information" editPath="/companies/create/step-1" step={1}>
        <InfoRow label="Company Name" value={formValues.name} />
        {formValues.logo ? (
          <View style={styles.logoRow}>
            <Typography style={styles.label}>Company Logo</Typography>
            <Image source={{ uri: formValues.logo }} style={styles.reviewLogo} />
          </View>
        ) : (
          <InfoRow label="Company Logo" value="Not provided" />
        )}
        <InfoRow label="Industry" value={formValues.industry} />
        <InfoRow label="GST Number" value={formValues.gstNumber} />
        <InfoRow label="Email" value={formValues.email} />
        <InfoRow label="Phone" value={formValues.phone} />
        {formValues.website ? <InfoRow label="Website" value={formValues.website} /> : null}
      </Section>

      <Section title="Address Information" editPath="/companies/create/step-2" step={2}>
        <InfoRow label="Address" value={formValues.addressLine} />
        <InfoRow label="City" value={formValues.city} />
        <InfoRow label="State" value={formValues.state} />
        <InfoRow label="Pincode" value={formValues.pincode} />
        <InfoRow label="Country" value={formValues.country} />
      </Section>

      <Section title="Settlement Information" editPath="/companies/create/step-3" step={3}>
        <InfoRow label="Settlement Method" value={formValues.settlementMethod} />
        {formValues.settlementMethod === 'UPI' ? (
          <InfoRow label="Primary UPI ID" value={formValues.upiId!} />
        ) : (
          <>
            <InfoRow label="Bank Account" value={formValues.bankAccount!} />
            <InfoRow label="IFSC Code" value={formValues.ifscCode!} />
          </>
        )}
        <InfoRow label="Settlement Contact" value={formValues.settlementContact} />
      </Section>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={previousStep}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
          <Typography style={styles.backBtnText}>Back</Typography>
        </TouchableOpacity>
        
        <View style={styles.rightActions}>
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => router.replace('/companies')}
            disabled={createCompanyMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Cancel company creation"
          >
            <Typography style={styles.cancelBtnText}>Cancel</Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.continueBtn, createCompanyMutation.isPending && styles.continueBtnDisabled]} 
            onPress={handleCreate}
            disabled={createCompanyMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Create Company"
            accessibilityState={{ disabled: createCompanyMutation.isPending, busy: createCompanyMutation.isPending }}
          >
            {createCompanyMutation.isPending ? (
              <ActivityIndicator size="small" color={theme.colors.surface} style={{ marginRight: 8 }} />
            ) : (
              <Feather name="save" size={16} color={theme.colors.surface} style={{ marginRight: 8 }} />
            )}
            <Typography style={styles.continueBtnText}>
              {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.success,
  },
  sectionContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewLogo: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    marginLeft: 8,
  },
  continueBtnDisabled: {
    opacity: 0.7,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
  }
});
