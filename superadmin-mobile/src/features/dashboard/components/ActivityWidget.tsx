import React from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useRecentActivityQuery } from '../hooks/useRecentActivityQuery';
import { PlatformTimeline } from '../../../components/super-admin/PlatformTimeline';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ToastAndroid, Platform, Alert } from 'react-native';

export function ActivityWidget() {
  const { data, isLoading, isError } = useRecentActivityQuery();

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="small" color={theme.colors.primaryDark} />
        <Typography variant="bodySmall" color="textSecondary" style={{ marginTop: 8 }}>
          Loading activity...
        </Typography>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Typography variant="bodySmall" color="error">
          Could not load recent activity.
        </Typography>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <Typography variant="bodySmall" color="textSecondary">
          No recent activity found.
        </Typography>
      </View>
    );
  }

  // Map backend normalized data to timeline props
  const events = data.map(item => {
    let iconName = 'activity';
    let title = 'Platform Activity';
    let subtitle = 'Unknown activity occurred';

    if (item.type === 'REWARD') {
      iconName = 'gift';
      title = 'Reward Distributed';
      subtitle = `₹${item.amount} distributed by ${item.companyName}`;
    } else if (item.type === 'WITHDRAWAL') {
      iconName = 'credit-card';
      title = `Withdrawal ${item.status}`;
      subtitle = `₹${item.amount} requested by ${item.workerName}`;
    }

    return {
      iconName,
      title,
      subtitle,
      timeText: formatDistanceToNow(item.timestamp, { addSuffix: true }),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography style={styles.title} variant="title">Recent Platform Activity</Typography>
        <TouchableOpacity 
          style={styles.viewAllBtn} 
          accessibilityRole="button"
          onPress={() => {
            if (Platform.OS === 'android') ToastAndroid.show('Full activity log coming soon', ToastAndroid.SHORT);
            else Alert.alert('Coming Soon', 'Full activity log coming soon');
          }}
        >
          <Typography style={styles.viewAllText}>View All</Typography>
          <Feather name="chevron-right" size={16} color={theme.colors.primaryDark} />
        </TouchableOpacity>
      </View>
      <PlatformTimeline events={events} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 280,
    marginRight: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginRight: 2,
  },
  stateContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  errorContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
  }
});
