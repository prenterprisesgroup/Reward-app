import React, { forwardRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Pressable, 
  StyleProp, 
  ViewStyle, 
  ViewProps
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';

export interface CardProps extends ViewProps {
  /** The main content of the card */
  children?: React.ReactNode;
  /** Optional Card Title */
  title?: string;
  /** Optional Card Subtitle */
  subtitle?: string;
  /** Custom header component (replaces default title/subtitle rendering if provided) */
  header?: React.ReactNode;
  /** Custom footer component */
  footer?: React.ReactNode;
  /** Element aligned to the left of the header */
  leftElement?: React.ReactNode;
  /** Element aligned to the right of the header */
  rightElement?: React.ReactNode;
  /** If provided, the card becomes pressable */
  onPress?: () => void;
  /** Disables press events and slightly dims the card */
  disabled?: boolean;
  /** Card style variants */
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  /** External container style */
  style?: StyleProp<ViewStyle>;
  /** Internal padding/content style */
  contentStyle?: StyleProp<ViewStyle>;
  /** If true, removes lateral margins */
  fullWidth?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export const Card = React.memo(forwardRef<View, CardProps>((props, ref) => {
  const {
    children,
    title,
    subtitle,
    header,
    footer,
    leftElement,
    rightElement,
    onPress,
    disabled = false,
    variant = 'default',
    style,
    contentStyle,
    fullWidth = false,
    ...rest
  } = props;

  const pressAnim = useSharedValue(1);
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 400 });
  }, [fadeAnim]);

  const handlePressIn = () => {
    if (onPress && !disabled) {
      pressAnim.value = withTiming(0.98, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (onPress && !disabled) {
      pressAnim.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const handlePress = () => {
    if (onPress && !disabled) {
      onPress();
    }
  };

  const isPressable = !!onPress;
  const isOutlined = variant === 'outlined';
  const isElevated = variant === 'elevated';
  const isFlat = variant === 'flat';

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = disabled ? 0.6 : fadeAnim.value;
    
    // Elevate shadow slightly when pressed if it's already an elevated card
    const shadowOpacityAnim = isElevated 
      ? interpolate(pressAnim.value, [0.98, 1], [0.15, theme.shadows.sm.shadowOpacity])
      : isPressable ? interpolate(pressAnim.value, [0.98, 1], [0.08, 0]) : 0;

    return {
      opacity,
      transform: [{ scale: pressAnim.value }],
      shadowOpacity: shadowOpacityAnim,
    };
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
          backgroundColor: theme.colors.surface,
          elevation: 0,
        };
      case 'elevated':
        return {
          backgroundColor: theme.colors.surface,
          ...theme.shadows.md,
        };
      case 'flat':
        return {
          backgroundColor: theme.colors.background, // Slightly darker than surface
          borderWidth: 0,
          elevation: 0,
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: 'transparent',
          ...theme.shadows.sm,
        };
    }
  };

  const ContainerComponent = isPressable ? AnimatedPressable : AnimatedView;

  return (
    <ContainerComponent
      ref={ref as any}
      onPress={isPressable ? handlePress : undefined}
      onPressIn={isPressable ? handlePressIn : undefined}
      onPressOut={isPressable ? handlePressOut : undefined}
      disabled={disabled}
      accessibilityRole={isPressable ? "button" : "none"}
      accessibilityState={{ disabled }}
      style={[
        styles.container,
        getVariantStyles(),
        fullWidth && styles.fullWidth,
        animatedStyle,
        style
      ]}
      {...rest}
    >
      {/* HEADER SECTION */}
      {header ? (
        <View style={styles.headerContainer}>{header}</View>
      ) : (title || subtitle || leftElement || rightElement) ? (
        <View style={styles.headerContainer}>
          {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
          <View style={styles.titleContainer}>
            {title && (
              <Typography variant="headingSm" color="textPrimary" numberOfLines={1}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="bodySmall" color="textSecondary" numberOfLines={2}>
                {subtitle}
              </Typography>
            )}
          </View>
          {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
        </View>
      ) : null}

      {/* CONTENT SECTION */}
      {children && (
        <View style={[styles.contentContainer, contentStyle]}>
          {children}
        </View>
      )}

      {/* FOOTER SECTION */}
      {footer && (
        <View style={styles.footerContainer}>
          <View style={styles.divider} />
          {footer}
        </View>
      )}
    </ContainerComponent>
  );
}));

Card.displayName = 'Card';

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.xxl,
    width: '100%',
    overflow: 'hidden', // Ensures inner contents respect border radius
  },
  fullWidth: {
    borderRadius: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm, // Less bottom padding since content will have top padding
  },
  leftElement: {
    marginRight: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightElement: {
    marginLeft: theme.spacing.md,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    // If there is no header, we need top padding
    paddingTop: theme.spacing.md,
  },
  footerContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginBottom: theme.spacing.md,
    marginHorizontal: -theme.spacing.xl, // Stretch divider to edges
  }
});
