import React, { useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { usePendingWithdrawalsQuery } from '../hooks/usePendingWithdrawalsQuery';
import { WithdrawalListItem } from '../../../components/super-admin/WithdrawalListItem';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ToastAndroid, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export const WithdrawalsWidget = React.memo(function WithdrawalsWidget() {
  const { data, isLoading, isError } = usePendingWithdrawalsQuery();
  const router = useRouter();

  // Stabilized: prevents new function reference on every render
  const handleViewAll = useCallback(() => {
    if (Platform.OS === 'android') ToastAndroid.show('Full withdrawals list coming soon', ToastAndroid.SHORT);
    else Alert.alert('Coming Soon', 'Full withdrawals list coming soon');
  }, []);

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="small" color={theme.colors.primaryDark} />
        <Typography variant="bodySmall" color="textSecondary" style={{ marginTop: 8 }}>
          Loading withdrawals...
        </Typography>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Typography variant="bodySmall" color="error">
          Could not load pending withdrawals.
        </Typography>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <Typography variant="bodySmall" color="textSecondary">
          No pending withdrawals.
        </Typography>
      </View>
    );
  }

  const displayedItems = data.slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography style={styles.title} variant="title">Pending Withdrawals</Typography>
        <TouchableOpacity
          style={styles.viewAllBtn}
          accessibilityRole="button"
          onPress={() => router.push('/(super-admin)/withdrawals')}
        >
          <Typography style={styles.viewAllText}>View All</Typography>
          <Feather name="chevron-right" size={16} color={theme.colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {displayedItems.map((withdrawal, index) => (
          <WithdrawalListItem
            key={withdrawal.id}
            withdrawal={withdrawal}
            isLast={index === displayedItems.length - 1}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 280,
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
  listContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  stateContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: theme.spacing.xl,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
  }
});
