import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFormContext } from 'react-hook-form';
import { Typography } from '../../../../components/common/Typography';
import { theme } from '../../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { CreateCompanyFormValues } from '../../../../features/companies/schemas/createCompany.schema';
import { useWizardStore } from '../../../../features/companies/store/useWizardStore';

export default function SuccessCompany() {
  const router = useRouter();
  const { companyId } = useLocalSearchParams();
  const { watch, reset } = useFormContext<CreateCompanyFormValues>();
  const { resetWizard } = useWizardStore();
  const formValues = watch();

  const handleFinish = () => {
    reset();
    resetWizard();
    if (companyId) {
      router.replace(`/companies/${companyId}`);
    } else {
      router.replace('/companies');
    }
  };

  const handleAssignAdmin = () => {
    reset();
    resetWizard();
    if (companyId) {
      router.replace(`/companies/${companyId}/create-admin`);
    } else {
      router.replace('/companies');
    }
  };

  const handleCreateAnother = () => {
    reset();
    resetWizard();
    router.replace('/companies/create/step-1');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Feather name="check" size={40} color={theme.colors.surface} />
      </View>
      
      <Typography variant="headingLg" style={styles.title}>Company Created Successfully! 🎉</Typography>
      <Typography style={styles.subtitle}>
        <Typography style={{ fontWeight: '700' }}>{formValues.name}</Typography> has been registered successfully on the platform.
      </Typography>

      <View style={styles.companyCard}>
        <View style={styles.logoPlaceholder}>
          <Typography variant="headingLg" color="primaryDark">{formValues.name?.substring(0, 2).toUpperCase()}</Typography>
        </View>
        <View style={styles.companyInfo}>
          <Typography style={styles.companyName} numberOfLines={1}>{formValues.name}</Typography>
          <Typography style={styles.companyId}>Company ID</Typography>
          <Typography style={styles.companyIdValue}>CMP-1024</Typography>
        </View>
        <View style={styles.statusBadge}>
          <Typography style={styles.statusText}>Active</Typography>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Typography style={styles.whatsNext}>What's next?</Typography>
        <Typography style={styles.whatsNextSub}>Assign a company admin to start managing this company.</Typography>

        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={handleAssignAdmin}
          accessibilityRole="button"
          accessibilityLabel="Assign Company Admin"
        >
          <Typography style={styles.primaryBtnText}>Assign Company Admin</Typography>
          <Feather name="arrow-right" size={16} color={theme.colors.surface} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryBtn} 
          onPress={handleFinish}
          accessibilityRole="button"
          accessibilityLabel="Go to Company Details"
        >
          <Typography style={styles.secondaryBtnText}>Go to Company Details</Typography>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tertiaryBtn} 
          onPress={handleCreateAnother}
          accessibilityRole="button"
          accessibilityLabel="Create Another Company"
        >
          <Typography style={styles.tertiaryBtnText}>Create Another Company</Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...theme.shadows.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    flexShrink: 1,
    width: '100%',
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: 32,
    lineHeight: 20,
    flexShrink: 1,
    width: '100%',
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: 40,
    ...theme.shadows.sm,
    flexShrink: 1,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  companyId: {
    fontSize: 10,
    color: theme.colors.textTertiary,
  },
  companyIdValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: theme.colors.successBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.success,
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  whatsNext: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  whatsNextSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success,
    width: '100%',
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
    marginRight: 8,
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  tertiaryBtn: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  tertiaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  }
});
