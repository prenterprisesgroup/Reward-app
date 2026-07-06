import React, { useState, forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  View, 
  Pressable,
  Keyboard,
  TextInputProps
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence,
  interpolateColor
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';

export interface OTPInputProps extends Omit<TextInputProps, 'value' | 'onChange' | 'onChangeText'> {
  /** Number of digits for the OTP. Defaults to 6. */
  length?: number;
  /** Current OTP value */
  value?: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Callback triggered when all digits are filled */
  onComplete?: (value: string) => void;
  /** Triggers error state (shake animation and red borders) */
  error?: boolean | string;
  /** Triggers success state (green pulse and green borders) */
  success?: boolean;
  /** Triggers loading state on the component */
  loading?: boolean;
  /** Disables the entire input */
  disabled?: boolean;
  /** Countdown in seconds for the resend button */
  countdown?: number;
  /** Triggered when the user taps "Resend Code" */
  onResend?: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Animated.Text);

const OTPBox = ({ 
  digit, 
  isActive, 
  isError, 
  isSuccess 
}: { 
  digit: string; 
  isActive: boolean; 
  isError: boolean;
  isSuccess: boolean;
}) => {
  const scaleAnim = useSharedValue(1);
  const focusAnim = useSharedValue(0);
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      scaleAnim.value = withSpring(1.05, { damping: 15, stiffness: 300 });
      focusAnim.value = withTiming(1, { duration: 200 });
    } else {
      scaleAnim.value = withSpring(1, { damping: 15, stiffness: 300 });
      focusAnim.value = withTiming(0, { duration: 200 });
    }
  }, [isActive, scaleAnim, focusAnim]);

  useEffect(() => {
    if (digit) {
      fadeAnim.value = 0;
      fadeAnim.value = withTiming(1, { duration: 250 });
    }
  }, [digit, fadeAnim]);

  let targetColor = theme.colors.border;
  if (isError) targetColor = theme.colors.error;
  else if (isSuccess) targetColor = theme.colors.success;
  else if (isActive) targetColor = theme.colors.primary;

  const boxAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
      borderColor: withTiming(targetColor, { duration: 200 }),
      shadowOpacity: isActive ? withTiming(0.1) : withTiming(0),
    };
  }, [targetColor, isActive]);

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ scale: fadeAnim.value }],
    };
  });

  return (
    <AnimatedView style={[styles.box, boxAnimatedStyle]}>
      <AnimatedText style={[styles.digit, textAnimatedStyle, { color: isError ? theme.colors.error : theme.colors.textPrimary }]}>
        {digit}
      </AnimatedText>
    </AnimatedView>
  );
};

export const OTPInput = React.memo(forwardRef<TextInput, OTPInputProps>((props, ref) => {
  const {
    length = 6,
    value = '',
    onChange,
    onComplete,
    error,
    success,
    loading,
    disabled,
    countdown = 0,
    onResend,
    autoFocus,
    ...rest
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Forward ref handling
  useImperativeHandle(ref, () => inputRef.current!);

  const shakeAnim = useSharedValue(0);

  // Shake animation on error
  useEffect(() => {
    if (error) {
      shakeAnim.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error, shakeAnim]);

  const handleChange = (text: string) => {
    if (disabled || loading) return;
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, length);
    if (onChange) onChange(cleanText);
    
    if (cleanText.length === length && onComplete && cleanText !== value) {
      Keyboard.dismiss();
      onComplete(cleanText);
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      inputRef.current?.focus();
    }
  };

  const boxes = Array.from({ length }, (_, index) => {
    const digit = value[index] || '';
    const isActive = isFocused && value.length === index && !disabled;
    const isError = !!error;
    const isSuccess = !!success;
    return (
      <OTPBox 
        key={index} 
        digit={digit} 
        isActive={isActive} 
        isError={isError} 
        isSuccess={isSuccess} 
      />
    );
  });

  const shakeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeAnim.value }],
    };
  });

  return (
    <View style={styles.wrapper}>
      <AnimatedView style={[styles.container, shakeStyle]}>
        <Pressable 
          onPress={handlePress} 
          style={styles.boxContainer}
          accessibilityRole="button"
          accessibilityLabel="Enter OTP"
        >
          {boxes}
        </Pressable>
        
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          style={styles.hiddenInput}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={length}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled && !loading}
          caretHidden
          {...rest}
        />
      </AnimatedView>

      {/* Footer Area: Error message or Countdown */}
      <View style={styles.footer}>
        {error && typeof error === 'string' ? (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        ) : (
          <View style={styles.countdownRow}>
            {countdown > 0 ? (
              <Typography variant="caption" color="textSecondary">
                Resend code in {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
              </Typography>
            ) : (
              <Pressable onPress={onResend} disabled={disabled || loading}>
                <Typography 
                  variant="caption" 
                  color={(disabled || loading) ? 'textTertiary' : 'primary'} 
                  weight="semiBold"
                >
                  Resend Code
                </Typography>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}));

OTPInput.displayName = 'OTPInput';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  container: {
    width: '100%',
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  box: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderRadius: theme.radius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  digit: {
    fontFamily: theme.typography.family.semiBold,
    fontSize: theme.typography.size.headingMd,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  footer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
    minHeight: 20,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
