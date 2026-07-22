import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useFormContext, Controller } from 'react-hook-form';
import { Typography } from '../../../../components/common/Typography';
import { theme } from '../../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { CreateCompanyFormValues } from '../../../../features/companies/schemas/createCompany.schema';
import { useWizardStore } from '../../../../features/companies/store/useWizardStore';

export default function Step3Settlement() {
  const router = useRouter();
  const { control, trigger, watch, setValue } = useFormContext<CreateCompanyFormValues>();
  const { nextStep, previousStep, markStepComplete } = useWizardStore();

  const settlementMethod = watch('settlementMethod');

  const handleNext = async () => {
    const isValid = await trigger(['settlementMethod', 'upiId', 'bankAccount', 'ifscCode', 'settlementContact']);
    if (isValid) {
      markStepComplete(3);
      nextStep();
      router.push('/companies/create/review');
    }
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  return (
    <View style={styles.container}>
      <Typography variant="title" style={styles.sectionTitle}>Settlement Information</Typography>

      <Typography style={styles.label}>Settlement Method *</Typography>
      <View style={styles.methodToggleContainer}>
        <TouchableOpacity 
          style={[styles.methodCard, settlementMethod === 'UPI' && styles.methodCardActive]}
          onPress={() => setValue('settlementMethod', 'UPI')}
          accessibilityRole="radio"
          accessibilityState={{ checked: settlementMethod === 'UPI' }}
          accessibilityLabel="UPI Settlement Method"
        >
          <Feather name="send" size={20} color={settlementMethod === 'UPI' ? theme.colors.success : theme.colors.textSecondary} />
          <Typography style={[styles.methodText, settlementMethod === 'UPI' ? styles.methodTextActive : {}]}>UPI</Typography>
          <View style={[styles.radio, settlementMethod === 'UPI' && styles.radioActive]}>
            {settlementMethod === 'UPI' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.methodCard, settlementMethod === 'BANK' && styles.methodCardActive]}
          onPress={() => setValue('settlementMethod', 'BANK')}
          accessibilityRole="radio"
          accessibilityState={{ checked: settlementMethod === 'BANK' }}
          accessibilityLabel="Bank Account Settlement Method"
        >
          <Feather name="home" size={20} color={settlementMethod === 'BANK' ? theme.colors.success : theme.colors.textSecondary} />
          <Typography style={[styles.methodText, settlementMethod === 'BANK' ? styles.methodTextActive : {}]}>Bank Account</Typography>
          <View style={[styles.radio, settlementMethod === 'BANK' && styles.radioActive]}>
            {settlementMethod === 'BANK' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      </View>

      {settlementMethod === 'UPI' ? (
        <Controller
          control={control}
          name="upiId"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View style={styles.inputGroup}>
              <Typography style={styles.label}>Primary UPI ID *</Typography>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="name@upi"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
              />
              {error ? (
                <Typography style={styles.errorText}>{error.message}</Typography>
              ) : (
                <Typography style={styles.helperText}>This will be used for primary settlements</Typography>
              )}
            </View>
          )}
        />
      ) : (
        <>
          <Controller
            control={control}
            name="bankAccount"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={styles.inputGroup}>
                <Typography style={styles.label}>Bank Account *</Typography>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Enter account number"
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
            name="ifscCode"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={styles.inputGroup}>
                <Typography style={styles.label}>IFSC Code *</Typography>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Enter IFSC code"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="characters"
                />
                {error && <Typography style={styles.errorText}>{error.message}</Typography>}
              </View>
            )}
          />
        </>
      )}

      <Controller
        control={control}
        name="settlementContact"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputGroup}>
            <Typography style={styles.label}>Settlement Contact *</Typography>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Name of settlement contact person"
              value={value}
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
  methodToggleContainer: {
    gap: 12,
    marginBottom: 24,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
  },
  methodCardActive: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successBackground,
  },
  methodText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginLeft: 12,
  },
  methodTextActive: {
    color: theme.colors.success,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: theme.colors.success,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
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
  helperText: {
    fontSize: 10,
    color: theme.colors.textTertiary,
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
