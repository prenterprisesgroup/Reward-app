import React, { useEffect, useState, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../constants/theme';
import { useSystemHealthQuery } from '../hooks/useSystemHealth';
import { RefreshCcw } from 'lucide-react-native';

export const AutoRefreshIndicator = memo(() => {
  const { data, isRefetching } = useSystemHealthQuery();
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!data?.lastUpdated) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - data.lastUpdated.getTime()) / 1000);
      setSecondsAgo(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.lastUpdated]);

  return (
    <View style={styles.container}>
      {isRefetching ? (
        <>
          <RefreshCcw size={12} color={theme.colors.textSecondary} />
          <Text style={styles.text}>Refreshing...</Text>
        </>
      ) : (
        <Text style={styles.text}>
          Updated {secondsAgo} {secondsAgo === 1 ? 'second' : 'seconds'} ago
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: theme.spacing.sm,
  },
  text: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  }
});
