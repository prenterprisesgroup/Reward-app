import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import { Typography } from '@/components/common/Typography';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Feather } from '@expo/vector-icons';
import { useCompanyDetailsQuery } from '@/features/companies/hooks/useCompanies';
import { format } from 'date-fns';

export default function CompanyReportsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dateFilter, setDateFilter] = useState('ALL_TIME'); // Future integration: Support 'LAST_7_DAYS', 'LAST_30_DAYS' etc.

  const { data: detailsData, isLoading, isError } = useCompanyDetailsQuery(id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ScreenHeader title="Company Reports" showBack />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !detailsData) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ScreenHeader title="Company Reports" showBack />
        <View style={styles.centerContent}>
          <Feather name="alert-circle" size={48} color={theme.colors.error} />
          <Typography variant="headingSm" style={{ marginTop: theme.spacing.md }}>Error Loading Reports</Typography>
          <Typography variant="body" color="textSecondary">Could not load report data.</Typography>
        </View>
      </SafeAreaView>
    );
  }

  const { stats, company } = detailsData;

  const renderStatCard = (title: string, mainStat: string, subStats: { label: string, value: string }[], icon: any, color: string) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '1A' }]}>
          <Feather name={icon} size={24} color={color} />
        </View>
        <View style={styles.cardHeaderContent}>
          <Typography variant="title">{title}</Typography>
          <Typography variant="headingMd" color="primaryDark">{mainStat}</Typography>
        </View>
      </View>
      
      {subStats.length > 0 && (
        <View style={styles.subStatsContainer}>
          {subStats.map((stat, idx) => (
            <View key={idx} style={styles.subStatItem}>
              <Typography variant="caption" color="textSecondary">{stat.label}</Typography>
              <Typography variant="subtitle">{stat.value}</Typography>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Reports" showBack subtitle={company.name} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.filterSection}>
          <Typography variant="title">Date Range: All Time</Typography>
          <Typography variant="caption" color="textSecondary">
            Viewing cumulative data since {format(new Date(company.createdAt), 'MMM yyyy')}
          </Typography>
        </View>

        {renderStatCard(
          "Rewards", 
          `₹${stats.rewards.distributed}`, 
          [
            { label: "Pending", value: `₹${stats.rewards.pending}` },
          ],
          "award",
          theme.colors.primary
        )}

        {renderStatCard(
          "Workforce", 
          `${stats.workforce.workersCount}`, 
          [
            { label: "Active", value: `${stats.workforce.activeWorkers}` },
          ],
          "users",
          theme.colors.info
        )}

        {renderStatCard(
          "Withdrawals", 
          `${stats.withdrawals.approved}`, 
          [
            { label: "Pending", value: `${stats.withdrawals.pending}` },
            { label: "Rejected", value: `${stats.withdrawals.rejected}` },
          ],
          "dollar-sign",
          theme.colors.success
        )}

        {renderStatCard(
          "QR Scans & Batches", 
          `${stats.qr.batches}`, 
          [
            { label: "Active Batches", value: `${stats.qr.activeBatches}` },
          ],
          "grid",
          theme.colors.warning
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  filterSection: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  cardHeaderContent: {
    flex: 1,
  },
  subStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  subStatItem: {
    flex: 1,
    minWidth: '40%',
  },
});
