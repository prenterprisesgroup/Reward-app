import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Pressable, 
  StyleProp, 
  ViewStyle 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolateColor
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';

export interface CheckboxProps {
  /** True if the checkbox is checked */
  checked?: boolean;
  /** Callback when checkbox is toggled */
  onChange?: (checked: boolean) => void;
  /** Disables interaction */
  disabled?: boolean;
  /** Main label text */
  label?: string;
  /** Optional helper text below the label */
  helperText?: string;
  /** Triggers red border and error text color */
  error?: boolean | string;
  /** Appends a red asterisk to the label */
  required?: boolean;
  /** Size of the checkbox box */
  size?: 'small' | 'medium' | 'large';
  /** If true, the checkbox appears on the right side of the label */
  leftLabel?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Animated.Text);

const getSizeValues = (size: CheckboxProps['size']) => {
  switch (size) {
    case 'small': return { boxSize: 18, checkSize: 12, labelVariant: 'bodySmall' as const };
    case 'large': return { boxSize: 28, checkSize: 18, labelVariant: 'title' as const };
    case 'medium':
    default: return { boxSize: 24, checkSize: 16, labelVariant: 'body' as const };
  }
};

export const Checkbox = React.memo((props: CheckboxProps) => {
  const {
    checked = false,
    onChange,
    disabled = false,
    label,
    helperText,
    error,
    required,
    size = 'medium',
    leftLabel = false,
    style
  } = props;

  const { boxSize, checkSize, labelVariant } = getSizeValues(size);

  const scaleAnim = useSharedValue(checked ? 1 : 0);
  const pressAnim = useSharedValue(1);

  useEffect(() => {
    scaleAnim.value = checked 
      ? withSpring(1, { damping: 15, stiffness: 300 })
      : withTiming(0, { duration: 200 });
  }, [checked, scaleAnim]);

  const handlePressIn = () => {
    if (!disabled) {
      pressAnim.value = withTiming(0.95, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      pressAnim.value = withTiming(1, { duration: 150 });
    }
  };

  const handlePress = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  let targetBorderColor = theme.colors.border;
  if (disabled) targetBorderColor = theme.colors.borderLight;
  else if (error) targetBorderColor = theme.colors.error;
  else if (checked) targetBorderColor = theme.colors.primary;

  const boxAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: checked 
        ? withTiming(disabled ? theme.colors.disabledText : theme.colors.primary, { duration: 200 })
        : withTiming(theme.colors.surface, { duration: 200 }),
      borderColor: withTiming(targetBorderColor, { duration: 200 }),
      transform: [{ scale: pressAnim.value }]
    };
  }, [checked, targetBorderColor, disabled, pressAnim]);

  const checkAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
      opacity: scaleAnim.value,
    };
  });

  const LabelComponent = () => {
    if (!label) return null;
    return (
      <View style={[styles.textContainer, leftLabel ? { marginRight: theme.spacing.md } : { marginLeft: theme.spacing.md }]}>
        <View style={styles.labelRow}>
          <Typography 
            variant={labelVariant} 
            color={disabled ? 'disabledText' : (error ? 'error' : 'textPrimary')}
          >
            {label}
          </Typography>
          {required && (
            <Typography variant={labelVariant} color="error" style={styles.asterisk}>
              {' *'}
            </Typography>
          )}
        </View>
        {(helperText || (error && typeof error === 'string')) && (
          <Typography 
            variant="caption" 
            color={error ? 'error' : 'textSecondary'}
            style={styles.helperText}
          >
            {error && typeof error === 'string' ? error : helperText}
          </Typography>
        )}
      </View>
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      style={[
        styles.wrapper, 
        leftLabel && styles.wrapperReverse,
        style
      ]}
    >
      {leftLabel && <LabelComponent />}
      
      {/* Box */}
      <AnimatedView 
        style={[
          styles.box, 
          { width: boxSize, height: boxSize, borderRadius: theme.radius.sm },
          boxAnimatedStyle
        ]}
      >
        <AnimatedText 
          style={[
            styles.checkMark, 
            { fontSize: checkSize },
            checkAnimatedStyle
          ]}
        >
          ✓
        </AnimatedText>
      </AnimatedView>

      {!leftLabel && <LabelComponent />}
    </Pressable>
  );
});

Checkbox.displayName = 'Checkbox';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48, // Minimum touch target size
  },
  wrapperReverse: {
    justifyContent: 'space-between',
  },
  box: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontFamily: theme.typography.family.semiBold,
    marginTop: -2, // Optical alignment for text checkmark
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  asterisk: {
    marginLeft: 2,
  },
  helperText: {
    marginTop: 2,
  }
});
