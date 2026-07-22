import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  message: string;
}

export const EmptyState = React.memo(({ 
  icon = 'inbox', 
  title, 
  message 
}: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={48} color={theme.colors.textTertiary} />
      </View>
      <Typography variant="title" weight="bold" style={styles.title}>
        {title}
      </Typography>
      <Typography variant="body" color="textSecondary" style={styles.message}>
        {message}
      </Typography>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
    opacity: 0.8,
  },
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    maxWidth: 280,
  }
});
