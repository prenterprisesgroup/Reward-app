import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { theme } from '../../../constants/theme';
import { WifiOff } from 'lucide-react-native';

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(state.isConnected === false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.container}>
      <WifiOff size={16} color="#fff" />
      <Text style={styles.text}>You are currently offline. Showing cached logs.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  text: {
    ...theme.typography.caption,
    color: '#fff',
    fontWeight: '500',
  }
});
