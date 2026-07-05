import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { Feather } from '@expo/vector-icons';
import { Worker } from '../../types/worker';

interface WorkerCardActionsProps {
  worker: Worker;
  onView?: (worker: Worker) => void;
  onCall?: (worker: Worker) => void;
}

export function WorkerCardActions({ worker, onView, onCall }: WorkerCardActionsProps) {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => onView?.(worker)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="View Worker Details"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="eye" size={18} color={theme.colors.textSecondary} />
        <Typography variant="caption" style={styles.actionText}>View</Typography>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => onCall?.(worker)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Call Worker"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="phone" size={18} color={theme.colors.textSecondary} />
        <Typography variant="caption" style={styles.actionText}>Call</Typography>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    gap: 4,
    flexShrink: 0,
  },
  actionText: {
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
});
