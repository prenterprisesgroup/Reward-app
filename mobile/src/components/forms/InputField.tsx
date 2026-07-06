import React, { useState, forwardRef, ReactNode, useEffect } from 'react';
import { 
  TextInput, 
  TextInputProps, 
  StyleSheet, 
  View, 
  Pressable, 
  ViewStyle, 
  StyleProp 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolateColor,
  interpolate
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';

export interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  /** Label for the input which floats on focus */
  label?: string;
  /** Value of the input */
  value?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message displayed below the input. Triggers error state. */
  error?: string;
  /** True if the input was successful/validated */
  success?: boolean;
  /** Left icon element */
  leftIcon?: ReactNode;
  /** Right icon element */
  rightIcon?: ReactNode;
  /** Style for the container view */
  containerStyle?: StyleProp<ViewStyle>;
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTypography = Animated.createAnimatedComponent(Typography);

export const InputField = React.memo(forwardRef<TextInput, InputFieldProps>((props, ref) => {
  const {
    label,
    value,
    error,
    success,
    helperText,
    leftIcon,
    rightIcon,
    containerStyle,
    editable = true,
    onFocus,
    onBlur,
    ...rest
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || (value && value.length > 0);

  // Animation values
  const focusAnim = useSharedValue(isActive ? 1 : 0);
  const scaleAnim = useSharedValue(1);
  const shadowAnim = useSharedValue(0);

  useEffect(() => {
    focusAnim.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive, focusAnim]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    scaleAnim.value = withSpring(1.01, { damping: 15, stiffness: 300 });
    shadowAnim.value = withTiming(1, { duration: 200 });
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 300 });
    shadowAnim.value = withTiming(0, { duration: 200 });
    if (onBlur) onBlur(e);
  };

  // Determine border color based on state
  let targetBorderColor = theme.colors.border;
  if (!editable) {
    targetBorderColor = theme.colors.borderLight;
  } else if (error) {
    targetBorderColor = theme.colors.error;
  } else if (success) {
    targetBorderColor = theme.colors.success;
  } else if (isFocused) {
    targetBorderColor = theme.colors.primary;
  }

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const elevation = interpolate(shadowAnim.value, [0, 1], [0, 4]);
    return {
      transform: [{ scale: scaleAnim.value }],
      shadowOpacity: interpolate(shadowAnim.value, [0, 1], [0, 0.1]),
      elevation,
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(focusAnim.value, [0, 1], [0, -14]);
    const scale = interpolate(focusAnim.value, [0, 1], [1, 0.85]);
    
    return {
      transform: [
        { translateY },
        { scale },
        // Adjust origin to keep left alignment during scale down
        { translateX: interpolate(focusAnim.value, [0, 1], [0, -8]) }
      ],
    };
  });

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <AnimatedView 
        style={[
          styles.container,
          { 
            borderColor: targetBorderColor,
            backgroundColor: editable ? theme.colors.surface : theme.colors.disabledSurface,
          },
          containerAnimatedStyle
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        
        <View style={styles.inputWrapper}>
          {!!label && (
            <AnimatedView style={[styles.labelContainer, labelAnimatedStyle]} pointerEvents="none">
              <Typography 
                variant="body" 
                color={error ? 'error' : (isFocused ? 'primary' : 'placeholder')}
                weight={isActive ? 'medium' : 'regular'}
              >
                {label}
              </Typography>
            </AnimatedView>
          )}
          
          <TextInput
            ref={ref}
            style={[
              styles.input,
              { color: editable ? theme.colors.textPrimary : theme.colors.disabledText },
              !label && { paddingTop: 0 }
            ]}
            value={value}
            editable={editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={label ? "transparent" : theme.colors.placeholder} // Placeholder handled by floating label if provided
            {...rest}
          />
        </View>

        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </AnimatedView>

      {/* Helper & Error Text */}
      {(error || helperText) && (
        <View style={styles.footerTextContainer}>
          <Typography 
            variant="caption" 
            color={error ? 'error' : 'textSecondary'}
          >
            {error || helperText}
          </Typography>
        </View>
      )}
    </View>
  );
}));

InputField.displayName = 'InputField';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: theme.radius.xxl,
    height: 56,
    paddingHorizontal: theme.spacing.lg,
    // Base shadow, animated via reanimated
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  inputWrapper: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    top: 16, // Vertically centered starting position
    zIndex: 1,
  },
  input: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontFamily: theme.typography.family.regular,
    fontSize: theme.typography.size.bodyLarge,
    padding: 0,
    margin: 0,
    paddingTop: 16, // Push text down to make room for floating label
    height: '100%',
    textAlignVertical: 'center',
  },
  leftIconContainer: {
    marginRight: 4,
    justifyContent: 'center',
  },
  rightIconContainer: {
    marginLeft: 4,
    justifyContent: 'center',
  },
  footerTextContainer: {
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  }
});
