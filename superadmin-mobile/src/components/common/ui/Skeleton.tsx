import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence
} from 'react-native-reanimated';
import { theme } from '../../../constants/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = React.memo(({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4, 
  style 
}: SkeletonProps) => {
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
    <Animated.View 
      style={[
        styles.skeleton, 
        { width, height, borderRadius }, 
        style,
        animatedStyle
      ]} 
    />
  );
});

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.borderLight,
  }
});
