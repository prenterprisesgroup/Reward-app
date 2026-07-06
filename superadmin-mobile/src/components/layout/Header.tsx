import React from 'react';
import { 
  StyleSheet, 
  View, 
  Pressable, 
  StyleProp, 
  ViewStyle,
  Platform
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';

export interface HeaderProps {
  /** Main title of the header */
  title?: string;
  /** Optional subtitle below the main title */
  subtitle?: string;
  /** If true, renders a default back button on the left */
  showBackButton?: boolean;
  /** Custom override for back button behavior */
  onBackPress?: () => void;
  /** Custom element on the left (overrides back button) */
  leftComponent?: React.ReactNode;
  /** Custom element on the right (e.g., avatar, notification, action) */
  rightComponent?: React.ReactNode;
  /** Centers the title text instead of aligning left */
  centerTitle?: boolean;
  /** Removes background color */
  transparent?: boolean;
  /** Adds a drop shadow */
  elevated?: boolean;
  /** Adds a subtle bottom border line */
  showDivider?: boolean;
  /** If true, automatically adds top padding for the notch/status bar */
  safeArea?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BackButton = ({ onPress }: { onPress: () => void }) => {
  const scaleAnim = useSharedValue(1);

  const handlePressIn = () => {
    scaleAnim.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }]
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={[styles.backButton, animatedStyle]}
      hitSlop={12}
    >
      <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
    </AnimatedPressable>
  );
};

export const Header = React.memo((props: HeaderProps) => {
  const {
    title,
    subtitle,
    showBackButton = false,
    onBackPress,
    leftComponent,
    rightComponent,
    centerTitle = false,
    transparent = false,
    elevated = false,
    showDivider = false,
    safeArea = true,
    style
  } = props;

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const containerStyles: StyleProp<ViewStyle> = [
    styles.container,
    {
      paddingTop: safeArea ? insets.top + theme.spacing.sm : theme.spacing.sm,
      backgroundColor: transparent ? 'transparent' : theme.colors.background,
    },
    elevated && theme.shadows.sm,
    showDivider && styles.divider,
    style
  ];

  const hasLeftContent = showBackButton || leftComponent;
  
  return (
    <View style={containerStyles}>
      <View style={styles.contentRow}>
        
        {/* Left Section */}
        <View style={[styles.sideSection, styles.leftSection]}>
          {leftComponent ? leftComponent : showBackButton ? (
            <BackButton onPress={handleBack} />
          ) : null}
        </View>

        {/* Center Title Section */}
        <View style={[
          styles.titleSection, 
          centerTitle ? styles.titleCenter : (hasLeftContent ? styles.titleWithLeft : undefined)
        ]}>
          {title && (
            <Typography 
              variant={centerTitle ? "title" : "headingMd"} 
              color="textPrimary"
              numberOfLines={1}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography 
              variant="caption" 
              color="textSecondary"
              numberOfLines={1}
              style={styles.subtitle}
            >
              {subtitle}
            </Typography>
          )}
        </View>

        {/* Right Section */}
        <View style={[styles.sideSection, styles.rightSection]}>
          {rightComponent}
        </View>

      </View>
    </View>
  );
});

Header.displayName = 'Header';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    zIndex: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: theme.sizes.buttonHeight,
  },
  sideSection: {
    justifyContent: 'center',
    zIndex: 2, // Keeps buttons above title
  },
  leftSection: {
    alignItems: 'flex-start',
    minWidth: 40,
  },
  rightSection: {
    alignItems: 'flex-end',
    minWidth: 40,
  },
  titleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  titleCenter: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  titleWithLeft: {
    marginLeft: theme.spacing.md,
  },
  subtitle: {
    marginTop: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: theme.shadows.sm,
      android: { elevation: 2 },
      web: theme.shadows.sm,
    }),
  }
});
