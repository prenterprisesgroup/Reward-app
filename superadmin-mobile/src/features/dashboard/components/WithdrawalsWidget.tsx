import React from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { usePendingWithdrawalsQuery } from '../hooks/usePendingWithdrawalsQuery';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

export function WithdrawalsWidget() {
  const { data, isLoading, isError } = usePendingWithdrawalsQuery();

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography style={styles.title} variant="title">Pending Withdrawals</Typography>
        <TouchableOpacity style={styles.viewAllBtn} accessibilityRole="button">
          <Typography style={styles.viewAllText}>View All</Typography>
          <Feather name="chevron-right" size={16} color={theme.colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {data.slice(0, 5).map((withdrawal, index) => (
          <View 
            key={withdrawal.id} 
            style={[
              styles.withdrawalItem,
              index === data.slice(0, 5).length - 1 && { borderBottomWidth: 0 }
            ]}
          >
            <View style={styles.withdrawalInfo}>
              <Typography variant="body" weight="semiBold" color="textPrimary">
                {withdrawal.worker.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {withdrawal.companyName} • {formatDistanceToNow(withdrawal.requestDate, { addSuffix: true })}
              </Typography>
            </View>
            <View style={styles.amountContainer}>
              <Typography variant="body" weight="bold" color="textPrimary">
                ₹{withdrawal.amount}
              </Typography>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

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
  withdrawalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  withdrawalInfo: {
    flex: 1,
  },
  amountContainer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
