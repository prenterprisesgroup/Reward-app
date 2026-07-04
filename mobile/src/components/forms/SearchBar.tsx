import React, { useState, forwardRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { 
  TextInput, 
  StyleSheet, 
  View, 
  Pressable, 
  StyleProp, 
  ViewStyle,
  TextInputProps,
  ActivityIndicator
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  withSpring
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';

export interface SearchBarProps extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> {
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SearchBar = React.memo(forwardRef<TextInput, SearchBarProps>((props, ref) => {
  const {
    value = '',
    onChangeText,
    onClear,
    placeholder = 'Search...',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    containerStyle,
    autoFocus,
    editable = true,
    onFocus,
    onBlur,
    ...rest
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  
  const focusAnim = useSharedValue(autoFocus ? 1 : 0);
  const scaleAnim = useSharedValue(1);
  const clearFadeAnim = useSharedValue(value.length > 0 ? 1 : 0);

  useEffect(() => {
    focusAnim.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused, focusAnim]);

  useEffect(() => {
    clearFadeAnim.value = withTiming(value.length > 0 ? 1 : 0, { duration: 200 });
  }, [value, clearFadeAnim]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    scaleAnim.value = withSpring(1.01, { damping: 15, stiffness: 300 });
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 300 });
    if (onBlur) onBlur(e);
  };

  const handleClear = () => {
    if (onChangeText) onChangeText('');
    if (onClear) onClear();
  };

  const isActuallyDisabled = disabled || !editable;
  let targetBorderColor = theme.colors.border;
  if (isFocused) {
    targetBorderColor = theme.colors.primary;
  }

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
      borderColor: withTiming(targetBorderColor, { duration: 200 }),
      backgroundColor: withTiming(isActuallyDisabled ? theme.colors.disabledSurface : theme.colors.surface, { duration: 200 })
    };
  }, [targetBorderColor, scaleAnim, isActuallyDisabled]);

  const clearBtnAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: clearFadeAnim.value,
      transform: [{ scale: clearFadeAnim.value }]
    };
  });

  const DefaultSearchIcon = (
    <Ionicons 
      name="search" 
      size={20} 
      color={theme.colors.placeholder} 
      style={{ marginRight: 8 }} 
    />
  );

  return (
    <AnimatedView style={[styles.container, containerAnimatedStyle, containerStyle]}>
      <View style={styles.leftSection}>
        {leftIcon ? leftIcon : DefaultSearchIcon}
      </View>
      
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        editable={!isActuallyDisabled}
        autoFocus={autoFocus}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        style={[
          styles.input,
          { color: isActuallyDisabled ? theme.colors.disabledText : theme.colors.textPrimary }
        ]}
        {...rest}
      />

      <View style={styles.rightSection}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          value.length > 0 && !isActuallyDisabled && (
            <AnimatedPressable 
              onPress={handleClear} 
              style={[styles.clearButton, clearBtnAnimatedStyle]}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={12}
            >
              <View style={styles.clearCircle}>
                <Typography variant="caption" style={styles.clearText}>×</Typography>
              </View>
            </AnimatedPressable>
          )
        )}
        {rightIcon && <View style={styles.extraRightIcon}>{rightIcon}</View>}
      </View>
    </AnimatedView>
  );
}));

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.sizes.inputHeight,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: theme.spacing.lg,
    width: '100%',
  },
  leftSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: theme.typography.family.regular,
    fontSize: theme.typography.size.bodyLarge,
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  clearButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    color: '#FFFFFF',
    marginTop: -2,
    fontFamily: theme.typography.family.semiBold,
  },
  extraRightIcon: {
    marginLeft: theme.spacing.sm,
  }
});
