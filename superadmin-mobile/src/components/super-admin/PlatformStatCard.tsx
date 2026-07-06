import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export interface PlatformStatCardProps {
  iconName: keyof typeof Feather.glyphMap;
  title: string;
  value: string | number;
  subtitle: string;
  trendText: string;
  trendType?: 'positive' | 'warning' | 'neutral';
  index: number;
}

export const PlatformStatCard: React.FC<PlatformStatCardProps> = React.memo(({
  iconName,
  title,
  value,
  subtitle,
  trendText,
  trendType = 'positive',
  index
}) => {
  const getTrendColor = () => {
    switch (trendType) {
      case 'warning': return theme.colors.warning;
      case 'neutral': return theme.colors.textSecondary;
      case 'positive':
      default: return theme.colors.success;
    }
  };

  const getTrendBgColor = () => {
    switch (trendType) {
      case 'warning': return theme.colors.warningBackground;
      case 'neutral': return theme.colors.borderLight;
      case 'positive':
      default: return theme.colors.successBackground;
    }
  };

  return (
    <Animated.View 
      entering={FadeInUp.delay(150 + (index * 50)).duration(400)}
      style={styles.cardContainer}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Feather name={iconName} size={18} color={theme.colors.primaryDark} />
        </View>
        <Typography style={styles.title} numberOfLines={1}>{title}</Typography>
      </View>
      
      <View style={styles.valueContainer}>
        <Typography style={styles.value} variant="title">{value}</Typography>
        <Typography style={styles.subtitle}>{subtitle}</Typography>
      </View>
      
      <View style={[styles.trendBadge, { backgroundColor: getTrendBgColor() }]}>
        {trendType === 'positive' && <Feather name="arrow-up-right" size={14} color={getTrendColor()} style={styles.trendIcon} />}
        {trendType === 'warning' && <Feather name="arrow-up-right" size={14} color={getTrendColor()} style={styles.trendIcon} />}
        <Typography style={[styles.trendText, { color: getTrendColor() }]}>{trendText}</Typography>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    width: '48%', // Show 2 cards per row on mobile instead of 3
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryLight + '30', // Semi-transparent
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    flex: 1,
  },
  valueContainer: {
    marginBottom: theme.spacing.md,
  },
  value: {
    fontSize: 22, // Slightly smaller to fit large currency values
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    alignSelf: 'flex-start',
  },
  trendIcon: {
    marginRight: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  }
});
