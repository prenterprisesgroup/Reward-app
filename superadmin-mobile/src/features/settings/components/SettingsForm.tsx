import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsValidationSchema, SettingsFormValues } from '../schemas/settings.schema';
import { theme } from '../../../constants/theme';
import { useUpdatePlatformSettingsMutation } from '../hooks/useSettings';
import { PlatformSettingsModel } from '../types/settings.types';
import { Save, RotateCcw } from 'lucide-react-native';

interface Props {
  initialData: PlatformSettingsModel;
  onDirtyChange: (isDirty: boolean) => void;
  onResetTriggered: () => void;
}

export const SettingsForm = ({ initialData, onDirtyChange, onResetTriggered }: Props) => {
  const updateMutation = useUpdatePlatformSettingsMutation();
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsValidationSchema),
    defaultValues: {
      general: initialData.general,
      rewards: initialData.rewards,
      withdrawals: initialData.withdrawals,
      featureFlags: initialData.featureFlags,
    },
    mode: 'onChange',
  });

  // Notify parent of dirty state for navigation guard
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  // Sync form when new server data arrives (like after a reset or refresh)
  useEffect(() => {
    reset({
      general: initialData.general,
      rewards: initialData.rewards,
      withdrawals: initialData.withdrawals,
      featureFlags: initialData.featureFlags,
    });
  }, [initialData, reset]);

  const onSubmit = (data: SettingsFormValues) => {
    updateMutation.mutate({
      ...data,
      version: initialData.version, // Required for 409 Conflict check
    });
  };

  const handleReset = () => {
    onResetTriggered();
  };

  const renderSectionHeader = (title: string, description: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* General Settings */}
      <View style={styles.section}>
        {renderSectionHeader('General', 'Platform-wide configurations')}
        
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Maintenance Mode</Text>
            <Text style={styles.subLabel}>Temporarily disable user access</Text>
          </View>
          <Controller
            control={control}
            name="general.maintenanceMode"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: theme.colors.border, true: theme.colors.error }}
                thumbColor="#fff"
                disabled={initialData.permissions.general === 'READ_ONLY'}
              />
            )}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Support Email</Text>
          <Controller
            control={control}
            name="general.supportEmail"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.general?.supportEmail && styles.inputError]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={initialData.permissions.general !== 'READ_ONLY'}
              />
            )}
          />
          {errors.general?.supportEmail && (
            <Text style={styles.errorText}>{errors.general.supportEmail.message}</Text>
          )}
        </View>
      </View>

      {/* Feature Flags */}
      <View style={styles.section}>
        {renderSectionHeader('Feature Flags', 'Enable or disable platform features')}
        
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Analytics Module</Text>
          </View>
          <Controller
            control={control}
            name="featureFlags.analyticsEnabled"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: theme.colors.border, true: theme.colors.primaryDark }}
                disabled={initialData.permissions.featureFlags === 'READ_ONLY'}
              />
            )}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Reports Module</Text>
          </View>
          <Controller
            control={control}
            name="featureFlags.reportsEnabled"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: theme.colors.border, true: theme.colors.primaryDark }}
                disabled={initialData.permissions.featureFlags === 'READ_ONLY'}
              />
            )}
          />
        </View>
      </View>

      {/* Rewards Limits */}
      <View style={styles.section}>
        {renderSectionHeader('Rewards', 'Configure limits for rewards processing')}
        
        <View style={styles.inputGroup}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Min Amount (₹)</Text>
            <Controller
              control={control}
              name="rewards.minRewardAmount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.rewards?.minRewardAmount && styles.inputError]}
                  value={value.toString()}
                  onChangeText={(val) => onChange(Number(val) || 0)}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  editable={initialData.permissions.rewards !== 'READ_ONLY'}
                />
              )}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Max Amount (₹)</Text>
            <Controller
              control={control}
              name="rewards.maxRewardAmount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.rewards?.maxRewardAmount && styles.inputError]}
                  value={value.toString()}
                  onChangeText={(val) => onChange(Number(val) || 0)}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  editable={initialData.permissions.rewards !== 'READ_ONLY'}
                />
              )}
            />
          </View>
        </View>
        {errors.rewards?.maxRewardAmount && (
          <Text style={styles.errorText}>{errors.rewards.maxRewardAmount.message}</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.btn, styles.btnReset]} 
          onPress={handleReset}
          disabled={updateMutation.isPending}
        >
          <RotateCcw size={18} color={theme.colors.textSecondary} />
          <Text style={styles.btnResetText}>Reset to Server</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.btn, 
            styles.btnSave, 
            (!isDirty || updateMutation.isPending) && styles.btnSaveDisabled
          ]} 
          onPress={handleSubmit(onSubmit)}
          disabled={!isDirty || updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Save size={18} color="#fff" />
              <Text style={styles.btnSaveText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  sectionDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  rowText: {
    flex: 1,
  },
  label: {
    ...theme.typography.body,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    marginTop: theme.spacing.md,
  },
  inputGroup: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    ...theme.typography.body,
    backgroundColor: theme.colors.background,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.sm,
    flex: 1,
  },
  btnReset: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  btnResetText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
  },
  btnSave: {
    backgroundColor: theme.colors.primaryDark,
    marginLeft: theme.spacing.sm,
  },
  btnSaveDisabled: {
    opacity: 0.5,
  },
  btnSaveText: {
    ...theme.typography.button,
    color: '#fff',
  }
});
