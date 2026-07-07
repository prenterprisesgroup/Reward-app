import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';

import { useApproveCompanyMutation, useRejectCompanyMutation, useSuspendCompanyMutation } from '../hooks/useCompanies';

interface CompanyAdminActionsProps {
  company: {
    id: string;
    status: string;
  };
}

export function CompanyAdminActions({ company }: CompanyAdminActionsProps) {
  const approveMutation = useApproveCompanyMutation();
  const rejectMutation = useRejectCompanyMutation();
  const suspendMutation = useSuspendCompanyMutation();

  const featureFlags = {
    approveCompany: true,
    rejectCompany: true,
    suspendCompany: true
  };

  const actions = [];

  if (featureFlags.approveCompany && (company.status === 'PENDING' || company.status === 'SUSPENDED')) {
    actions.push({
      icon: 'check-circle' as const,
      color: theme.colors.success,
      bgColor: theme.colors.successBackground,
      title: 'Approve Company',
      subtitle: 'Activate access',
      onPress: () => approveMutation.mutate(company.id)
    });
  }

  if (featureFlags.suspendCompany && company.status === 'ACTIVE') {
    actions.push({
      icon: 'pause-circle' as const,
      color: theme.colors.warning,
      bgColor: theme.colors.warningBackground,
      title: 'Suspend Company',
      subtitle: 'Temporarily suspend',
      onPress: () => suspendMutation.mutate(company.id)
    });
  }

  if (featureFlags.rejectCompany && company.status === 'PENDING') {
    actions.push({
      icon: 'x-circle' as const,
      color: theme.colors.error,
      bgColor: theme.colors.error + '10',
      title: 'Reject Company',
      subtitle: 'Decline application',
      onPress: () => rejectMutation.mutate(company.id)
    });
  }

  return (
    <View style={styles.container}>
      <Typography style={styles.sectionTitle} variant="title">Admin Actions</Typography>
      
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.card, { backgroundColor: action.bgColor }]}
            activeOpacity={0.7}
            onPress={action.onPress}
          >
            <View style={styles.iconContainer}>
              <Feather name={action.icon} size={20} color={action.color} />
            </View>
            <View style={styles.textContainer}>
              <Typography style={[styles.title, { color: action.color }]}>{action.title}</Typography>
              <Typography style={styles.subtitle}>{action.subtitle}</Typography>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  subtext: {
    fontSize: 8,
    color: theme.colors.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  }
});
