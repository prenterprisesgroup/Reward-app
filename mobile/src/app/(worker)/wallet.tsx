import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Wallet, ChevronRight, Clock, Info, QrCode, Building2 } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { BottomNavigation } from '../../components/navigation/BottomNavigation';
import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useWalletQuery, useWalletBreakdownQuery } from '../../hooks/useWalletQuery';
import { ActivityIndicator } from 'react-native';

export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomSpacing = Math.max(insets.bottom + 12, 24);

  const { data: walletData, isLoading: isLoadingWallet } = useWalletQuery();
  const { data: breakdownData, isLoading: isLoadingBreakdown } = useWalletBreakdownQuery();

  const transactions = Array.isArray(walletData?.recentRewards) ? walletData.recentRewards : [];
  const companies = Array.isArray(breakdownData?.companies) ? breakdownData.companies : [];

  const displayTransactions = useMemo(() => {
    return transactions.slice(0, 10);
  }, [transactions]);

  const renderTransaction = useCallback(({ item: tx }: { item: any }) => (
    <TouchableOpacity key={tx.id} style={styles.txRow} accessible={true} accessibilityRole="button">
      <View style={[styles.txLogoCircle, tx.status === 'PENDING' ? { backgroundColor: theme.colors.warningBackground } : undefined]}>
        <Typography style={[styles.txLogoText, tx.status === 'PENDING' ? { color: theme.colors.warning } : undefined]}>
          {tx.companyName ? tx.companyName.charAt(0) : 'C'}
        </Typography>
      </View>
      <View style={styles.txInfo}>
        <Typography style={styles.txCompany}>{tx.companyName}</Typography>
        <Typography style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</Typography>
      </View>
      <View style={styles.txRight}>
        <Typography style={[styles.txAmount, tx.status === 'PENDING' ? { color: theme.colors.warning } : undefined]}>
          +₹{tx.amount}
        </Typography>
        <View style={[styles.txBadge, tx.status === 'PENDING' ? { backgroundColor: theme.colors.warningBackground } : undefined]}>
          <Typography style={[styles.txBadgeText, tx.status === 'PENDING' ? { color: theme.colors.warning } : undefined]}>
            {tx.status}
          </Typography>
        </View>
      </View>
      <ChevronRight size={16} color={theme.colors.placeholder} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  ), []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessible={true} accessibilityRole="button" accessibilityLabel="Go back">
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Typography style={styles.headerTitle}>My Wallet</Typography>
            <Typography style={styles.headerSubtitle}>View your available rewards.</Typography>
          </View>
          
          <TouchableOpacity style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessible={true} accessibilityRole="button" accessibilityLabel="Notifications">
            <Bell size={20} color={theme.colors.textPrimary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Hero Wallet Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Typography style={styles.heroLabel}>Total Reward Balance</Typography>
            {isLoadingWallet ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 12 }} />
            ) : (
              <Typography style={styles.heroBalance}>₹{(walletData?.balance || 0).toLocaleString('en-IN')}</Typography>
            )}
            
            <View style={styles.availablePill}>
              <View style={styles.availableDot} />
              <Typography style={styles.availablePillText}>Total Earnings</Typography>
            </View>

            <View style={styles.lastUpdatedRow}>
              <Typography style={styles.lastUpdatedText}>Last Updated: {walletData?.lastUpdated ? new Date(walletData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</Typography>
              <Feather name="refresh-cw" size={12} color={theme.colors.textSecondary} />
            </View>
          </View>
          <View style={styles.heroIllustrationWrapper}>
            <Image source={require('../../../assets/images/wallet_hero.png')} style={styles.heroIllustration} contentFit="contain" />
          </View>
        </View>

        {/* Company Cards Section */}
        <View style={styles.sectionHeader}>
          <Typography style={styles.sectionTitle}>Company Balances</Typography>
        </View>

        {isLoadingBreakdown ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 32 }} />
        ) : companies.length > 0 ? (
          companies.map((company: any) => (
            <View key={company._id} style={styles.companyCard}>
              <View style={styles.companyHeader}>
                <View style={styles.companyLogo}>
                  <Building2 size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.companyInfo}>
                  <Typography style={styles.companyName}>{company.name}</Typography>
                  <Typography style={styles.companyBalanceLabel}>Available Balance</Typography>
                  <Typography style={styles.companyBalanceValue}>₹{company.balance.toLocaleString('en-IN')}</Typography>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.companyWithdrawBtn} 
                onPress={() => router.push({
                  pathname: '/(worker)/withdraw',
                  params: {
                    companyId: company._id,
                    companyName: company.name,
                    availableBalance: company.balance.toString()
                  }
                })}
              >
                <View style={styles.withdrawBtnContent}>
                  <Wallet size={16} color="#FFF" style={{ marginRight: 8 }} />
                  <Typography style={styles.withdrawBtnText}>Withdraw</Typography>
                </View>
                <ChevronRight size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Typography style={styles.emptyDesc}>No company balances found.</Typography>
          </View>
        )}

        {/* Recent Rewards Header */}
        <View style={styles.sectionHeader}>
          <Typography style={styles.sectionTitle}>Recent Rewards</Typography>
        </View>

        {/* Transactions List or Empty State */}
        {transactions.length > 0 ? (
          <View style={styles.transactionsContainer}>
            <FlatList 
              data={displayTransactions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderTransaction}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Image source={require('../../../assets/images/qr_box_empty.png')} style={styles.emptyIllustration} contentFit="contain" />
            <View style={styles.emptyContent}>
              <Typography style={styles.emptyTitle}>No Rewards Yet</Typography>
              <Typography style={styles.emptyDesc}>Start scanning eligible product QR codes to earn rewards.</Typography>
            </View>
            <TouchableOpacity style={styles.emptyBtn} accessible={true} accessibilityRole="button">
              <QrCode size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Typography style={styles.emptyBtnText}>Scan QR to Earn</Typography>
            </TouchableOpacity>
          </View>
        )}

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
    backgroundColor: '#F8F8F6',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#F0F5F2',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    zIndex: 2,
  },
  heroLabel: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    marginBottom: 8,
  },
  heroBalance: {
    fontSize: theme.typography.size.displayLg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xl,
    lineHeight: 64,
  },
  availablePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2EBE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: 6,
  },
  availablePillText: {
    fontSize: 11,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  lastUpdatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginRight: 6,
  },
  heroIllustrationWrapper: {
    position: 'absolute',
    right: -20,
    bottom: -10,
    width: 170,
    height: 170,
    zIndex: 1,
  },
  heroIllustration: {
    width: '100%',
    height: '100%',
  },

  // Withdraw Button
  withdrawBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 20,
    marginBottom: 24,
    ...theme.shadows.sm,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
  },
  withdrawBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  withdrawBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Pending Card
  pendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    ...theme.shadows.sm,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  pendingLeft: {
    marginRight: 12,
  },
  orangeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.warningBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingCenter: {
    flex: 1,
  },
  pendingLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  pendingAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pendingAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginRight: 12,
  },
  orangeBadge: {
    backgroundColor: theme.colors.warningBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  orangeBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  pendingRight: {
    marginLeft: 8,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F7F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  companyBalanceLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  companyBalanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 2,
  },
  companyWithdrawBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 2,
  },

  // Transactions List
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    ...theme.shadows.sm,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  txLogoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F7F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txLogoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  txInfo: {
    flex: 1,
  },
  txCompany: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  txDate: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  txBadge: {
    backgroundColor: '#F3F7F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  txBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // Empty State Card
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  emptyIllustration: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.9,
  },
  emptyContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  bottomPadding: {
    height: 120,
  },

  // Bottom Navigation
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomNavContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    height: 72,
    width: '92%',
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
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    marginTop: 4,
    fontWeight: '500',
  },
  floatingWalletBtnActive: {
    position: 'absolute',
    top: -24,
    left: '50%',
    transform: [{ translateX: -36 }],
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary, // Active
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
