import React, { useState, forwardRef, useMemo, useEffect } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  View, 
  Pressable 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolateColor 
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { InputField, InputFieldProps } from './InputField';

export interface PasswordInputProps extends Omit<InputFieldProps, 'secureTextEntry' | 'rightIcon'> {
  /** If true, shows a live strength progress bar below the input */
  showStrength?: boolean;
  /** If true, shows the 5 specific password requirements below the input */
  showRequirements?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * Calculates password strength from 0 to 5
 */
const calculateStrength = (pwd: string) => {
  let strength = 0;
  if (!pwd) return strength;
  if (pwd.length >= 8) strength += 1;
  if (/[A-Z]/.test(pwd)) strength += 1;
  if (/[a-z]/.test(pwd)) strength += 1;
  if (/[0-9]/.test(pwd)) strength += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
  return strength;
};

const getStrengthColor = (strength: number) => {
  switch (strength) {
    case 0:
    case 1: return theme.colors.error;
    case 2: return theme.colors.warning;
    case 3: return theme.colors.primaryLight;
    case 4: return theme.colors.primary;
    case 5: return theme.colors.success;
    default: return theme.colors.border;
  }
};

const getStrengthLabel = (strength: number) => {
  switch (strength) {
    case 0: return '';
    case 1: return 'Very Weak';
    case 2: return 'Weak';
    case 3: return 'Medium';
    case 4: return 'Strong';
    case 5: return 'Excellent';
    default: return '';
  }
};

const RequirementItem = ({ fulfilled, text }: { fulfilled: boolean; text: string }) => {
  const colorAnim = useSharedValue(fulfilled ? 1 : 0);

  useEffect(() => {
    colorAnim.value = withTiming(fulfilled ? 1 : 0, { duration: 300 });
  }, [fulfilled, colorAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        colorAnim.value,
        [0, 1],
        [theme.colors.textTertiary, theme.colors.success]
      ),
    };
  });

  return (
    <View style={styles.reqItem}>
      <Animated.Text style={[styles.reqIcon, animatedStyle]}>
        {fulfilled ? '✓' : '•'}
      </Animated.Text>
      <Animated.Text style={[styles.reqText, animatedStyle]}>
        {text}
      </Animated.Text>
    </View>
  );
};

export const PasswordInput = React.memo(forwardRef<TextInput, PasswordInputProps>((props, ref) => {
  const {
    value = '',
    showStrength = false,
    showRequirements = false,
    onChangeText,
    ...rest
  } = props;

  const [isVisible, setIsVisible] = useState(false);
  const strength = calculateStrength(value);

  // Animated bar width
  const barWidthAnim = useSharedValue(0);
  // Eye icon rotation
  const eyeRotAnim = useSharedValue(0);

  useEffect(() => {
    barWidthAnim.value = withTiming((strength / 5) * 100, { duration: 300 });
  }, [strength, barWidthAnim]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    eyeRotAnim.value = withTiming(isVisible ? 0 : 180, { duration: 250 });
  };

  const targetColor = getStrengthColor(strength);
  const barAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${barWidthAnim.value}%`,
      backgroundColor: withTiming(targetColor, { duration: 300 }),
    };
  }, [targetColor]);

  const eyeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${eyeRotAnim.value}deg` }],
    };
  });

  const EyeIcon = (
    <Pressable 
      onPress={toggleVisibility} 
      style={styles.eyeButton}
      accessibilityRole="button"
      accessibilityLabel={isVisible ? "Hide password" : "Show password"}
      hitSlop={12}
    >
      <AnimatedView style={eyeAnimatedStyle}>
        <Typography variant="body" color="textSecondary" weight="semiBold">
          {isVisible ? '(O)' : '(-)'}
        </Typography>
      </AnimatedView>
    </Pressable>
  );

  return (
    <View style={styles.wrapper}>
      <InputField
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!isVisible}
        rightIcon={EyeIcon}
        {...rest}
      />

      {/* Strength Indicator */}
      {showStrength && value.length > 0 && (
        <View style={styles.strengthContainer}>
          <View style={styles.barTrack}>
            <AnimatedView style={[styles.barFill, barAnimatedStyle]} />
          </View>
          <Typography variant="caption" weight="semiBold" style={{ color: getStrengthColor(strength) }}>
            {getStrengthLabel(strength)}
          </Typography>
        </View>
      )}

      {/* Requirements List */}
      {showRequirements && (
        <View style={styles.reqContainer}>
          <RequirementItem fulfilled={value.length >= 8} text="Minimum 8 characters" />
          <RequirementItem fulfilled={/[A-Z]/.test(value)} text="One uppercase letter" />
          <RequirementItem fulfilled={/[a-z]/.test(value)} text="One lowercase letter" />
          <RequirementItem fulfilled={/[0-9]/.test(value)} text="One number" />
          <RequirementItem fulfilled={/[^A-Za-z0-9]/.test(value)} text="One special character" />
        </View>
      )}
    </View>
  );
}));

PasswordInput.displayName = 'PasswordInput';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  eyeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: theme.spacing.sm,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -theme.spacing.sm, // offset InputField's internal marginBottom
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  barTrack: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.pill,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: theme.radius.pill,
  },
  reqContainer: {
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    gap: 4,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reqIcon: {
    fontSize: 14,
    fontFamily: theme.typography.family.semiBold,
    marginRight: 6,
    width: 14,
    textAlign: 'center',
  },
  reqText: {
    fontSize: 12,
    fontFamily: theme.typography.family.regular,
  }
});
