import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useFormContext, Controller } from 'react-hook-form';
import { Typography } from '../../../../components/common/Typography';
import { theme } from '../../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { CreateCompanyFormValues } from '../../../../features/companies/schemas/createCompany.schema';
import { useWizardStore } from '../../../../features/companies/store/useWizardStore';

export default function Step2Address() {
  const router = useRouter();
  const { control, trigger } = useFormContext<CreateCompanyFormValues>();
  const { nextStep, previousStep, markStepComplete } = useWizardStore();

  const handleNext = async () => {
    const isValid = await trigger(['addressLine', 'city', 'state', 'pincode', 'country']);
    if (isValid) {
      markStepComplete(2);
      nextStep();
      router.push('/companies/create/step-3');
    }
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  return (
    <View style={styles.container}>
      <Typography variant="title" style={styles.sectionTitle}>Company Address</Typography>

      <Controller
        control={control}
        name="addressLine"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputGroup}>
            <Typography style={styles.label}>Address *</Typography>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="House / Building / Street / Area"
              value={value}
              onChangeText={onChange}
              accessibilityLabel="Address Line"
              accessibilityHint="Required. Enter the street address."
              
            />
            {error && <Typography style={styles.errorText} accessibilityLiveRegion="polite">{error.message}</Typography>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputGroup}>
            <Typography style={styles.label}>City *</Typography>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Enter city"
              value={value}
              onChangeText={onChange}
            />
            {error && <Typography style={styles.errorText}>{error.message}</Typography>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="state"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputGroup}>
            <Typography style={styles.label}>State *</Typography>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Enter state"
              value={value}
              onChangeText={onChange}
            />
            {error && <Typography style={styles.errorText}>{error.message}</Typography>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="pincode"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputGroup}>
            <Typography style={styles.label}>Pincode *</Typography>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Enter pincode"
              value={value}
              onChangeText={onChange}
              keyboardType="number-pad"
            />
            {error && <Typography style={styles.errorText}>{error.message}</Typography>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="country"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputGroup}>
            <Typography style={styles.label}>Country *</Typography>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Enter country"
              value={value || 'India'}
              onChangeText={onChange}
            />
            {error && <Typography style={styles.errorText}>{error.message}</Typography>}
          </View>
        )}
      />

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={handleBack}
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
            accessibilityRole="button"
            accessibilityLabel="Cancel onboarding"
          >
            <Typography style={styles.cancelBtnText}>Cancel</Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.continueBtn} 
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel="Continue to next step"
          >
            <Typography style={styles.continueBtnText}>Continue</Typography>
            <Feather name="arrow-right" size={16} color={theme.colors.surface} />
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: 10,
    color: theme.colors.error,
    marginTop: 4,
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
  continueBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
    marginRight: 8,
  }
});
