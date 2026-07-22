import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCompanyStatsQuery } from '../hooks/useCompanies';

export function CompanyStatsRow() {
  const { data, isLoading } = useCompanyStatsQuery();

  const stats = [
    {
      icon: <MaterialCommunityIcons name="office-building" size={20} color={theme.colors.success} />,
      iconBg: theme.colors.successBackground,
      title: 'Total Companies',
      value: data?.total?.toString() || '0',
      subtitle: 'All time',
    },
    {
      icon: <Feather name="users" size={20} color={theme.colors.primaryDark} />,
      iconBg: theme.colors.primaryLight + '30',
      title: 'Active Companies',
      value: data?.active?.toString() || '0',
      subtitle: data?.total ? `${((data.active / data.total) * 100).toFixed(1)}% of total` : '0% of total',
    },
    {
      icon: <Feather name="clock" size={20} color={theme.colors.warning} />,
      iconBg: theme.colors.warningBackground,
      title: 'Pending Approval',
      value: data?.pending?.toString() || '0',
      subtitle: 'Requires review',
    },
    {
      icon: <Feather name="shield" size={20} color={theme.colors.error} />,
      iconBg: theme.colors.error + '20',
      title: 'Suspended',
      value: data?.suspended?.toString() || '0',
      subtitle: 'Action required',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stats.map((stat, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: stat.iconBg }]}>
                {stat.icon}
              </View>
              <View style={styles.titleContainer}>
                <Typography style={styles.title} numberOfLines={1}>{stat.title}</Typography>
              </View>
            </View>
            <View style={styles.valueSection}>
              <Typography variant="title" style={styles.value}>{stat.value}</Typography>
              <Typography style={styles.subtitle}>{stat.subtitle}</Typography>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: 12,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    width: 160,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  valueSection: {
    alignItems: 'flex-start',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  }
});
