import React from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { styles } from './styles';
import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import {
  useFloatingAnimation,
  useRotationAnimation,
  usePulseOpacity,
  useStartupAnimation,
} from './animations';

export function SplashScreen() {
  const startupStyle = useStartupAnimation(100, 800);
  const heroFloating = useFloatingAnimation(3500, 12, 0);
  const loaderRotation = useRotationAnimation(1500);
  const loaderRingReverse = useRotationAnimation(2000); // Optional subtle counter rotation if wanted, but using one

  // Particle pulsing animations for scattered dots
  const pulse1 = usePulseOpacity(2000, 0.1, 0.4, 0);
  const pulse2 = usePulseOpacity(2500, 0.1, 0.5, 400);
  const pulse3 = usePulseOpacity(3000, 0.1, 0.3, 800);
  const pulse4 = usePulseOpacity(2200, 0.1, 0.6, 1200);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* --- Abstract Background Decor --- */}
      <View style={styles.backgroundContainer} pointerEvents="none">
        {/* Soft abstract circles */}
        <View style={styles.abstractCircleLarge} />
        <View style={styles.abstractCircleSmall} />

        {/* Scattered Particles */}
        <Animated.View style={[styles.particle, { top: '15%', left: '20%' }, pulse1]} />
        <Animated.View style={[styles.particle, { top: '30%', right: '15%' }, pulse2]} />
        <Animated.View style={[styles.particle, { top: '45%', left: '10%', width: 12, height: 12 }, pulse3]} />
        <Animated.View style={[styles.particle, { top: '65%', right: '25%' }, pulse4]} />
        <Animated.View style={[styles.particle, { top: '75%', left: '15%', width: 6, height: 6 }, pulse1]} />

        {/* Bottom Skyline Placeholder (Simulated via very light background illustration if asset missing, or use actual asset if provided) */}
        {/* <Image source={require('../../../assets/images/skyline-placeholder.png')} style={styles.bottomSkyline} resizeMode="cover" /> */}
        
        {/* Bottom Leaves Placeholders */}
        {/* <Image source={require('../../../assets/images/leaves-left.png')} style={styles.bottomLeavesLeft} resizeMode="contain" /> */}
        {/* <Image source={require('../../../assets/images/leaves-right.png')} style={styles.bottomLeavesRight} resizeMode="contain" /> */}
      </View>

      {/* --- Main Content --- */}
      <Animated.View style={[styles.content, startupStyle]}>
        
        {/* Hero Illustration */}
        <Animated.View style={[styles.illustrationContainer, heroFloating]}>
          <Image 
            source={require('../../../assets/images/splash-illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title Section */}
        <View style={styles.textContainer}>
          <Ionicons name="gift-outline" size={28} color={theme.colors.primary} style={styles.giftIcon} />
          
          <Typography variant="headingLg" weight="bold" align="center" style={styles.title}>
            Reward. Recognize. Empower.
          </Typography>
          
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Ionicons name="star" size={14} color={theme.colors.primary} style={styles.dividerStar} />
            <View style={styles.dividerLine} />
          </View>

          <Typography variant="bodyLarge" weight="medium" align="center" style={styles.subtitle}>
            Reward Every Scan.{'\n'}Empower Every Worker.
          </Typography>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loaderContainer}>
          <Animated.View style={[styles.loaderRing, loaderRotation]}>
             {/* The loader Ring rotates continuously */}
          </Animated.View>
          {/* Static dots in center of loader */}
          <View style={[styles.loaderDotsContainer, { position: 'absolute', top: 28 }]}>
            <View style={styles.loaderDot} />
            <View style={styles.loaderDot} />
            <View style={styles.loaderDot} />
          </View>
          <Typography variant="body" weight="medium" style={styles.loadingText}>Loading...</Typography>
        </View>

      </Animated.View>

      {/* Bottom Trust Card */}
      <Animated.View style={[styles.trustCard, startupStyle]}>
        <View style={styles.trustItem}>
          <Feather name="shield" size={16} color={theme.colors.textSecondary} style={styles.trustIcon} />
          <Typography variant="bodySmall" weight="medium" style={styles.trustText}>Secure</Typography>
        </View>
        
        <View style={styles.trustDivider} />
        
        <View style={styles.trustItem}>
          <Feather name="users" size={16} color={theme.colors.textSecondary} style={styles.trustIcon} />
          <Typography variant="bodySmall" weight="medium" style={styles.trustText}>Transparent</Typography>
        </View>
        
        <View style={styles.trustDivider} />
        
        <View style={styles.trustItem}>
          <MaterialCommunityIcons name="medal-outline" size={18} color={theme.colors.textSecondary} style={styles.trustIcon} />
          <Typography variant="bodySmall" weight="medium" style={styles.trustText}>Rewarding</Typography>
        </View>
      </Animated.View>
      
    </SafeAreaView>
  );
}
