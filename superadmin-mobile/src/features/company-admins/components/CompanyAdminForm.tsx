import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { theme } from '../../../constants/theme';
import { Typography } from '../../../components/common/Typography';
import { InputField as Input } from '../../../components/forms/InputField';
import { Feather } from '@expo/vector-icons';
import { Switch } from 'react-native-gesture-handler';

interface CompanyAdminFormProps {
  isEditing?: boolean;
}

export const CompanyAdminForm: React.FC<CompanyAdminFormProps> = ({ isEditing = false }) => {
  const { control, watch, setValue } = useFormContext();
  const [showPassword, setShowPassword] = React.useState(false);
  const autoGenerate = watch('autoGenerate');

  return (
    <View style={styles.container}>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="user" size={18} color={theme.colors.success} />
          <Typography variant="title" style={styles.cardTitle}>Admin Information</Typography>
        </View>

        <View style={styles.row}>
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="Full Name *"
                  placeholder="Enter full name"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                  leftIcon={<Feather name="user" size={18} color={theme.colors.textSecondary} />}
                />
              )}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="Phone Number *"
                  placeholder="+91 Enter phone number"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                  keyboardType="phone-pad"
                  leftIcon={<Feather name="phone" size={18} color={theme.colors.textSecondary} />}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="Email Address *"
                  placeholder="Enter email address"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Feather name="mail" size={18} color={theme.colors.textSecondary} />}
                />
              )}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="employeeId"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="Employee ID (Optional)"
                  placeholder="Enter employee ID"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                  leftIcon={<Feather name="credit-card" size={18} color={theme.colors.textSecondary} />}
                />
              )}
            />
          </View>
        </View>
      </View>

      {!isEditing && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="lock" size={18} color={theme.colors.success} />
            <Typography variant="title" style={styles.cardTitle}>Login Information</Typography>
          </View>

          <View style={styles.row}>
            <View style={styles.fieldContainer}>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Username (Optional)"
                    placeholder="Enter username"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    autoCapitalize="none"
                    leftIcon={<Feather name="user" size={18} color={theme.colors.textSecondary} />}
                  />
                )}
              />
            </View>
            <View style={styles.fieldContainer}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Temporary Password *"
                    placeholder="Enter password"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    secureTextEntry={!showPassword}
                    editable={!autoGenerate}
                    leftIcon={<Feather name="lock" size={18} color={theme.colors.textSecondary} />}
                    rightIcon={
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    }
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.toggleRow}>
            <View>
              <Typography style={styles.toggleTitle}>Auto Generate Password</Typography>
              <Typography style={styles.toggleSub}>System will generate a strong password</Typography>
            </View>
            <Controller
              control={control}
              name="autoGenerate"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={(val) => {
                    onChange(val);
                    if (val) {
                      setValue('password', '', { shouldValidate: true });
                    }
                  }}
                  trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                />
              )}
            />
          </View>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="shield" size={18} color={theme.colors.success} />
          <Typography variant="title" style={styles.cardTitle}>Role</Typography>
        </View>
        <Input
          label="Select Role *"
          value="Company Admin"
          editable={false}
          leftIcon={<Feather name="users" size={18} color={theme.colors.textSecondary} />}
          rightIcon={<Feather name="chevron-down" size={18} color={theme.colors.textSecondary} />}
        />
      </View>

      <View style={styles.twoColCardContainer}>
        <View style={[styles.card, styles.halfCard]}>
          <View style={styles.cardHeader}>
            <Feather name="shield" size={18} color={theme.colors.success} />
            <Typography variant="title" style={styles.cardTitle}>Permissions Preview</Typography>
          </View>
          <Typography style={styles.permissionSub}>The Company Admin will be able to:</Typography>
          
          <View style={styles.permissionItem}>
            <Feather name="check-circle" size={16} color={theme.colors.success} />
            <Typography style={styles.permissionText}>Manage Workers</Typography>
          </View>
          <View style={styles.permissionItem}>
            <Feather name="check-circle" size={16} color={theme.colors.success} />
            <Typography style={styles.permissionText}>Generate QR Reward Batches</Typography>
          </View>
          <View style={styles.permissionItem}>
            <Feather name="check-circle" size={16} color={theme.colors.success} />
            <Typography style={styles.permissionText}>Approve Withdrawals</Typography>
          </View>
          <View style={styles.permissionItem}>
            <Feather name="check-circle" size={16} color={theme.colors.success} />
            <Typography style={styles.permissionText}>View Reports</Typography>
          </View>
        </View>

        <View style={[styles.card, styles.halfCard]}>
          <View style={styles.cardHeader}>
            <Feather name="send" size={18} color={theme.colors.success} />
            <Typography variant="title" style={styles.cardTitle}>Invitation Options</Typography>
          </View>
          
          <View style={styles.toggleRowSmall}>
            <View style={{ flex: 1 }}>
              <Typography style={styles.toggleTitleSmall}>Send Welcome Email</Typography>
              <Typography style={styles.toggleSubSmall}>Send login credentials via email</Typography>
            </View>
            <Controller control={control} name="sendWelcomeEmail" render={({ field: { value } }) => (
              <Switch value={value} disabled trackColor={{ false: theme.colors.border, true: theme.colors.success }} />
            )} />
          </View>
          
          <View style={styles.toggleRowSmall}>
            <View style={{ flex: 1 }}>
              <Typography style={styles.toggleTitleSmall}>Send SMS Credentials</Typography>
              <Typography style={styles.toggleSubSmall}>Send login details via SMS</Typography>
            </View>
            <Controller control={control} name="sendSmsCredentials" render={({ field: { value } }) => (
              <Switch value={value} disabled trackColor={{ false: theme.colors.border, true: theme.colors.success }} />
            )} />
          </View>
          
          <View style={styles.toggleRowSmall}>
            <View style={{ flex: 1 }}>
              <Typography style={styles.toggleTitleSmall}>Generate Invite Link</Typography>
              <Typography style={styles.toggleSubSmall}>Create an invite link to share</Typography>
            </View>
            <Controller control={control} name="generateInviteLink" render={({ field: { value } }) => (
              <Switch value={value} disabled trackColor={{ false: theme.colors.border, true: theme.colors.success }} />
            )} />
          </View>
        </View>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  fieldContainer: {
    flex: 1,
    minWidth: 140,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  toggleTitle: {
    fontWeight: '500',
  },
  toggleSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  twoColCardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  halfCard: {
    flex: 1,
    minWidth: 280,
  },
  permissionSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 13,
    flexShrink: 1,
  },
  toggleRowSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleTitleSmall: {
    fontWeight: '500',
    fontSize: 13,
  },
  toggleSubSmall: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
