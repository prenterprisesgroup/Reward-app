import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { TimelineItem } from '../ui/TimelineItem';
import { Feather } from '@expo/vector-icons';

interface WorkerHistoryItemProps {
  item: any;
  isLast: boolean;
}

export const WorkerHistoryItem = React.memo(({ item, isLast }: WorkerHistoryItemProps) => {
  return (
    <TimelineItem 
      isLast={isLast}
      dotColor={theme.colors.success}
      leftContent={
        <View style={styles.content}>
          <Typography variant="subtitle" weight="bold">{item.company}</Typography>
          <Typography variant="caption" style={styles.product}>Product: {item.product}</Typography>
          <View style={styles.dateRow}>
            <Feather name="calendar" size={12} color={theme.colors.textTertiary} />
            <Typography variant="caption" style={styles.date}>{item.date}</Typography>
          </View>
        </View>
      }
      rightContent={
        <View style={styles.badge}>
          <Feather name="check-circle" size={12} color={theme.colors.success} />
          <Typography variant="caption" style={styles.badgeText}>Redeemed</Typography>
        </View>
      }
    />
  );
});

const styles = StyleSheet.create({
  content: {
    gap: 2,
  },
  product: {
    color: theme.colors.textSecondary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  date: {
    color: theme.colors.textTertiary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.success + '30',
  },
  badgeText: {
    color: theme.colors.successDark,
    fontSize: 10,
    fontWeight: '600',
  }
});
