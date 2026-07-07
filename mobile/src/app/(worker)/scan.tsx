import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Zap, Image as ImageIcon, Wallet, Scan, ShieldCheck, CheckCircle2, ChevronRight, Lightbulb, Home, User } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { Image } from 'expo-image';
import RewardSuccessBottomSheet from '../../components/scanner/RewardSuccessBottomSheet';
import { useRouter } from 'expo-router';
import { BottomNavigation } from '../../components/navigation/BottomNavigation';
import { useWalletQuery } from '../../hooks/useWalletQuery';
import { useScanQRMutation } from '../../hooks/useScanQRMutation';
import { ScanResponseData } from '../../types/backend.types';
import axios from 'axios';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

export default function WorkerScanQRScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomSpacing = Math.max(insets.bottom + 12, 24);
  
  const CAMERA_WIDTH = Math.min(SCREEN_WIDTH - 48, 400); // Max 400 to prevent huge squares on tablets
  const CAMERA_HEIGHT = CAMERA_WIDTH * 1.25; // Perfect 4:5 vertical scanner ratio

  // Hardware State
  const [permission, requestPermission] = useCameraPermissions();
  const [isTorchOn, setIsTorchOn] = useState(false);
  const isScanningRef = useRef(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [rewardData, setRewardData] = useState<ScanResponseData | null>(null);
  
  // Custom Toast State
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const { data: walletData, isLoading: isLoadingWallet, isError: isWalletError } = useWalletQuery();
  const { mutateAsync, isPending } = useScanQRMutation();

  // Animations
  const laserY = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    laserY.value = withRepeat(
      withTiming(CAMERA_HEIGHT - 60, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const laserStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: laserY.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    shadowOpacity: pulseOpacity.value * 0.8,
  }));

  const handleOpenGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Selected image URI:', result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  const handleBarcodeScanned = async (scanningResult: any) => {
    if (isScanningRef.current || isPending) return;

    const rawCode = scanningResult?.data;
    const sanitizedCode = typeof rawCode === 'string' ? rawCode.trim().toUpperCase() : '';
    if (!sanitizedCode) {
      setToastMsg({ message: 'Invalid QR code', type: 'error' });
      setTimeout(() => {
        isScanningRef.current = false;
        setToastMsg(null);
      }, 2000);
      return;
    }

    // Prevent duplicate scans and pause scanner
    isScanningRef.current = true;
    setToastMsg(null);
    
    try {
      const response = await mutateAsync({ code: sanitizedCode, idempotencyKey: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 10)}` });
      setRewardData(response);
      setShowSuccessModal(true);
      // We don't reset isScanningRef.current here; it remains true so the scanner is paused.
      // It resets when user taps "Scan Another QR"
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setToastMsg({ message: 'Network Error: Please check your connection', type: 'error' });
        } else if (error.response.status === 400) {
          setToastMsg({ message: 'Invalid QR code', type: 'error' });
        } else if (error.response.status === 401) {
          setToastMsg({ message: 'Unauthorized action', type: 'error' });
        } else if (error.response.status === 403) {
          setToastMsg({ message: 'Forbidden access', type: 'error' });
        } else if (error.response.status === 404) {
          setToastMsg({ message: 'QR Not Found', type: 'error' });
        } else if (error.response.status === 409) {
          setToastMsg({ message: 'This QR has already been redeemed', type: 'error' });
        } else {
          setToastMsg({ message: 'Server Error: Please try again later', type: 'error' });
        }
      } else {
        setToastMsg({ message: 'An unexpected error occurred', type: 'error' });
      }
      
      // On error, let them scan again after 2 seconds
      setTimeout(() => {
        isScanningRef.current = false;
        setToastMsg(null);
      }, 2000);
    }
  };

  // Permission fallback
  if (!permission) {
    return (
      <View style={[styles.container, styles.centerAll]}>
        <Typography>Loading camera...</Typography>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centerAll, { padding: 24 }]}>
        <Typography style={{ textAlign: 'center', marginBottom: 16, fontSize: 16 }}>We need your permission to access the camera</Typography>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Typography style={{ color: '#FFF', fontWeight: 'bold' }}>Grant Permission</Typography>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomSpacing + 60 }}>
      {/* Top Header */}
      <View style={[styles.header, { paddingHorizontal: 24, paddingTop: 16, zIndex: 10 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} hitSlop={hitSlop} accessible={true} accessibilityRole="button" accessibilityLabel="Go back">
          <ArrowLeft size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Typography style={styles.headerTitle}>Scan Reward QR</Typography>
          <Typography style={styles.headerSubtitle}>Scan an eligible product QR code{'\n'}to instantly receive your reward.</Typography>
        </View>
        
        <View style={styles.headerRightActions}>
          <TouchableOpacity 
            style={[styles.iconBtn, isTorchOn ? { backgroundColor: theme.colors.primary } : undefined]} 
            hitSlop={hitSlop} 
            accessible={true} 
            accessibilityRole="button" 
            accessibilityLabel="Toggle Flash"
            onPress={() => setIsTorchOn(!isTorchOn)}
          >
            <Zap size={18} color={isTorchOn ? '#FFF' : theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn} 
            hitSlop={hitSlop} 
            accessible={true} 
            accessibilityRole="button" 
            accessibilityLabel="Open Gallery"
            onPress={handleOpenGallery}
          >
            <ImageIcon size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Balance Pill Overlapping Camera */}
      <View style={[styles.balancePillWrapper, { zIndex: 10 }]}>
        <View style={styles.balancePill}>
          <Typography style={styles.balancePillLabel}>Current Reward Balance</Typography>
          {isLoadingWallet ? (
            <View style={{ height: 24, justifyContent: 'center' }}><Typography style={styles.balancePillValue}>...</Typography></View>
          ) : (
            <Typography style={styles.balancePillValue}>
              ₹{isWalletError ? '0' : (walletData?.walletBalance || 0).toLocaleString('en-IN')}
            </Typography>
          )}
          <View style={styles.balancePillIcon}>
            <Wallet size={16} color="#FFF" />
          </View>
        </View>
      </View>

      {/* QR Camera Area */}
      <View style={[styles.cameraContainer, { height: CAMERA_HEIGHT }]}>
          <CameraView 
            key={permission?.granted ? 'granted' : 'pending'}
            style={{ flex: 1 }}
            facing="back"
            enableTorch={isTorchOn}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          
          <View style={styles.scannerOverlay}>
            <Animated.View style={[styles.corner, styles.cornerTL, pulseStyle]} />
            <Animated.View style={[styles.corner, styles.cornerTR, pulseStyle]} />
            <Animated.View style={[styles.corner, styles.cornerBL, pulseStyle]} />
            <Animated.View style={[styles.corner, styles.cornerBR, pulseStyle]} />
            
            <Animated.View style={[styles.laser, laserStyle]} />
          </View>
        </View>

        {/* Status Pill Overlapping Camera Bottom */}
        <View style={styles.statusPillWrapper}>
          <View style={[styles.statusPill, toastMsg?.type === 'error' ? { backgroundColor: theme.colors.errorBackground } : undefined]}>
            {isPending ? (
              <>
                <View style={styles.statusDots}>
                  <View style={styles.statusDot} />
                  <View style={[styles.statusDot, { opacity: 0.6 }]} />
                  <View style={[styles.statusDot, { opacity: 0.3 }]} />
                </View>
                <Typography style={styles.statusText}>Verifying QR...</Typography>
              </>
            ) : toastMsg ? (
              <Typography style={[styles.statusText, { color: theme.colors.error }]}>{toastMsg.message}</Typography>
            ) : (
              <>
                <View style={styles.statusDots}>
                  <View style={styles.statusDot} />
                  <View style={[styles.statusDot, { opacity: 0.6 }]} />
                  <View style={[styles.statusDot, { opacity: 0.3 }]} />
                </View>
                <Typography style={styles.statusText}>Scanning Reward QR...</Typography>
              </>
            )}
          </View>
        </View>

        {/* Massive Solid White Bottom Sheet */}
        <View style={styles.bottomSheetWrapper}>
          <View style={styles.dragHandle} />
          
          <View style={styles.readySection}>
            <View style={styles.readyContent}>
              <View style={styles.readyIconBox}>
                <Scan size={20} color={theme.colors.primary} />
              </View>
              <Typography style={styles.readyTitle}>Ready to Scan</Typography>
              <Typography style={styles.readyDesc}>Align the QR code inside the{'\n'}scanning frame.{'\n'}Your reward will be verified instantly.</Typography>
            </View>
            <Image source={require('../../../assets/images/scanner-illustration.png')} style={styles.scannerIllustration} />
          </View>

          <View style={styles.twoColumnGrid}>
            {/* Last Reward Earned */}
            <TouchableOpacity style={styles.gridCard} accessible={true} accessibilityRole="button" hitSlop={hitSlop}>
              <View style={styles.gridCardHeader}>
                <Typography style={styles.gridCardTitle}>Last Reward Earned</Typography>
                <ChevronRight size={14} color={theme.colors.placeholder} />
              </View>
              <View style={styles.rewardCardContent}>
                {/* Top Row: Logo & Name */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Image source={require('../../../assets/images/avatar.png')} style={styles.companyLogo} />
                  <View style={styles.rewardCardText}>
                    <Typography style={styles.companyName} numberOfLines={1}>Nestlé India</Typography>
                    <Typography style={styles.rewardTime}>2 mins ago</Typography>
                  </View>
                </View>
                
                {/* Bottom Row: Amount & Badge */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography style={styles.rewardAmount}>+₹100</Typography>
                  <View style={styles.completedBadge}>
                    <Typography style={styles.completedBadgeText}>Completed</Typography>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Quick Tips */}
            <View style={styles.gridCard}>
              <View style={styles.gridCardHeader}>
                <Typography style={styles.gridCardTitle}>Quick Tips</Typography>
                <View style={styles.tipsIconBox}>
                  <Lightbulb size={12} color={theme.colors.primary} />
                </View>
              </View>
              <View style={styles.tipItem}>
                <CheckCircle2 size={12} color={theme.colors.textSecondary} />
                <Typography style={styles.tipText}>Use good lighting</Typography>
              </View>
              <View style={styles.tipItem}>
                <CheckCircle2 size={12} color={theme.colors.textSecondary} />
                <Typography style={styles.tipText}>Hold your phone steady</Typography>
              </View>
              <View style={styles.tipItem}>
                <CheckCircle2 size={12} color={theme.colors.textSecondary} />
                <Typography style={styles.tipText}>Keep the QR code inside the frame</Typography>
              </View>
            </View>
          </View>

          {/* Security Card */}
          <View style={styles.securityCard}>
            <View style={styles.securityIconBox}>
              <ShieldCheck size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.securityContent}>
              <Typography style={styles.securityTitle}>Secure Connection</Typography>
              <Typography style={styles.securitySubtitle}>Your scans are encrypted end-to-end</Typography>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.guidelinesSection}>
            <Typography style={styles.guidelinesTitle}>Scan Guidelines</Typography>
            
            <View style={styles.guidelineItem}>
              <View style={styles.guidelineIconWrapper}>
                <Scan size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.guidelineTextContent}>
                <Typography style={styles.guidelineHeading}>Keep QR code clearly visible</Typography>
                <Typography style={styles.guidelineDesc}>Avoid reflections or glare on the code</Typography>
              </View>
            </View>

            <View style={styles.guidelineItem}>
              <View style={styles.guidelineIconWrapper}>
                <ShieldCheck size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.guidelineTextContent}>
                <Typography style={styles.guidelineHeading}>Ensure product authenticity</Typography>
                <Typography style={styles.guidelineDesc}>Scan genuine products to earn valid rewards</Typography>
              </View>
            </View>

            <View style={styles.guidelineItem}>
              <View style={styles.guidelineIconWrapper}>
                <Lightbulb size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.guidelineTextContent}>
                <Typography style={styles.guidelineHeading}>Having trouble?</Typography>
                <TouchableOpacity onPress={() => router.push('/(worker)/help')} hitSlop={hitSlop} accessible={true} accessibilityRole="button">
                  <Typography style={styles.guidelineLink}>Get Help</Typography>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>
      </ScrollView>

      <RewardSuccessBottomSheet 
        visible={showSuccessModal}
        rewardData={rewardData!}
        onClose={() => {
          setShowSuccessModal(false);
          isScanningRef.current = false;
        }}
        onScanAnother={() => {
          setShowSuccessModal(false);
          isScanningRef.current = false;
        }}
        onViewWallet={() => {
          setShowSuccessModal(false);
          router.replace('/(worker)/wallet');
        }}
      />
      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F6',
  },
  centerAll: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  permissionBtn: {
    backgroundColor: theme.colors.primary, 
    paddingHorizontal: 24,
    paddingVertical: 14, 
    borderRadius: 12,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  // Balance Pill
  balancePillWrapper: {
    alignItems: 'center',
    marginBottom: -24, // Pulls the camera up to overlap!
    zIndex: 10,
    elevation: 4,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    ...theme.shadows.sm,
  },
  balancePillLabel: {
    fontSize: 11,
    color: theme.colors.textPrimary,
    marginRight: 16,
  },
  balancePillValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginRight: 12,
  },
  balancePillIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Camera Area
  cameraContainer: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    ...theme.shadows.md,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#A8E6CF', // Glowing green
    shadowColor: '#A8E6CF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  cornerTL: { top: 30, left: 30, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  cornerTR: { top: 30, right: 30, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  cornerBL: { bottom: 60, left: 30, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: 60, right: 30, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  
  laser: {
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30,
    height: 2,
    backgroundColor: '#A8E6CF',
    shadowColor: '#A8E6CF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },

  statusPillWrapper: {
    alignItems: 'center',
    marginTop: -20, // Overlaps the bottom of the camera!
    zIndex: 10,
    elevation: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    ...theme.shadows.sm,
  },
  statusDots: {
    flexDirection: 'row',
    marginRight: 8,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },

  // Bottom Sheet
  bottomSheetWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginHorizontal: -24, // Break out of scroll padding
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    marginTop: 12,
  },
  dragHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8E8E5',
    alignSelf: 'center',
    marginBottom: 24,
  },
  readySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  readyContent: {
    flex: 1,
  },
  readyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F7F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  readyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  readyDesc: {
    fontSize: 12, // Enhanced typography
    color: theme.colors.textSecondary,
    lineHeight: 18, // Enhanced typography
    flexShrink: 1,
  },
  scannerIllustration: {
    width: 100,
    height: 100,
    contentFit: 'contain',
  },

  twoColumnGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.sm,
    shadowOpacity: 0.05, // Softer shadow since it's on white
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gridCardTitle: {
    fontSize: 13, // Enhanced typography
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  
  // Reward Card Inner
  rewardCardContent: {
    flexDirection: 'column',
  },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  rewardCardText: {
    flex: 1,
  },
  companyName: {
    fontSize: 12, // Enhanced typography
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    flexShrink: 1,
  },
  rewardTime: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  completedBadge: {
    backgroundColor: '#F3F7F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 9, // Enhanced typography
    color: theme.colors.primary,
    fontWeight: '500',
  },

  // Tips Card Inner
  tipsIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F7F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 11, // Enhanced typography
    color: theme.colors.textSecondary,
    lineHeight: 16, // Enhanced typography
  },

  // Security Card
  securityCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
    shadowOpacity: 0.05,
  },
  securityIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F7F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityContent: {
    flex: 1,
    paddingRight: 16,
  },
  securityTitle: {
    fontSize: 13, // Enhanced typography
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 6,
    flexShrink: 1,
    lineHeight: 18, // Enhanced typography
  },
  securitySubtitle: {
    fontSize: 11, // Enhanced typography
    color: theme.colors.textSecondary,
    lineHeight: 16, // Enhanced typography
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
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 72,
    width: '92%',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.md,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -4, // Counteract standard margin for optical centering
    ...theme.shadows.sm,
    shadowColor: theme.colors.primary,
  },
  navLabel: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    fontSize: 10,
    color: theme.colors.primary,
    marginTop: 8,
    fontWeight: 'bold',
  },
});
