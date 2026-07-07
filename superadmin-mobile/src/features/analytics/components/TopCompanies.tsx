import React, { memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useTopCompaniesQuery } from '../hooks/useAnalytics';
import { theme } from '../../../constants/theme';
import { TopCompanyModel } from '../types/analytics.types';

const CompanyRow = memo(({ item, index }: { item: TopCompanyModel; index: number }) => (
  <View style={styles.row}>
    <Text style={styles.rank}>#{index + 1}</Text>
    <View style={styles.companyInfo}>
      {item.logoUrl ? (
        <Image source={{ uri: item.logoUrl }} style={styles.logo} />
      ) : (
        <View style={styles.logoPlaceholder} />
      )}
      <Text style={styles.companyName} numberOfLines={1}>{item.name}</Text>
    </View>
    <Text style={styles.value}>{item.formattedValue}</Text>
  </View>
));

export const TopCompanies = memo(() => {
  const { data, isLoading, isError } = useTopCompaniesQuery('rewards');

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primaryDark} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load top companies.</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No companies with rewards found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Top Companies by Rewards</Text>
      <View style={styles.list}>
        {data.map((company, idx) => (
          <CompanyRow key={company.id} item={company} index={idx} />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    elevation: 2,
    minHeight: 200,
    justifyContent: 'center',
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rank: {
    ...theme.typography.caption,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    width: 30,
  },
  companyInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: theme.spacing.sm,
  },
  logoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  companyName: {
    ...theme.typography.body,
    flex: 1,
  },
  value: {
    ...theme.typography.body,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
  }
});
