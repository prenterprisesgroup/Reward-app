import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Typography } from '@/components/common/Typography';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { useWorkerDetailsQuery } from '@/features/super-admin/hooks/useSuperAdminListQueries';
import { useCompanyWorkersQuery, useCompaniesQuery } from '@/features/companies/hooks/useCompanies';
import { Image } from 'expo-image';
import { formatDistanceToNow, format } from 'date-fns';
import { Feather } from '@expo/vector-icons';

export default function WorkerProfileScreen() {
  const { id, companyId } = useLocalSearchParams<{ id: string, companyId?: string }>();
  const router = useRouter();

  // Fetch global worker details
  const { data: workerData, isLoading: isLoadingWorker, isError: isErrorWorker } = useWorkerDetailsQuery(id);
  const worker = workerData?.user || workerData;

  // Fetch company specific stats if companyId is present
  // We use the search parameter with the worker's phone number to find their specific stats in this company
  const { data: companyWorkersData, isLoading: isLoadingCompanyStats } = useCompanyWorkersQuery(
    companyId || '', 
    { search: worker?.phone },
    // Only enable this query if we have both companyId and the worker's phone
  );

  // If we can't find by phone, fallback to finding by name in the results
  const companyStats = useMemo(() => {
    if (!companyId || !companyWorkersData) return null;
    const workersList = companyWorkersData.pages.flatMap((p: any) => p.data);
    return workersList.find((w: any) => w.id === id) || workersList[0]; // workersList[0] as fallback if search by phone matched
  }, [companyWorkersData, companyId, id]);

  const { data: companiesData } = useCompaniesQuery({ search: companyId ? undefined : '' });
  const companyInfo = useMemo(() => {
    if (!companyId || !companiesData) return null;
    const allCompanies = companiesData.pages.flatMap((p: any) => p.data);
    return allCompanies.find((c: any) => c.id === companyId);
  }, [companiesData, companyId]);

  if (isLoadingWorker) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ScreenHeader title="Worker Profile" showBack />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isErrorWorker || !worker) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ScreenHeader title="Worker Profile" showBack />
        <View style={styles.centerContent}>
          <Feather name="alert-circle" size={48} color={theme.colors.error} />
          <Typography variant="headingSm" style={{ marginTop: theme.spacing.md }}>Error Loading Worker</Typography>
          <Typography variant="body" color="textSecondary">Could not load worker details.</Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Worker Profile" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Global Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {worker.profilePhotoUrl || worker.profilePhoto ? (
              <Image source={{ uri: worker.profilePhotoUrl || worker.profilePhoto }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Typography variant="headingMd" color="primaryDark">
                  {worker.name?.charAt(0)?.toUpperCase() || 'W'}
                </Typography>
              </View>
            )}
          </View>
          <Typography variant="headingMd" style={styles.name}>{worker.name}</Typography>
          <Typography variant="body" color="textSecondary">{worker.phone}</Typography>
          
          <View style={[styles.statusBadge, worker.isActive ? styles.statusActive : styles.statusInactive]}>
            <Typography variant="caption" color={worker.isActive ? 'success' : 'error'}>
              {worker.isActive ? 'ACTIVE WORKER' : 'INACTIVE WORKER'}
            </Typography>
          </View>
        </View>

        {/* Global Stats */}
        <View style={styles.section}>
          <Typography variant="title" style={styles.sectionTitle}>Global Statistics</Typography>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Feather name="award" size={24} color={theme.colors.primary} />
              <Typography variant="headingSm" style={styles.statValue}>₹{worker.walletBalance || 0}</Typography>
              <Typography variant="caption" color="textSecondary">Current Balance</Typography>
            </View>
            <View style={styles.statBox}>
              <Feather name="calendar" size={24} color={theme.colors.info} />
              <Typography variant="headingSm" style={styles.statValue}>
                {worker.createdAt ? format(new Date(worker.createdAt), 'MMM yyyy') : 'N/A'}
              </Typography>
              <Typography variant="caption" color="textSecondary">Joined Platform</Typography>
            </View>
          </View>
        </View>

        {/* Company Specific Stats */}
        {companyId && (
          <View style={[styles.section, styles.companySection]}>
            <View style={styles.companySectionHeader}>
              <Feather name="briefcase" size={20} color={theme.colors.primary} />
              <Typography variant="title" style={styles.companySectionTitle}>
                {companyInfo ? `${companyInfo.name} Insights` : 'Company Insights'}
              </Typography>
            </View>
            
            {isLoadingCompanyStats ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ padding: 20 }} />
            ) : companyStats ? (
              <View>
                <View style={styles.companyStatsRow}>
                  <View style={styles.companyStatItem}>
                    <Typography variant="label" color="textTertiary">Rewards Earned</Typography>
                    <Typography variant="headingSm" color="primary">₹{companyStats.totalRewardsEarned}</Typography>
                  </View>
                  <View style={styles.companyStatItem}>
                    <Typography variant="label" color="textTertiary">QR Scans</Typography>
                    <Typography variant="headingSm">{companyStats.totalQrScans}</Typography>
                  </View>
                </View>
                
                <View style={styles.timelineContainer}>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Typography variant="caption" color="textSecondary">First Interaction</Typography>
                      <Typography variant="body">
                        {companyStats.joinDate ? format(new Date(companyStats.joinDate), 'PPp') : 'N/A'}
                      </Typography>
                    </View>
                  </View>
                  <View style={styles.timelineLine} />
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDotActive} />
                    <View style={styles.timelineContent}>
                      <Typography variant="caption" color="textSecondary">Last Scan</Typography>
                      <Typography variant="body">
                        {companyStats.lastScanDate ? formatDistanceToNow(new Date(companyStats.lastScanDate), { addSuffix: true }) : 'N/A'}
                      </Typography>
                      {companyStats.lastRewardAmount > 0 && (
                        <Typography variant="caption" color="success">
                          +₹{companyStats.lastRewardAmount} earned
                        </Typography>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <Typography variant="body" color="textSecondary" style={{ padding: 16, textAlign: 'center' }}>
                No interaction data found for this company.
              </Typography>
            )}
          </View>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  statusActive: {
    backgroundColor: theme.colors.success + '1A',
  },
  statusInactive: {
    backgroundColor: theme.colors.error + '1A',
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    marginTop: theme.spacing.sm,
    marginBottom: 2,
  },
  companySection: {
    backgroundColor: theme.colors.primary + '08',
    borderColor: theme.colors.primary + '33',
  },
  companySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  companySectionTitle: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.primaryDark,
  },
  companyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  companyStatItem: {
    flex: 1,
  },
  timelineContainer: {
    paddingLeft: theme.spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.border,
    marginTop: 4,
    marginRight: theme.spacing.md,
    zIndex: 2,
  },
  timelineDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
    marginRight: theme.spacing.md,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 12,
    bottom: 24,
    width: 2,
    backgroundColor: theme.colors.border,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
  },
});
