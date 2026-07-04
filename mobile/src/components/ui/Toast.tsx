import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  runOnJS 
} from 'react-native-reanimated';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onHide: () => void;
  duration?: number;
}

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return { icon: CheckCircle2, color: '#10B981', bgColor: '#ECFDF5', borderColor: '#A7F3D0' };
    case 'error':
      return { icon: AlertCircle, color: '#EF4444', bgColor: '#FEF2F2', borderColor: '#FECACA' };
    case 'warning':
      return { icon: Info, color: '#F59E0B', bgColor: '#FFFBEB', borderColor: '#FDE68A' };
    case 'info':
    default:
      return { icon: Info, color: '#3B82F6', bgColor: '#EFF6FF', borderColor: '#BFDBFE' };
  }
};

export const Toast = React.memo(({ 
  visible, 
  message, 
  type = 'info', 
  onHide,
  duration = 3000
}: ToastProps) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 200 });

      const timer = setTimeout(() => {
        handleHide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible, duration]);

  const handleHide = () => {
    translateY.value = withTiming(-100, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) runOnJS(onHide)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Render even if invisible so animation can run, but return null if fully hidden
  if (!visible && opacity.value === 0) return null;

  const { icon: Icon, color, bgColor, borderColor } = getToastConfig(type);

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents={visible ? "auto" : "none"}>
      <View style={[styles.toast, { backgroundColor: bgColor, borderColor }]}>
        <Icon size={20} color={color} style={styles.icon} />
        <Typography style={[styles.message, { color: '#1F2937' }]}>{message}</Typography>
        <TouchableOpacity onPress={handleHide} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  closeBtn: {
    marginLeft: 12,
  }
});
