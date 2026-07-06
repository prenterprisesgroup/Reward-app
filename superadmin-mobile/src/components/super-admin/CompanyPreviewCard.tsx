import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

export interface CompanyPreviewCardProps {
  abbreviation: string;
  name: string;
  status: string;
  workers: string;
  qrBatches: string;
  index: number;
}

export const CompanyPreviewCard: React.FC<CompanyPreviewCardProps> = React.memo(({
  abbreviation,
  name,
  status,
  workers,
  qrBatches,
  index
}) => {
  return (
    <Animated.View 
      entering={FadeInRight.delay(600 + (index * 100)).duration(400)}
      style={styles.card}
    >
      <View style={styles.logoPlaceholder}>
        <Typography style={styles.logoText}>{abbreviation}</Typography>
      </View>
      
      <Typography style={styles.companyName} numberOfLines={1}>{name}</Typography>
      
      <View style={styles.statusBadge}>
        <View style={styles.statusDot} />
        <Typography style={styles.statusText}>{status}</Typography>
      </View>

      <View style={styles.statsRow}>
        <Typography style={styles.statLabel}>Workers</Typography>
        <Typography style={styles.statValue}>{workers}</Typography>
      </View>
      <View style={styles.statsRow}>
        <Typography style={styles.statLabel}>QR Batches</Typography>
        <Typography style={styles.statValue}>{qrBatches}</Typography>
      </View>

      <TouchableOpacity style={styles.viewBtn} activeOpacity={0.7} accessibilityRole="button">
        <Typography style={styles.viewBtnText}>View Details</Typography>
        <Feather name="chevron-right" size={16} color={theme.colors.primaryDark} />
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    width: 170,
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.success,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight + '30',
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.md,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginRight: 4,
  }
});
