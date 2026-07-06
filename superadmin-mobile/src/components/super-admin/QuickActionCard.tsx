import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export interface QuickActionCardProps {
  iconName: keyof typeof Feather.glyphMap;
  title: string;
  index: number;
  onPress?: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = React.memo(({
  iconName,
  title,
  index,
  onPress
}) => {
  return (
    <Animated.View entering={FadeInUp.delay(300 + (index * 50)).duration(400)}>
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7} 
        accessibilityRole="button" 
        accessibilityLabel={title}
        onPress={onPress}
      >
        <View style={styles.iconWrapper}>
          <Feather name={iconName} size={20} color={theme.colors.primaryDark} />
        </View>
        <Typography style={styles.title} numberOfLines={2}>{title}</Typography>
        <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} style={styles.chevron} />
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    width: 160,
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  chevron: {
    marginLeft: theme.spacing.xs,
  }
});
