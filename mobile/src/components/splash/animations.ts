import { useEffect } from 'react';
import {
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

/**
 * Very soft floating animation (up and down) for the main illustration and background elements
 */
export const useFloatingAnimation = (duration = 3000, translateY = 10, delay = 0) => {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(translateY, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite
        true // Reverse
      )
    );
  }, [delay, duration, offset, translateY]);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));
};

/**
 * Continuous rotation for the loader ring
 */
export const useRotationAnimation = (duration = 1500) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1, // Infinite
      false // Do not reverse
    );
  }, [duration, rotation]);

  return useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
};

/**
 * Gentle pulsing opacity for particles
 */
export const usePulseOpacity = (duration = 2000, minOpacity = 0.2, maxOpacity = 0.8, delay = 0) => {
  const opacity = useSharedValue(minOpacity);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(maxOpacity, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(minOpacity, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [delay, duration, maxOpacity, minOpacity, opacity]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
};

/**
 * Startup scale and fade in
 */
export const useStartupAnimation = (delay = 0, duration = 600) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.back(1.5)) })
    );
  }, [delay, duration, progress]);

  return useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [0.8, 1], Extrapolation.CLAMP),
      },
    ],
  }));
};
