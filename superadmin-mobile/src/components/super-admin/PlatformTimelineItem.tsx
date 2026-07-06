import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export interface PlatformTimelineItemProps {
  iconName: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  timeText: string;
  isLast?: boolean;
  index: number;
}

export const PlatformTimelineItem: React.FC<PlatformTimelineItemProps> = React.memo(({
  iconName,
  title,
  subtitle,
  timeText,
  isLast = false,
  index
}) => {
  return (
    <Animated.View 
      entering={FadeInUp.delay(400 + (index * 50)).duration(400)}
      style={styles.container}
    >
      <View style={styles.leftColumn}>
        <View style={styles.dotContainer}>
          <View style={styles.dot} />
        </View>
        {!isLast && <View style={styles.line} />}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Feather name={iconName} size={16} color={theme.colors.primaryDark} />
        </View>
        <View style={styles.textContainer}>
          <Typography style={styles.title}>{title}</Typography>
          <Typography style={styles.subtitle}>{subtitle}</Typography>
          <Typography style={styles.timeText}>{timeText}</Typography>
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 70,
  },
  leftColumn: {
    width: 24,
    alignItems: 'center',
  },
  dotContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 4,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingBottom: theme.spacing.lg,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    marginTop: 0,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  timeText: {
    fontSize: 10,
    color: theme.colors.textTertiary,
  }
});
