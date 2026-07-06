import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence
} from 'react-native-reanimated';

export function WorkerSkeletonCard() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.card}>
      {/* Top Row: Avatar & Info */}
      <View style={styles.topRow}>
        <Animated.View style={[styles.avatar, animatedStyle]} />
        <View style={styles.infoContainer}>
          <Animated.View style={[styles.nameSkeleton, animatedStyle]} />
          <Animated.View style={[styles.idSkeleton, animatedStyle]} />
          <Animated.View style={[styles.phoneSkeleton, animatedStyle]} />
        </View>
        <Animated.View style={[styles.badgeSkeleton, animatedStyle]} />
      </View>

      <View style={styles.divider} />

      {/* Bottom Row: Stats & Actions */}
      <View style={styles.bottomRow}>
        <View style={styles.statsWrapper}>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Animated.View style={[styles.statLabelSkeleton, animatedStyle]} />
              <Animated.View style={[styles.statValueSkeleton, animatedStyle]} />
            </View>
            <View style={styles.statBox}>
              <Animated.View style={[styles.statLabelSkeleton, animatedStyle]} />
              <Animated.View style={[styles.statValueSkeleton, animatedStyle]} />
            </View>
            <View style={styles.statBox}>
              <Animated.View style={[styles.statLabelSkeleton, animatedStyle]} />
              <Animated.View style={[styles.statValueSkeleton, animatedStyle]} />
            </View>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <Animated.View style={[styles.actionButtonSkeleton, animatedStyle]} />
          <Animated.View style={[styles.actionButtonSkeleton, animatedStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.borderLight,
  },
  infoContainer: {
    flex: 1,
    gap: 8,
    paddingTop: 4,
  },
  nameSkeleton: {
    width: '60%',
    height: 16,
    borderRadius: 4,
    backgroundColor: theme.colors.borderLight,
  },
  idSkeleton: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: theme.colors.borderLight,
  },
  phoneSkeleton: {
    width: '50%',
    height: 12,
    borderRadius: 4,
    backgroundColor: theme.colors.borderLight,
  },
  badgeSkeleton: {
    width: 70,
    height: 24,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.borderLight,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  statsWrapper: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statLabelSkeleton: {
    width: '80%',
    height: 10,
    borderRadius: 4,
    backgroundColor: theme.colors.borderLight,
  },
  statValueSkeleton: {
    width: '60%',
    height: 18,
    borderRadius: 4,
    backgroundColor: theme.colors.borderLight,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonSkeleton: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.borderLight,
  },
});
