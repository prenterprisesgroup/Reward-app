import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useWalletQuery } from '../../hooks/useWalletQuery';
import { useAuthStore } from '../../store/useAuthStore';
import { useWithdrawMutation } from '../../hooks/useWithdrawMutation';
import { ActivityIndicator, TextInput, Alert, ToastAndroid, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Existing components
import { Typography, PrimaryButton, Card } from '../../components';

export default function WithdrawRewardsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const companyId = params.companyId as string;
  const companyName = params.companyName as string || 'Rewards';
  const availableBalance = parseInt(params.availableBalance as string, 10) || 0;

  const { data: walletData, isLoading: isLoadingWallet } = useWalletQuery();
  const { user } = useAuthStore();
  const withdrawMutation = useWithdrawMutation();

  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const upiId = user?.upiId || 'No UPI ID Set';
  const userName = user?.name || 'User';

  const quickAmounts = ['100', '500', '1000', '2000', 'MAX'];

  const handleQuickAmountSelect = (val: string) => {
    setSelectedAmount(val);
    const amountVal = val === 'MAX' ? availableBalance.toString() : val;
    setAmount(amountVal);
  };

  const numericAmount = parseInt(amount, 10);
  const isValidAmount = 
    !isNaN(numericAmount) && 
    numericAmount >= 100 && 
    numericAmount <= availableBalance &&
    !amount.includes('.') &&
    !amount.includes('-');

  const handleWithdraw = async () => {
    if (!isValidAmount || withdrawMutation.isPending) return;
    
    try {
      const response = await withdrawMutation.mutateAsync({
        amount: numericAmount,
        upiId: upiId,
        company: companyId
      });
      
      router.push({
        pathname: '/(worker)/withdraw-success',
        params: {
          amount: numericAmount.toString(),
          destination: upiId,
          referenceId: response?.referenceId || `TXN${Math.floor(Math.random() * 1000000)}`,
          submittedAt: new Date().toLocaleString()
        }
      });
    } catch (error: any) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(error?.message || 'Withdrawal failed. Please try again.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', error?.message || 'Withdrawal failed. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      
      {/* 1. Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
          accessible={true}
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerTextWrapper}>
          <Typography style={styles.headerTitle}>Withdraw Rewards</Typography>
          <Typography style={styles.headerSubtitle}>Transfer your available rewards to your bank account.</Typography>
        </View>

        <TouchableOpacity 
          style={styles.notificationBtn} 
          onPress={() => {}}
          accessible={true}
          accessibilityRole="button"
        >
          <Feather name="bell" size={20} color={theme.colors.textPrimary} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          
          {/* 2. Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Typography style={styles.heroLabel}>Available Balance</Typography>
            <Typography style={styles.heroAmount}>₹{availableBalance.toLocaleString('en-IN')}</Typography>
            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Typography style={styles.heroBadgeText}>{companyName}</Typography>
            </View>
          </View>
          
          <View style={styles.heroIllustrationWrapper}>
            <Image 
              source={require('../../../assets/images/wallet_hero.png')} 
              style={styles.heroIllustration} 
              contentFit="contain" 
            />
          </View>

          {/* Absolute positioning for Last Updated to match layout precisely if needed, or flex row at bottom */}
          <View style={styles.heroBottomRow}>
            <Typography style={styles.heroBottomText}>Last Updated: {walletData?.lastUpdated ? new Date(walletData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</Typography>
          </View>
        </View>

        {/* 3. Amount Input Section */}
        <View style={styles.sectionContainer}>
          <Typography style={styles.sectionTitle}>Enter Amount</Typography>
          <View style={styles.inputWrapper}>
            <Typography style={styles.inputIcon}>₹</Typography>
            <TextInput 
              style={[styles.inputText, !amount && styles.inputPlaceholder]}
              value={amount}
              onChangeText={(val) => {
                setAmount(val.replace(/[^0-9]/g, ''));
                setSelectedAmount(null);
              }}
              placeholder="Enter Amount"
              placeholderTextColor="#A0AAB2"
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
          
          <View style={styles.inputInfoRow}>
            <Typography style={styles.inputInfoText}>Minimum Withdrawal ₹100</Typography>
            <Typography style={styles.inputInfoText}>Available <Typography style={{ color: theme.colors.primary, fontWeight: 'bold' }}>₹{availableBalance.toLocaleString('en-IN')}</Typography></Typography>
          </View>

          {/* 4. Quick Amount Chips */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickAmountRow}
          >
            {quickAmounts.map((val) => {
              const isSelected = selectedAmount === val;
              return (
                <TouchableOpacity 
                  key={val} 
                  style={[styles.quickAmountPill, isSelected && styles.quickAmountPillSelected]}
                  onPress={() => handleQuickAmountSelect(val)}
                >
                  <Typography style={[styles.quickAmountText, isSelected && styles.quickAmountTextSelected]}>
                    {val === 'MAX' ? 'MAX' : `₹${val}`}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 5. Payment Destination Card */}
        <Typography style={styles.sectionTitle}>Payment Destination</Typography>
        <Card style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <View style={styles.upiLogoCircle}>
              {/* Mock UPI Logo */}
              <Typography style={styles.upiLogoText}>UPI</Typography>
            </View>
            <View style={styles.paymentInfo}>
              <Typography style={styles.paymentLabel}>Primary UPI</Typography>
              <View style={styles.paymentValueRow}>
                <Typography style={styles.paymentValue} numberOfLines={1} ellipsizeMode="middle">{upiId}</Typography>
                <View style={styles.verifiedBadge}>
                  <Feather name="check" size={10} color="#FFF" />
                </View>
              </View>
              <Typography style={styles.verifiedText}>Verified</Typography>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => {}}>
              <Typography style={styles.editBtnText}>Edit</Typography>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 6. Withdrawal Summary Card */}
        <Typography style={styles.sectionTitle}>Withdrawal Summary</Typography>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <View style={styles.summaryIconBox}>
                <Feather name="credit-card" size={16} color={theme.colors.textSecondary} />
              </View>
              <Typography style={styles.summaryLabel}>Withdrawal Amount</Typography>
            </View>
            <Typography style={styles.summaryValueBold}>₹{numericAmount || 0}</Typography>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <View style={styles.summaryIconBox}>
                <Feather name="clock" size={16} color={theme.colors.textSecondary} />
              </View>
              <Typography style={styles.summaryLabel}>Processing Time</Typography>
            </View>
            <Typography style={styles.summaryValue}>1–2 Business Days</Typography>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <View style={styles.summaryIconBox}>
                <Feather name="user" size={16} color={theme.colors.textSecondary} />
              </View>
              <Typography style={styles.summaryLabel}>Destination</Typography>
            </View>
            <Typography style={[styles.summaryValue, { flex: 1, textAlign: 'right', marginLeft: 16 }]} numberOfLines={1} ellipsizeMode="middle">{upiId}</Typography>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <View style={styles.summaryIconBox}>
                <MaterialCommunityIcons name="currency-rupee" size={16} color={theme.colors.textSecondary} />
              </View>
              <Typography style={styles.summaryLabel}>Processing Fee</Typography>
            </View>
            <Typography style={styles.summaryValueGreen}>FREE</Typography>
          </View>
        </Card>

        {/* 7. Important Notice Card */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <View style={styles.shieldIcon}>
              <Feather name="shield" size={20} color={theme.colors.primary} />
            </View>
            <Typography style={styles.noticeTitle}>Important Notice</Typography>
          </View>
          <Typography style={styles.noticeBody}>
            Your withdrawal request will be reviewed by the respective company.
            Once approved, the amount will be transferred to your registered UPI account.
          </Typography>
        </View>
      </ScrollView>

      {/* 8. Bottom Actions */}
      <View style={[styles.bottomActionsWrapper, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <PrimaryButton 
          title={withdrawMutation.isPending ? "Processing..." : "Withdraw Now"} 
          onPress={handleWithdraw} 
          disabled={!isValidAmount || withdrawMutation.isPending}
          icon={withdrawMutation.isPending ? undefined : <MaterialCommunityIcons name="wallet-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />}
          style={[styles.withdrawNowBtn, (!isValidAmount || withdrawMutation.isPending) && styles.withdrawNowBtnDisabled]}
        />
        
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} disabled={withdrawMutation.isPending}>
          <Typography style={styles.cancelBtnText}>Cancel</Typography>
        </TouchableOpacity>

        <View style={styles.confirmationRow}>
          <Feather name="lock" size={14} color={theme.colors.textSecondary} />
          <View style={styles.confirmationTextCol}>
            <Typography style={styles.confirmationTitle}>Confirmation</Typography>
            <Typography style={styles.confirmationDesc}>You'll be asked to confirm before the withdrawal request is submitted.</Typography>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40, // Space between scroll content and footer
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  headerTextWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F3A36',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#7B8680',
    textAlign: 'center',
    lineHeight: 18,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8ECE8',
  },
  heroContent: {
    flex: 1,
    zIndex: 2,
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2F3A36',
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: -1,
    lineHeight: 52,
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: 6,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  heroIllustrationWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    overflow: 'hidden',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroIllustration: {
    width: '100%',
    height: '100%',
  },
  heroBottomRow: {
    position: 'absolute',
    bottom: -28,
    left: 8,
  },
  heroBottomText: {
    fontSize: 11,
    color: '#7B8680',
  },

  // Common Section Title
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3A36',
    marginBottom: 12,
  },

  // Input Wrapper
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 64,
    borderWidth: 1,
    borderColor: '#E8ECE8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  inputIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2F3A36',
    marginRight: 12,
  },
  inputText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2F3A36',
  },
  inputPlaceholder: {
    color: '#A0AAB2',
  },
  inputInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  inputInfoText: {
    fontSize: 12,
    color: '#7B8680',
  },

  // Quick Amounts
  quickAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  quickAmountPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8ECE8',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  quickAmountPillSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F5F1',
  },
  quickAmountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2F3A36',
  },
  quickAmountTextSelected: {
    color: theme.colors.primary,
  },

  // Payment Card
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8ECE8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upiLogoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E8ECE8',
  },
  upiLogoText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#2F3A36',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  paymentValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3A36',
    marginRight: 6,
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#5E8F65',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 10,
    color: '#5E8F65',
    fontWeight: '500',
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECE8',
    backgroundColor: '#FFFFFF',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2F3A36',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8ECE8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F7F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#7B8680',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2F3A36',
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3A36',
  },
  summaryValueGreen: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#5E8F65',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F3F1',
    marginVertical: 12,
  },

  // Notice Card
  noticeCard: {
    backgroundColor: '#F7F9F8',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8ECE8',
    marginBottom: 24,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shieldIcon: {
    marginRight: 8,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2F3A36',
  },
  noticeBody: {
    fontSize: 13,
    color: '#7B8680',
    lineHeight: 20,
  },

  bottomPadding: {
    height: 120,
  },

  // Bottom Actions
  bottomActionsWrapper: {
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  withdrawNowBtn: {
    borderRadius: 20,
    height: 56,
    backgroundColor: theme.colors.primary,
    marginBottom: 12,
  },
  withdrawNowBtnDisabled: {
    opacity: 0.5,
  },
  cancelBtn: {
    height: 56,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: 20,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8ECE8',
  },
  confirmationTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  confirmationTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2F3A36',
    marginBottom: 4,
  },
  confirmationDesc: {
    fontSize: 11,
    color: '#7B8680',
    lineHeight: 16,
  },
});
