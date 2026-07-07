import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Building2, Package, Clock, Wallet, ChevronRight, ShieldCheck, Scan, Calendar, Sparkles, Star } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSpring 
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Typography } from '../common/Typography';

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

import { ScanResponseData } from '../../../types/backend.types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onScanAnother: () => void;
  onViewWallet: () => void;
  rewardData: ScanResponseData | null;
}

export default function RewardSuccessBottomSheet({ visible, onClose, onScanAnother, onViewWallet, rewardData }: Props) {
  const insets = useSafeAreaInsets();
  
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.8);
  const sparkleOpacity = useSharedValue(0);
  
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      iconScale.value = withDelay(300, withSpring(1, { damping: 12 }));
      sparkleOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
      
      let start = 0;
      const targetAmount = rewardData?.rewardAmount || 100;
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
    } else {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      iconScale.value = 0.8;
      sparkleOpacity.value = 0;
      setDisplayAmount(0);
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));



  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.container}>
        
        {/* Premium Blur Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFillObject}>
            <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
          </BlurView>
        </Animated.View>

        {/* Bottom Sheet container */}
        <Animated.View style={[styles.sheet, sheetStyle]}>
          
          <View style={styles.dragHandle} />
          
          <ScrollView 
            bounces={false} 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 12, 24) }}
          >
            {/* Success Badge */}
            <View style={styles.successBadgeContainer}>
              <Animated.View style={[styles.sparklesContainer, sparkleStyle]}>
                {/* Premium Vector Sparkles */}
                <View style={{ position: 'absolute', top: 10, left: -20, opacity: 0.8, transform: [{ scale: 0.85 }] }}>
                  <Sparkles size={18} color="#E5C07B" strokeWidth={1.5} />
                </View>
                <View style={{ position: 'absolute', top: -10, left: 30, opacity: 0.6, transform: [{ scale: 0.7 }] }}>
                  <Star size={14} color="#E5C07B" fill="#E5C07B" />
                </View>
                <View style={{ position: 'absolute', top: 40, right: -25, opacity: 0.9, transform: [{ scale: 1 }] }}>
                  <Sparkles size={22} color="#E5C07B" strokeWidth={1.5} />
                </View>
                <View style={{ position: 'absolute', bottom: -5, left: 10, opacity: 0.7, transform: [{ scale: 0.75 }] }}>
                  <Star size={12} color="#E5C07B" fill="#E5C07B" />
                </View>
              </Animated.View>

              <Animated.View style={[styles.successOuterRing, iconStyle]}>
                <View style={styles.successInnerCircle}>
                  <Check size={40} color="#FFFFFF" strokeWidth={3.5} />
                </View>
              </Animated.View>
            </View>

            <Typography style={styles.title}>Reward Claimed Successfully 🎉</Typography>
            <View style={styles.amountWrapper}>
              <Typography style={styles.amountSign}>+</Typography>
              <Typography style={styles.amount}>₹{displayAmount.toLocaleString('en-IN')}</Typography>
            </View>

            {/* Detailed Info Card */}
            <View style={styles.detailCard}>
              
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconCircle}>
                    <Building2 size={16} color={localTheme.colors.primary} />
                  </View>
                  <Typography style={styles.rowLabel}>Company</Typography>
                </View>
                <View style={styles.rowRight}>
                  <Typography style={styles.rowValue}>{rewardData?.companyName || 'Unknown'}</Typography>
                  <View style={[styles.rowImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F7F4' }]}>
                    <Typography style={{ fontSize: 10, fontWeight: 'bold', color: localTheme.colors.primary }}>
                      {rewardData?.companyName?.charAt(0) || 'C'}
                    </Typography>
                  </View>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconCircle}>
                    <Package size={16} color={localTheme.colors.primary} />
                  </View>
                  <Typography style={styles.rowLabel}>Product</Typography>
                </View>
                <View style={styles.rowRight}>
                  <Typography style={styles.rowValue}>{rewardData?.productName || rewardData?.barcode?.batch?.productName || 'Unknown Product'}</Typography>
                </View>
              </View>
              
              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconCircle}>
                    <Clock size={16} color={localTheme.colors.primary} />
                  </View>
                  <Typography style={styles.rowLabel}>Reward Time</Typography>
                </View>
                <View style={styles.rowRight}>
                  <Typography style={styles.rowValue}>{rewardData?.timestamp || 'Just now'}</Typography>
                  <View style={styles.rowIconOnly}>
                    <Calendar size={14} color={localTheme.colors.textSecondary} />
                  </View>
                </View>
              </View>
              
              <View style={styles.divider} />

              <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onViewWallet}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconCircle}>
                    <Wallet size={16} color={localTheme.colors.primary} />
                  </View>
                  <Typography style={styles.rowLabel}>Wallet Balance</Typography>
                </View>
                <View style={styles.rowRight}>
                  <Typography style={styles.walletValue}>₹{rewardData?.newWalletBalance || 0}</Typography>
                  <ChevronRight size={16} color={localTheme.colors.textSecondary} />
                </View>
              </TouchableOpacity>

            </View>

            {/* Success Info Card */}
            <View style={styles.successInfoCard}>
              <View style={styles.shieldBox}>
                <ShieldCheck size={18} color={localTheme.colors.primary} />
              </View>
              <Typography style={styles.successInfoText}>
                Your reward has been securely added to your wallet.
              </Typography>
            </View>

            {/* Actions */}
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={onScanAnother}>
              <Scan size={20} color="#FFFFFF" />
              <Typography style={styles.primaryButtonText}>Scan Another QR</Typography>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={onViewWallet}>
              <Typography style={styles.secondaryButtonText}>View Wallet</Typography>
              <ChevronRight size={14} color={localTheme.colors.primary} style={{ marginTop: 1 }} />
            </TouchableOpacity>

            {/* Decorative Coins Overlay (subtle absolute positioning at bottom) */}
            <View style={styles.decorationsWrapper} pointerEvents="none">
              {/* <Image source={require('../../../assets/images/reward-coins.png')} style={styles.coinsImage} /> */}
            </View>

          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)', // Subtler overlay since we have blur now
  },
  sheet: {
    backgroundColor: localTheme.colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
    width: SCREEN_WIDTH,
    maxHeight: '90%', // Ensures it fits on small phones
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DCDCDC',
    alignSelf: 'center',
    marginBottom: 20,
  },
  successBadgeContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  successOuterRing: {
    width: 100, // Massive glow ring
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(132, 169, 140, 0.2)', // soft green glow matching primary
    justifyContent: 'center',
    alignItems: 'center',
  },
  successInnerCircle: {
    width: 72, // Larger inner circle
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
  sparklesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: localTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  amountWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  amountSign: {
    fontSize: 32,
    fontWeight: '900',
    color: localTheme.colors.primary,
    marginRight: 8,
    lineHeight: 56,
  },
  amount: {
    fontSize: 52,
    fontWeight: '900',
    color: localTheme.colors.primary,
    textAlign: 'center',
    lineHeight: 58,
    letterSpacing: 0,
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
    paddingVertical: 16, // Massive breathing space
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
    fontWeight: 'normal', // Proper visual hierarchy
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 14,
    color: localTheme.colors.textPrimary,
    fontWeight: '600', // Pops more
    marginRight: 10,
  },
  walletValue: {
    fontSize: 15,
    color: localTheme.colors.primary,
    fontWeight: 'bold',
    marginRight: 8,
  },
  rowImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: localTheme.colors.border,
  },
  rowIconOnly: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  successInfoText: {
    flex: 1,
    fontSize: 12,
    color: localTheme.colors.textPrimary,
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
    paddingVertical: 8,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: localTheme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  decorationsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    alignItems: 'center',
    justifyContent: 'flex-end',
    opacity: 0.4,
  },
  coinsImage: {
    width: SCREEN_WIDTH,
    height: 80,
    contentFit: 'contain',
  }
});
