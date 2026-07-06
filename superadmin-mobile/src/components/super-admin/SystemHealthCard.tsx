import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function SystemHealthCard() {
  const metrics = [
    { label: 'API Status', value: 'Healthy', iconName: 'cloud' as const },
    { label: 'Database', value: 'Healthy', iconName: 'database' as const },
    { label: 'Background Jobs', value: 'Healthy', iconName: 'cpu' as const },
    { label: 'Storage', value: '82% Used', iconName: 'hard-drive' as const },
  ];

  return (
    <View style={styles.wrapper}>
      <Typography style={styles.sectionTitle} variant="title">System Health</Typography>
      
      <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.card}>
        {metrics.map((metric, idx) => (
          <View key={idx} style={[styles.metricRow, idx !== metrics.length - 1 && styles.borderBottom]}>
            <View style={styles.metricLeft}>
              <View style={styles.iconWrapper}>
                <Feather name={metric.iconName} size={16} color={theme.colors.primaryDark} />
              </View>
              <Typography style={styles.metricLabel}>{metric.label}</Typography>
            </View>
            <View style={styles.metricRight}>
              <View style={styles.statusDot} />
              <Typography style={styles.metricValue}>{metric.value}</Typography>
            </View>
          </View>
        ))}

        <View style={styles.summaryBox}>
          <View style={styles.shieldWrapper}>
            <Feather name="shield" size={24} color={theme.colors.success} />
          </View>
          <View style={styles.summaryTextWrapper}>
            <Typography style={styles.summaryTitle}>All systems operational</Typography>
            <Typography style={styles.summarySubtitle}>Everything is running smoothly.</Typography>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 260,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  metricLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  metricRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
    marginRight: 6,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successBackground,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  shieldWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  summaryTextWrapper: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  }
});
