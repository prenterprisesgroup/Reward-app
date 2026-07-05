import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { Timeline } from '../ui/Timeline';
import { WorkerHistoryItem } from './WorkerHistoryItem';

interface RewardHistoryTimelineProps {
  history: any[];
}

export const RewardHistoryTimeline = React.memo(({ history }: RewardHistoryTimelineProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Typography variant="subtitle" weight="bold">Recent Reward History</Typography>
        <TouchableOpacity style={styles.viewAllBtn}>
          <Typography variant="caption" style={styles.viewAllText}>View All</Typography>
          <Feather name="chevron-right" size={14} color={theme.colors.primaryDark} />
        </TouchableOpacity>
      </View>
      
      <Timeline>
        {history.map((item, index) => (
          <WorkerHistoryItem 
            key={item.id} 
            item={item} 
            isLast={index === history.length - 1} 
          />
        ))}
      </Timeline>
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
    marginBottom: theme.spacing.xl,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: theme.colors.primaryDark,
    fontWeight: '500',
  }
});
