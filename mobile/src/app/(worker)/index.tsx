import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../components/common/Typography';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { BottomNavigation } from '../../components/navigation/BottomNavigation';
import { useUserQuery, useWalletQuery } from '../../hooks/useWalletQuery';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { WalletData, RewardTransaction, PendingWithdrawal } from '../../types/backend.types';

export default function WorkerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomSpacing = Math.max(insets.bottom + 12, 24);

  const { data: user, isLoading: isUserLoading, isError: isUserError, refetch: refetchUser } = useUserQuery();
  const { data: wallet, isLoading: isWalletLoading, isError: isWalletError, refetch: refetchWallet } = useWalletQuery();

  const isLoading = isUserLoading || isWalletLoading;
  const isError = isUserError || isWalletError;

  const handleRefetch = () => {
    refetchUser();
    refetchWallet();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Feather name="alert-circle" size={48} color={theme.colors.error} style={{ marginBottom: 16 }} />
        <Typography style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Something went wrong</Typography>
        <Typography style={{ color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>We couldn't load your data. Please check your connection.</Typography>
        <TouchableOpacity style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }} onPress={handleRefetch}>
          <Typography style={{ color: '#FFF', fontWeight: 'bold' }}>Try Again</Typography>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const walletData = wallet as WalletData;
  const recentRewards = Array.isArray(walletData?.recentRewards) ? walletData.recentRewards : [];
  const pendingWithdrawals = Array.isArray(walletData?.pendingWithdrawals) ? walletData.pendingWithdrawals : [];

  const generateChartData = (rewards: any[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ day, value: 0 }));
    
    // Process only last 7 days roughly, or just aggregate by day of week
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    rewards.forEach(reward => {
      const date = new Date(reward.createdAt);
      if (date >= sevenDaysAgo && reward.status === 'COMPLETED' || reward.status === 'PENDING') {
        const dayName = days[date.getDay()];
        const entry = data.find(d => d.day === dayName);
        if (entry) {
          entry.value += reward.amount;
        }
      }
    });
    
    // Shift the array so today is at the end
    const todayIndex = now.getDay();
    const sortedData = [
      ...data.slice(todayIndex + 1),
      ...data.slice(0, todayIndex + 1)
    ];
    
    return sortedData;
  };

  const chartData = generateChartData(recentRewards);
  const maxChartValue = Math.max(...chartData.map(d => d.value));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FAF7F2' }]} edges={['top', 'left', 'right']}>
      {/* Decorative blurred glow */}
      <View style={styles.headerGlow} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextWrapper}>
            <Typography style={styles.headerGreeting}>Good Morning{user?.name ? ',' : ''}</Typography>
            <View style={styles.nameRow}>
              <Typography style={styles.headerName}>{user?.name || ''}</Typography>
              <Typography style={styles.waveEmoji}>👋</Typography>
            </View>
            <Typography style={styles.headerSubtitle}>Welcome back</Typography>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(worker)/notifications')} accessible={true} accessibilityRole="button">
              <Feather name="bell" size={24} color="#2F3A36" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            
            <View style={styles.avatarWrapper}>
              <Image source={require('../../../assets/images/avatar.png')} style={styles.avatar} />
              <View style={styles.onlineStatusDot} />
            </View>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceContentWrapper}>
            <Typography style={styles.balanceLabel}>Current Reward Balance</Typography>
            <Typography style={styles.balanceValue}>₹{walletData?.balance || 0}</Typography>
            
            <View style={styles.earningsRow}>
              <View style={styles.earningsBadge}>
                <Typography style={styles.earningsBadgeText}>Today's Earnings</Typography>
              </View>
              <Typography style={styles.earningsAmount}>+₹{walletData?.todayEarnings || 0}</Typography>
            </View>
            
            <View style={styles.updatedRow}>
              <Feather name="clock" size={12} color={theme.colors.primary} />
              <Typography style={styles.updatedText}>Last updated {walletData?.lastUpdated || 'just now'}</Typography>
            </View>
          </View>
          
          {/* Responsive Illustration */}
          <View style={styles.illustrationWrapper}>
            <Image source={require('../../../assets/images/wallet.png')} style={styles.balanceIllustration} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Typography style={styles.sectionTitle}>Quick Actions</Typography>
        </View>
        
        <View style={styles.quickActionsGrid}>
          {/* Card 1 */}
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(worker)/scan')} accessible={true} accessibilityRole="button">
            <View style={styles.actionIconWrapper}>
              <MaterialCommunityIcons name="line-scan" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.actionTextContent}>
              <Typography style={styles.actionCardTitle}>Scan QR</Typography>
              <Typography style={styles.actionCardSubtitle}>Scan & earn rewards</Typography>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.placeholder} />
          </TouchableOpacity>
          {/* Card 2 */}
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(worker)/wallet')} accessible={true} accessibilityRole="button">
            <View style={styles.actionIconWrapper}>
              <MaterialCommunityIcons name="currency-rupee" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.actionTextContent}>
              <Typography style={styles.actionCardTitle}>Withdraw</Typography>
              <Typography style={styles.actionCardSubtitle}>Request payout</Typography>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.placeholder} />
          </TouchableOpacity>
          {/* Card 3 */}
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(worker)/wallet')} accessible={true} accessibilityRole="button">
            <View style={styles.actionIconWrapper}>
              <Feather name="file-text" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.actionTextContent}>
              <Typography style={styles.actionCardTitle}>Reward History</Typography>
              <Typography style={styles.actionCardSubtitle}>View all earnings</Typography>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.placeholder} />
          </TouchableOpacity>
          {/* Card 4 */}
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(worker)/profile')} accessible={true} accessibilityRole="button">
            <View style={styles.actionIconWrapper}>
              <Feather name="user" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.actionTextContent}>
              <Typography style={styles.actionCardTitle}>Profile</Typography>
              <Typography style={styles.actionCardSubtitle}>Manage your info</Typography>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.placeholder} />
          </TouchableOpacity>
        </View>

        {/* Two Columns Grid */}
        <View style={styles.twoColumnRow}>
          {/* Left Column: Recent Rewards */}
          <View style={styles.columnLeft}>
            <View style={styles.sectionHeader}>
              <Typography style={styles.sectionTitle} numberOfLines={1}>Recent Rewards</Typography>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessible={true} accessibilityRole="button" accessibilityLabel="View all"><Typography style={styles.viewAll}>View all {'>'}</Typography></TouchableOpacity>
            </View>
            <View style={styles.columnCard}>
              {recentRewards.length === 0 ? (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Typography style={{ color: theme.colors.textSecondary, fontSize: 12 }}>No recent rewards</Typography>
                </View>
              ) : (
                recentRewards.map((reward, index) => (
                  <View key={reward.id} style={[styles.rewardItem, index === recentRewards.length - 1 ? { borderBottomWidth: 0 } : undefined]}>
                    <View style={[styles.companyLogo, { backgroundColor: theme.colors.borderLight, justifyContent: 'center', alignItems: 'center' }]}>
                      <Typography style={{ fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary }}>
                        {reward.companyName.charAt(0)}
                      </Typography>
                    </View>
                    <View style={styles.rewardInfo}>
                      <Typography style={styles.companyName} numberOfLines={1}>{reward.companyName}</Typography>
                      <Typography style={styles.rewardTime}>{reward.createdAt}</Typography>
                    </View>
                    <View style={styles.rewardRight}>
                      <Typography style={styles.rewardAmount}>+₹{reward.amount}</Typography>
                      <View style={[styles.statusBadge, reward.status === 'PENDING' ? { backgroundColor: theme.colors.warningBackground } : undefined]}>
                        <Typography style={[styles.statusText, reward.status === 'PENDING' ? { color: theme.colors.warning } : undefined]}>
                          {reward.status.charAt(0) + reward.status.slice(1).toLowerCase()}
                        </Typography>
                      </View>
                    </View>
                  </View>
                ))
              )}
              {recentRewards.length > 0 && (
                <View style={styles.paginationDots}>
                  <View style={[styles.dot, styles.dotActive]} />
                  <View style={styles.dot} />
                </View>
              )}
            </View>
          </View>

          {/* Right Column: Pending Withdrawals */}
          <View style={styles.columnRight}>
            <View style={styles.sectionHeader}>
              <Typography style={styles.sectionTitle} numberOfLines={1}>Pending Withdrawals</Typography>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessible={true} accessibilityRole="button" accessibilityLabel="View all"><Typography style={styles.viewAll}>View all {'>'}</Typography></TouchableOpacity>
            </View>
            
            {pendingWithdrawals.length === 0 ? (
              <View style={[styles.columnCard, { padding: 16, alignItems: 'center' }]}>
                <Typography style={{ color: theme.colors.textSecondary, fontSize: 12 }}>No pending withdrawals</Typography>
              </View>
            ) : (
              pendingWithdrawals.map((withdrawal, index) => (
                <View key={withdrawal.id} style={[styles.columnCard, index > 0 ? { marginTop: 12 } : undefined]}>
                  <View style={styles.pendingTop}>
                    <Feather name="briefcase" size={18} color={theme.colors.textSecondary} style={styles.pendingIcon} />
                    <View style={styles.pendingInfo}>
                      <Typography style={styles.pendingCompany} numberOfLines={1}>{withdrawal.companyName}</Typography>
                      <Typography style={styles.pendingDate}>{withdrawal.date}</Typography>
                    </View>
                    <View style={styles.pendingAmountBox}>
                      <View style={styles.pendingBadge}>
                        <Typography style={styles.pendingBadgeText}>Pending</Typography>
                      </View>
                      <Typography style={styles.pendingAmount}>₹{withdrawal.amount}</Typography>
                    </View>
                  </View>
                  {withdrawal.upiId && (
                    <View style={styles.upiRow}>
                      <Typography style={styles.upiText}>UPI: {withdrawal.upiId}</Typography>
                      <Feather name="chevron-right" size={14} color={theme.colors.placeholder} />
                    </View>
                  )}
                </View>
              ))
            )}

          </View>
        </View>

        {/* Reward Insights */}
        <View style={styles.insightsHeader}>
          <Typography style={styles.insightsTitle}>Reward Insights</Typography>
          <View style={styles.insightsDropdown}>
            <Typography style={styles.insightsDropdownText}>This Week</Typography>
            <Feather name="chevron-down" size={16} color="#2F3A36" />
          </View>
        </View>
        <View style={styles.insightsCard}>
          <View style={styles.chartRow}>
            {chartData.map((data, index) => {
              const barHeight = Math.max(32, (data.value / maxChartValue) * 140);
              const isMax = data.value === maxChartValue;
              
              return (
                <View key={index} style={styles.chartColumn}>
                  <Typography style={[styles.chartValue, isMax && styles.chartValueActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
                    ₹{data.value}
                  </Typography>
                  <View style={[
                    styles.chartBar, 
                    { 
                      height: barHeight,
                      backgroundColor: isMax ? '#52796F' : '#84A98C' 
                    }
                  ]} />
                  <Typography style={[styles.chartDay, isMax && styles.chartDayActive]}>
                    {data.day}
                  </Typography>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Unified Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 24,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    zIndex: 10,
  },
  headerGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#84A98C',
    opacity: 0.15,
    transform: [{ scale: 2 }],
  },
  headerTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  headerGreeting: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2F3A36',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#84A98C',
    letterSpacing: -0.5,
    lineHeight: 56, // Prevent Android vertical clipping
  },
  waveEmoji: {
    fontSize: 32,
    marginLeft: 8,
    lineHeight: 56, // Align with text
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8E8E93',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#F3F4F6',
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  
  // Balance Card
  balanceCard: {
    backgroundColor: '#F0F5F2',
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    flexDirection: 'row', // Let text and image sit side by side natively
    alignItems: 'center',
    overflow: 'hidden',
  },
  balanceContentWrapper: {
    flex: 3, // Takes 3/5 of width
    zIndex: 2,
  },
  balanceLabel: {
    fontSize: theme.typography.size.body,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  balanceValue: {
    fontSize: theme.typography.size.displayMd,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    lineHeight: 52,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    flexWrap: 'wrap',
  },
  earningsBadge: {
    backgroundColor: '#E2EBE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  earningsBadgeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  earningsAmount: {
    fontSize: theme.typography.size.title,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  updatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updatedText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginLeft: 6,
    flexShrink: 1,
  },
  illustrationWrapper: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    height: 180,
    width: 180,
    zIndex: 1,
  },
  balanceIllustration: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  // Shared Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.size.subtitle,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    flexShrink: 1,
    marginRight: 8,
  },
  viewAll: {
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: '500',
  },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  actionCard: {
    width: '48%', // Responsive 2-column
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  actionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F7F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  actionTextContent: {
    flex: 1,
    marginRight: 4,
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  actionCardSubtitle: {
    fontSize: 10,
    color: theme.colors.textTertiary,
  },

  // Two Column Row (Recent & Pending)
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    alignItems: 'flex-start',
  },
  columnLeft: {
    width: '48%',
  },
  columnRight: {
    width: '48%',
  },
  columnCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  
  // Recent Rewards Internals
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  companyLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    flexShrink: 0,
  },
  rewardInfo: {
    flex: 1,
    marginRight: 4,
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  rewardTime: {
    fontSize: 9,
    color: theme.colors.textTertiary,
  },
  rewardRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  rewardAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#F3F7F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 8,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
  },
  dot: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: 2,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },

  // Pending Withdrawals Internals
  pendingTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pendingIcon: {
    marginRight: 8,
    flexShrink: 0,
  },
  pendingIconImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    flexShrink: 0,
  },
  pendingInfo: {
    flex: 1,
    marginRight: 4,
  },
  pendingCompany: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  pendingDate: {
    fontSize: 9,
    color: theme.colors.textTertiary,
  },
  pendingAmountBox: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  pendingBadge: {
    backgroundColor: theme.colors.warningBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  pendingBadgeText: {
    fontSize: 8,
    color: theme.colors.warning,
    fontWeight: '500',
  },
  pendingAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  upiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 12,
  },
  upiText: {
    flex: 1,
    fontSize: 9,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },

  // Insights Chart
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2F3A36',
  },
  insightsDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightsDropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2F3A36',
    marginRight: 4,
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180, 
  },
  chartColumn: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  chartValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    width: '100%',
    textAlign: 'center',
  },
  chartValueActive: {
    color: '#52796F',
  },
  chartBar: {
    width: '100%',
    maxWidth: 32,
    minWidth: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 12,
  },
  chartDay: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  chartDayActive: {
    color: '#52796F',
    fontWeight: 'bold',
  },

  bottomPadding: {
    height: 120, // Prevent scroll overlap with floating nav
  },

  // Bottom Navigation
  bottomNavWrapper: {
    position: 'absolute',
    // bottom is dynamic now
    left: 0,
    right: 0,
    alignItems: 'center', // Centers the nav container and the absolute floating button perfectly
  },
  bottomNavContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    height: 72,
    width: '92%', // Responsive width as required
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSpacer: {
    flex: 1, // Dynamically creates exactly enough gap for the center button
  },
  navLabel: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    marginTop: 4,
    fontWeight: '500',
  },
  floatingWalletBtn: {
    position: 'absolute',
    top: -24,
    left: '50%',
    transform: [{ translateX: -36 }], // Centers perfectly: 50% left minus half of its 72 width
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 4,
    borderColor: theme.colors.background,
  },
  floatingWalletText: {
    fontSize: 10,
    color: theme.colors.surface,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
