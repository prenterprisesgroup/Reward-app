import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { WalletData, RewardTransaction, PendingWithdrawal } from '../../types/backend.types';
import { ActivityTimelineItem } from '../../components/admin/ActivityTimelineItem';
import { PendingWithdrawalCard } from '../../components/admin/PendingWithdrawalCard';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';

import { useAdminDashboardStatsQuery } from '../../hooks/useAdminDashboardStatsQuery';
import { useRecentActivityQuery } from '../../hooks/useRecentActivityQuery';
import { usePendingWithdrawalsQuery } from '../../hooks/usePendingWithdrawalsQuery';

export default function CompanyAdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Bottom navigation height (76) + bottom position (Math.max(insets.bottom + 12, 24)) + 16 spacing
  const bottomNavOffset = Math.max(insets.bottom + 12, 24);
  const scrollPaddingBottom = 76 + bottomNavOffset + 16;

  const { data: statsData, isLoading: isStatsLoading, isError: isStatsError, refetch: refetchStats } = useAdminDashboardStatsQuery();
  const { data: activityData, isLoading: isActivityLoading } = useRecentActivityQuery(3);
  const { data: pendingData, isLoading: isPendingLoading } = usePendingWithdrawalsQuery(3);

  const formatAmount = (num: number) => {
    return '₹' + num.toLocaleString('en-IN');
  };

  const renderHeader = () => (
    <Animated.View entering={FadeIn.delay(100)} style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
      <View style={styles.headerLeft}>
        <Typography style={styles.greetingText}>Good Morning 👋</Typography>
        <Typography variant="headingLg" weight="bold" style={styles.companyName}>
          {statsData?.company?.name || 'Company Name'}
        </Typography>
        <View style={styles.badgeContainer}>
          <MaterialCommunityIcons name="shield-check" size={16} color={theme.colors.success} />
          <Typography style={styles.badgeText} weight="medium">Company Admin</Typography>
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.notificationBtn} accessible accessibilityRole="button" accessibilityLabel="Notifications">
          <Feather name="bell" size={24} color={theme.colors.textPrimary} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
        {statsData?.company?.logo ? (
          <Image 
            source={{ uri: statsData.company.logo }} 
            style={styles.profileAvatar}
            accessibilityRole="image"
            accessibilityLabel="Company Admin Profile"
          />
        ) : (
          <View style={[styles.profileAvatar, { backgroundColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }]}>
            <Typography weight="bold" style={{ color: theme.colors.textSecondary }}>
              {statsData?.company?.name?.charAt(0) || 'C'}
            </Typography>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderStats = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.statsScrollContent}
      style={styles.statsContainer}
    >
      <Animated.View entering={FadeInUp.delay(200).springify()}>
        <TouchableOpacity 
          style={styles.statCard}
          activeOpacity={0.7}
          onPress={() => router.push('/(admin)/workers')}
        >
          <View style={styles.statIconContainer}>
            <Feather name="users" size={20} color={theme.colors.primaryDark} />
          </View>
          <Typography style={styles.statTitle}>Active Workers</Typography>
          <Typography variant="headingLg" weight="bold" style={styles.statValue}>
            {isStatsLoading ? '-' : statsData?.stats?.activeWorkers || 0}
          </Typography>
          <View style={styles.statTrendRow}>
            <Feather name="arrow-up" size={14} color={theme.colors.success} />
            <Typography style={[styles.statTrendText, { color: theme.colors.success }]}>
              {statsData?.trends?.workers || '0%'} <Typography style={styles.statTrendSub}>trend</Typography>
            </Typography>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <MaterialCommunityIcons name="wallet-outline" size={20} color={theme.colors.primaryDark} />
        </View>
        <Typography style={styles.statTitle}>Pending Withdrawals</Typography>
        <Typography variant="headingLg" weight="bold" style={styles.statValue}>
          {isStatsLoading ? '-' : statsData?.stats?.pendingWithdrawals || 0}
        </Typography>
        <View style={styles.statTrendRow}>
          <Feather name="arrow-down" size={14} color={theme.colors.warning} />
          <Typography style={[styles.statTrendText, { color: theme.colors.warning }]}>
            {statsData?.trends?.withdrawals || '0%'} <Typography style={styles.statTrendSub}>trend</Typography>
          </Typography>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <MaterialCommunityIcons name="qrcode-scan" size={20} color={theme.colors.primaryDark} />
        </View>
        <Typography style={styles.statTitle}>QR Batches</Typography>
        <Typography variant="headingLg" weight="bold" style={styles.statValue}>
          {isStatsLoading ? '-' : statsData?.stats?.qrBatchCount || 0}
        </Typography>
        <TouchableOpacity style={styles.viewAllRow} onPress={() => router.push('/(admin)/qr-batches')}>
          <Typography style={styles.viewAllText}>View all</Typography>
          <Feather name="chevron-right" size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(350).springify()} style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <MaterialCommunityIcons name="wallet-outline" size={20} color={theme.colors.primaryDark} />
        </View>
        <Typography style={styles.statTitle}>Rewards Distributed</Typography>
        <Typography variant="headingMd" weight="bold" style={styles.statValue}>
          {isStatsLoading ? '-' : formatAmount(statsData?.stats?.rewardsDistributed || 0)}
        </Typography>
        <View style={styles.statTrendRow}>
          <Feather name="arrow-up" size={14} color={theme.colors.success} />
          <Typography style={[styles.statTrendText, { color: theme.colors.success }]}>
            {statsData?.trends?.rewards || '0%'} <Typography style={styles.statTrendSub}>trend</Typography>
          </Typography>
        </View>
      </Animated.View>
    </ScrollView>
  );

  const { toastConfig, showToast, hideToast } = useToast();

  const renderQuickActions = () => (
    <View style={styles.sectionContainer}>
      <Typography variant="title" weight="bold" style={[styles.sectionTitle, { paddingHorizontal: theme.spacing.xl }]}>Quick Actions</Typography>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.quickActionsScrollContent}
      >
        {[
          { title: 'Generate\nQR Batch', icon: 'qrcode-scan', family: MaterialCommunityIcons, route: '/(admin)/create-qr-batch' },
          { title: 'Payment\nRequests', icon: 'file-text', family: Feather, route: '/(admin)/payments' },
          { title: 'Workers', icon: 'users', family: Feather, route: '/(admin)/workers' },
          // { title: 'Reports', icon: 'bar-chart-2', family: Feather, route: null, disabled: true },
        ].map((action, index) => (
          <Animated.View key={index} entering={FadeInUp.delay(400 + (index * 50)).springify()}>
            <TouchableOpacity 
              style={[styles.quickActionCard, action.disabled ? styles.quickActionCardDisabled : null]}
              activeOpacity={0.7}
              onPress={() => {
                if (action.route) {
                  router.push(action.route as any);
                } else {
                  showToast('Reports are not available yet.', 'warning');
                }
              }}
            >
              <View style={styles.quickActionIconWrapper}>
                <action.family name={action.icon as any} size={24} color={theme.colors.primaryDark} />
              </View>
              <Typography style={styles.quickActionTitle} weight="medium">{action.title}</Typography>
              <View style={styles.quickActionBtn}>
                <Feather name="arrow-right" size={16} color={theme.colors.primaryDark} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
      <Toast {...toastConfig} onHide={hideToast} />
    </View>
  );

  const renderRecentActivity = () => (
    <View style={[styles.sectionContainer, { paddingHorizontal: theme.spacing.xl }]}>
      <View style={styles.sectionHeader}>
        <Typography variant="title" weight="bold" style={styles.sectionTitle}>Recent Activity</Typography>
        <TouchableOpacity style={styles.viewAllRow} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => router.push('/(admin)/recent-activity')}>
          <Typography style={styles.viewAllText}>View All</Typography>
          <Feather name="chevron-right" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.activityCard}>
        {isActivityLoading ? (
          <Typography style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: 20 }}>Loading...</Typography>
        ) : !(activityData?.pages?.[0] as any)?.items?.length ? (
          <Typography style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: 20 }}>No recent activity</Typography>
        ) : (
          (activityData.pages[0] as any).items.map((act: any, index: number) => {
            // Map backend shape to expected component props for now (ActivityTimelineItem expects certain colors based on type)
            let icon = 'qrcode-scan';
            let iconColor = theme.colors.success;
            let iconBg = theme.colors.successBackground;
            let amountColor = theme.colors.success;
            
            if (act.type === 'WITHDRAW_REQUEST') {
              icon = 'wallet-outline';
              iconColor = theme.colors.warning;
              iconBg = theme.colors.warningBackground;
              amountColor = theme.colors.warning;
            } else if (act.type === 'REWARD_DISTRIBUTED' || act.type === 'MANUAL_REWARD') {
              icon = 'gift-outline';
            }

            const mappedItem = {
              ...act,
              desc: `${act.worker || 'Unknown worker'} ${act.type.replace('_', ' ').toLowerCase()}`,
              time: new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              icon,
              iconColor,
              iconBg,
              amountColor,
            };

            return (
              <ActivityTimelineItem 
                key={act.id} 
                item={mappedItem} 
                index={index} 
                isLast={index === ((activityData.pages[0] as any).items.length || 0) - 1} 
              />
            );
          })
        )}
      </Animated.View>
    </View>
  );

  const renderPendingWithdrawals = () => (
    <View style={[styles.sectionContainer, { paddingHorizontal: theme.spacing.xl }]}>
      <View style={styles.sectionHeader}>
        <Typography variant="title" weight="bold" style={styles.sectionTitle}>Pending Withdrawal Requests</Typography>
        <TouchableOpacity style={styles.viewAllRow} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => router.push('/(admin)/pending-requests')}>
          <Typography style={styles.viewAllText}>View All</Typography>
          <Feather name="chevron-right" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <Animated.View entering={FadeInUp.delay(800).springify()} style={styles.activityCard}>
        {isPendingLoading ? (
          <Typography style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: 20 }}>Loading...</Typography>
        ) : !(pendingData?.pages?.[0] as any)?.withdrawals?.length ? (
          <Typography style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: 20 }}>No pending requests</Typography>
        ) : (
          (pendingData.pages[0] as any).withdrawals.map((req: any, index: number) => {
            const mappedItem = {
              id: req.id || req._id,
              name: req.worker?.name || 'Unknown',
              avatar: req.worker?.profilePhoto || `https://ui-avatars.com/api/?name=${req.worker?.name || 'U'}&background=random`,
              upi: req.upiId,
              amount: formatAmount(req.amount),
              time: new Date(req.createdAt).toLocaleDateString()
            };

            return (
              <PendingWithdrawalCard 
                key={mappedItem.id} 
                item={mappedItem} 
                index={index} 
                isLast={index === ((pendingData.pages[0] as any).withdrawals.length || 0) - 1} 
              />
            );
          })
        )}
      </Animated.View>
    </View>
  );

  if (isStatsError) {
    return (
      <ScreenWrapper backgroundColor={theme.colors.background}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Feather name="alert-triangle" size={48} color={theme.colors.error} style={{ marginBottom: 16 }} />
          <Typography variant="headingMd" weight="bold" style={{ marginBottom: 8 }}>Failed to load dashboard</Typography>
          <Typography style={{ textAlign: 'center', color: theme.colors.textSecondary, marginBottom: 24 }}>
            There was an error connecting to the server. Please check your connection and try again.
          </Typography>
          <TouchableOpacity 
            style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: theme.radius.pill }}
            onPress={() => refetchStats()}
          >
            <Typography weight="medium" style={{ color: '#fff' }}>Retry</Typography>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={theme.colors.background}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
      >
        {renderHeader()}
        <View style={styles.content}>
          {renderStats()}
          {renderQuickActions()}
          {renderRecentActivity()}
          {renderPendingWithdrawals()}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 28,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    color: theme.colors.success,
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    borderWidth: 1.5,
    borderColor: theme.colors.surface,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  content: {
    paddingTop: theme.spacing.sm,
  },
  statsContainer: {
    marginBottom: theme.spacing.xl,
  },
  statsScrollContent: {
    paddingHorizontal: theme.spacing.xl,
    gap: 12,
  },
  statCard: {
    width: 130, // Uniform width
    height: 160, // Uniform height
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
    ...theme.shadows.sm,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.successBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: 22,
    color: theme.colors.textPrimary,
  },
  statTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTrendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  quickActionCardDisabled: {
    opacity: 0.5,
  },
  statTrendSub: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontWeight: '400',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '500',
    marginRight: 2,
  },
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  quickActionsScrollContent: {
    paddingHorizontal: theme.spacing.xl,
    gap: 12,
  },
  quickActionCard: {
    width: 130, // Uniform width
    height: 160, // Uniform height
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.sm,
  },
  quickActionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.successBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  quickActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
});
