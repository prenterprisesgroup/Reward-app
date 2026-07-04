import React, { ReactNode } from 'react';
import { 
  StyleSheet, 
  ActivityIndicator, 
  Pressable, 
  ViewStyle, 
  StyleProp,
  View
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';

export type ButtonSize = 'small' | 'medium' | 'large';

export interface PrimaryButtonProps {
  /** The text to display inside the button */
  title: string;
  /** Function to execute on press */
  onPress: () => void;
  /** If true, displays a loading spinner and disables interaction */
  loading?: boolean;
  /** If true, dims the button and disables interaction */
  disabled?: boolean;
  /** Size variant of the button. Defaults to 'medium' */
  size?: ButtonSize;
  /** If true, the button takes 100% of available width */
  fullWidth?: boolean;
  /** Optional icon node to render on the left */
  leftIcon?: ReactNode;
  /** Optional icon node to render on the right */
  rightIcon?: ReactNode;
  /** Optional style override for the container */
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PrimaryButton = React.memo(({
  title,
  onPress,
  loading = false,
  disabled = false,
  size = 'medium',
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
}: PrimaryButtonProps) => {
  const scale = useSharedValue(1);

  // Derive height and typography based on size
  let height = 48; // minimum touch target
  let typoVariant: 'button' | 'bodySmall' | 'title' = 'button';
  let horizontalPadding = theme.spacing.xl;

  if (size === 'small') {
    height = 40;
    typoVariant = 'bodySmall';
    horizontalPadding = theme.spacing.lg;
  } else if (size === 'large') {
    height = 56;
    typoVariant = 'title';
    horizontalPadding = theme.spacing['2xl'];
  }

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.6 : 1,
    };
  });

  const buttonStyle: ViewStyle[] = [
    styles.container,
    { 
      height, 
      paddingHorizontal: horizontalPadding,
      width: fullWidth ? '100%' : undefined,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    }
  ];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[buttonStyle, animatedStyle, style]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.surface} />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Typography variant={typoVariant} weight="semiBold" color={theme.colors.surface}>
            {title}
          </Typography>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
});

PrimaryButton.displayName = 'PrimaryButton';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    // Apple Human Interface soft shadow
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4, // Premium elevation for Android
    // Minimum touch target enforced via height prop dynamically, 
    // but guarantee it here via minHeight
    minHeight: 48,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconContainer: {
    marginRight: theme.spacing.sm,
  },
  rightIconContainer: {
    marginLeft: theme.spacing.sm,
  },
});
