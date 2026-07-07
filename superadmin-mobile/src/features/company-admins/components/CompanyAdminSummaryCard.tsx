import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../../constants/theme';
import { Typography } from '../../../components/common/Typography';
import { Feather } from '@expo/vector-icons';
import { CreateCompanyAdminFormValues } from '../schemas/company-admin.schema';

interface CompanyAdminSummaryCardProps {
  company: {
    displayId: string;
    name: string;
  };
  values: Partial<CreateCompanyAdminFormValues>;
}

export const CompanyAdminSummaryCard: React.FC<CompanyAdminSummaryCardProps> = ({ company, values }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Feather name="file-text" size={18} color={theme.colors.success} />
        <Typography variant="title" style={styles.cardTitle}>Summary</Typography>
      </View>

      <View style={styles.summaryItem}>
        <View style={styles.labelContainer}>
          <Feather name="home" size={16} color={theme.colors.textSecondary} />
          <Typography style={styles.label}>Company</Typography>
        </View>
        <Typography style={styles.value}>{company.name} ({company.displayId})</Typography>
      </View>

      <View style={styles.summaryItem}>
        <View style={styles.labelContainer}>
          <Feather name="user" size={16} color={theme.colors.textSecondary} />
          <Typography style={styles.label}>Admin Name</Typography>
        </View>
        <Typography style={styles.value}>{values.fullName || '-'}</Typography>
      </View>

      <View style={styles.summaryItem}>
        <View style={styles.labelContainer}>
          <Feather name="phone" size={16} color={theme.colors.textSecondary} />
          <Typography style={styles.label}>Phone Number</Typography>
        </View>
        <Typography style={styles.value}>{values.phone || '-'}</Typography>
      </View>

      <View style={styles.summaryItem}>
        <View style={styles.labelContainer}>
          <Feather name="mail" size={16} color={theme.colors.textSecondary} />
          <Typography style={styles.label}>Email Address</Typography>
        </View>
        <Typography style={styles.value}>{values.email || '-'}</Typography>
      </View>

      <View style={styles.summaryItem}>
        <View style={styles.labelContainer}>
          <Feather name="shield" size={16} color={theme.colors.textSecondary} />
          <Typography style={styles.label}>Assigned Role</Typography>
        </View>
        <View style={styles.badge}>
          <Typography style={styles.badgeText}>Company Admin</Typography>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  value: {
    fontWeight: '500',
    fontSize: 13,
  },
  badge: {
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: theme.colors.success,
    fontSize: 11,
    fontWeight: '600',
  }
});
