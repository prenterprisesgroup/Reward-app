import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';

// Admin Components
import { WorkerProfileCard } from '../../components/admin/WorkerProfileCard';
import { WorkerWalletSummaryCard } from '../../components/admin/WorkerWalletSummaryCard';
import { RewardHistoryTimeline } from '../../components/admin/RewardHistoryTimeline';
import { WithdrawalHistoryCard } from '../../components/admin/WithdrawalHistoryCard';
import { WorkerInformationCard } from '../../components/admin/WorkerInformationCard';
import { WorkerQuickActions } from '../../components/admin/WorkerQuickActions';
import { useLocalSearchParams } from 'expo-router';
import { useWorkerDetailsQuery } from '../../hooks/useWorkerDetailsQuery';
import { useWorkerRewardHistoryQuery } from '../../hooks/useWorkerRewardHistoryQuery';
import { useWorkerWithdrawalHistoryQuery } from '../../hooks/useWorkerWithdrawalHistoryQuery';
import { ActivityIndicator } from 'react-native';

export default function WorkerDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: detailsResp, isLoading: isLoadingDetails } = useWorkerDetailsQuery(id!);
  const { data: rewardsResp, isLoading: isLoadingRewards } = useWorkerRewardHistoryQuery(id!);
  const { data: withdrawalsResp, isLoading: isLoadingWithdrawals } = useWorkerWithdrawalHistoryQuery(id!);

  const data = detailsResp?.data;
  const rewardHistory = rewardsResp?.pages?.flatMap(p => p.data) || [];
  const withdrawalHistory = withdrawalsResp?.pages?.flatMap(p => p.data) || [];

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Typography variant="headingMd" weight="bold">Worker Details</Typography>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Feather name="bell" size={24} color={theme.colors.textPrimary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {isLoadingDetails ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : data ? (
          <ScrollView 
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInUp.delay(100).springify()}>
              <WorkerProfileCard worker={data.worker} onCall={() => {}} />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
              <WorkerWalletSummaryCard 
                walletBalance={data.companyMetrics.walletBalance}
                pendingWithdrawal={data.companyMetrics.pendingWithdrawal}
                lifetimeRewards={data.companyMetrics.lifetimeRewards}
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
              <RewardHistoryTimeline history={rewardHistory as any} />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.section}>
              <WithdrawalHistoryCard history={withdrawalHistory as any} />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.section}>
              <WorkerInformationCard worker={data.worker} metrics={data.companyMetrics} />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(600).springify()}>
              <WorkerQuickActions />
            </Animated.View>

          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Typography>Worker not found</Typography>
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  section: {
    marginTop: theme.spacing.xl,
  }
});
