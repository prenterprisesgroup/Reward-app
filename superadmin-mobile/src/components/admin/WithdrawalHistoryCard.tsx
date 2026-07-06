import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { WithdrawalHistoryItem } from './WithdrawalHistoryItem';

interface WithdrawalHistoryCardProps {
  history: any[];
}

export const WithdrawalHistoryCard = React.memo(({ history }: WithdrawalHistoryCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Typography variant="subtitle" weight="bold">Withdrawal History</Typography>
        <TouchableOpacity style={styles.viewAllBtn}>
          <Typography variant="caption" style={styles.viewAllText}>View All</Typography>
          <Feather name="chevron-right" size={14} color={theme.colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {history.map((item, index) => (
          <WithdrawalHistoryItem 
            key={item.id} 
            item={item} 
            isLast={index === history.length - 1} 
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: theme.colors.primaryDark,
    fontWeight: '500',
  },
  list: {
    marginTop: theme.spacing.sm,
  }
});
