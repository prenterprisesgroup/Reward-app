import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';

interface WorkerStatsRowProps {
  walletBalance: number;
  pendingWithdrawal: number;
  totalEarned: number;
}

export function WorkerStatsRow({ walletBalance, pendingWithdrawal, totalEarned }: WorkerStatsRowProps) {
  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Typography variant="caption" style={styles.statLabel} numberOfLines={2}>Wallet Balance</Typography>
        <Typography variant="title" weight="bold" style={styles.statValueGreen} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {formatCurrency(walletBalance)}
        </Typography>
      </View>

      <View style={styles.statBox}>
        <Typography variant="caption" style={styles.statLabel} numberOfLines={2}>Pending Withdrawal</Typography>
        <Typography variant="title" weight="bold" style={styles.statValueOrange} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {formatCurrency(pendingWithdrawal)}
        </Typography>
      </View>

      <View style={styles.statBox}>
        <Typography variant="caption" style={styles.statLabel} numberOfLines={2}>Total Earned</Typography>
        <Typography variant="title" weight="bold" style={styles.statValueBlack} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {formatCurrency(totalEarned)}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
  statValueGreen: {
    color: theme.colors.success,
    fontVariant: ['tabular-nums'],
  },
  statValueOrange: {
    color: theme.colors.warning,
    fontVariant: ['tabular-nums'],
  },
  statValueBlack: {
    color: theme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});
