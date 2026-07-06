import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';

export const WorkerQuickActions = React.memo(() => {
  return (
    <View style={styles.container}>
      <Typography variant="subtitle" weight="bold" style={styles.title}>Quick Actions</Typography>
      
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.button} activeOpacity={0.7} accessibilityRole="button">
          <Feather name="phone-call" size={16} color={theme.colors.success} />
          <Typography variant="caption" weight="medium" style={styles.buttonText} numberOfLines={1}>Call Worker</Typography>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} activeOpacity={0.7} accessibilityRole="button">
          <Feather name="grid" size={16} color={theme.colors.success} />
          <Typography variant="caption" weight="medium" style={styles.buttonText} numberOfLines={1}>View QR Activity</Typography>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} activeOpacity={0.7} accessibilityRole="button">
          <Feather name="gift" size={16} color={theme.colors.success} />
          <Typography variant="caption" weight="medium" style={styles.buttonText} numberOfLines={1}>Reward History</Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    height: 48,
  },
  buttonText: {
    color: theme.colors.textPrimary,
  }
});
