import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Clock, Wallet, ChevronRight, ShieldCheck, Home, FileText } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSpring 
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { Typography } from '../../components/common/Typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const localTheme = {
  colors: {
    background: '#F8F8F6',
    primary: '#84A98C',
    accent: '#52796F',
    card: '#FFFFFF',
    border: '#E8E8E5',
    textPrimary: '#2F3A36',
    textSecondary: '#6B7A74',
    success: '#34C759',
  }
};

export default function WithdrawSuccessScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const iconScale = useSharedValue(0.8);
  const fadeAnim = useSharedValue(0);
  
  const [displayAmount, setDisplayAmount] = useState(0);
  
  const amountStr = typeof params.amount === 'string' ? params.amount : '1000';
  const targetAmount = parseInt(amountStr, 10) || 1000;
  
  const destination = typeof params.destination === 'string' ? params.destination : 'UPI';
  const referenceId = typeof params.referenceId === 'string' ? params.referenceId : `TXN${Math.floor(Math.random() * 1000000)}`;
  const submittedAt = typeof params.submittedAt === 'string' ? params.submittedAt : new Date().toLocaleString();

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 400 });
    iconScale.value = withDelay(200, withSpring(1, { damping: 12 }));
    
    let start = 0;
    const step = Math.max(1, Math.floor(targetAmount / 20));
    const timer = setInterval(() => {
      start += step;
      if (start >= targetAmount) {
        setDisplayAmount(targetAmount);
        clearInterval(timer);
      } else {
        setDisplayAmount(start);
      }
    }, 30);
    
    return () => clearInterval(timer);
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.ScrollView 
        bounces={false} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom + 12, 24) }, fadeStyle]}
      >
        {/* Success Badge */}
        <View style={styles.successBadgeContainer}>
          <Animated.View style={[styles.successOuterRing, iconStyle]}>
            <View style={styles.successInnerCircle}>
              <Check size={40} color="#FFFFFF" strokeWidth={3.5} />
            </View>
          </Animated.View>
        </View>

        <Typography style={styles.title}>Withdrawal Request Submitted</Typography>
        <Typography style={styles.amount}>₹{displayAmount}</Typography>

        {/* Detailed Info Card */}
        <View style={styles.detailCard}>
          
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Wallet size={16} color={localTheme.colors.primary} />
              </View>
              <Typography style={styles.rowLabel}>Withdrawal Amount</Typography>
            </View>
            <View style={styles.rowRight}>
              <Typography style={styles.rowValue}>₹{targetAmount}</Typography>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="bank-outline" size={16} color={localTheme.colors.primary} />
              </View>
              <Typography style={styles.rowLabel}>Destination UPI</Typography>
            </View>
            <View style={styles.rowRight}>
              <Typography style={styles.rowValue}>{destination}</Typography>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Clock size={16} color={localTheme.colors.primary} />
              </View>
              <Typography style={styles.rowLabel}>Processing Time</Typography>
            </View>
            <View style={styles.rowRight}>
              <Typography style={styles.rowValue}>1–2 Business Days</Typography>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="currency-rupee" size={16} color={localTheme.colors.primary} />
              </View>
              <Typography style={styles.rowLabel}>Processing Fee</Typography>
            </View>
            <View style={styles.rowRight}>
              <Typography style={[styles.rowValue, { color: localTheme.colors.success }]}>FREE</Typography>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <FileText size={16} color={localTheme.colors.primary} />
              </View>
              <Typography style={styles.rowLabel}>Reference ID</Typography>
            </View>
            <View style={styles.rowRight}>
              <Typography style={styles.rowValue}>{referenceId}</Typography>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Clock size={16} color={localTheme.colors.primary} />
              </View>
              <Typography style={styles.rowLabel}>Submitted At</Typography>
            </View>
            <View style={styles.rowRight}>
              <Typography style={styles.rowValue}>{submittedAt}</Typography>
            </View>
          </View>

        </View>

        {/* Success Info Card */}
        <View style={styles.successInfoCard}>
          <View style={styles.shieldBox}>
            <ShieldCheck size={18} color={localTheme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Typography style={styles.successInfoTextBold}>Pending Approval</Typography>
            <Typography style={styles.successInfoText}>
              Your withdrawal request has been submitted successfully. The respective company will review your request.
            </Typography>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={() => router.replace('/(worker)/wallet')}>
          <Wallet size={20} color="#FFFFFF" />
          <Typography style={styles.primaryButtonText}>Back to Wallet</Typography>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={() => router.replace('/(worker)/home')}>
          <Home size={18} color={localTheme.colors.primary} style={{ marginRight: 6 }} />
          <Typography style={styles.secondaryButtonText}>Go Home</Typography>
        </TouchableOpacity>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: localTheme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  successBadgeContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successOuterRing: {
    width: 100, 
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(132, 169, 140, 0.2)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  successInnerCircle: {
    width: 72, 
    height: 72,
    borderRadius: 36,
    backgroundColor: localTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: localTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: localTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  amount: {
    fontSize: 48,
    fontWeight: '900',
    color: localTheme.colors.primary,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -1,
  },
  detailCard: {
    backgroundColor: localTheme.colors.card,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: localTheme.colors.border,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16, 
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F7F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: localTheme.colors.textSecondary,
    fontWeight: 'normal',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 14,
    color: localTheme.colors.textPrimary,
    fontWeight: '600', 
  },
  divider: {
    height: 1,
    backgroundColor: localTheme.colors.border,
    width: '100%',
  },
  successInfoCard: {
    backgroundColor: '#F3F7F4',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  shieldBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  successInfoTextBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: localTheme.colors.textPrimary,
    marginBottom: 2,
  },
  successInfoText: {
    fontSize: 12,
    color: localTheme.colors.textSecondary,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: localTheme.colors.primary,
    height: 58,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: localTheme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: localTheme.colors.primary,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
