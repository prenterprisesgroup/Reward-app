import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { Worker } from '../../types/worker';
import { WorkerStatusBadge } from './WorkerStatusBadge';
import { WorkerStatsRow } from './WorkerStatsRow';
import { WorkerCardActions } from './WorkerCardActions';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

interface WorkerCardProps {
  worker: Worker;
  index: number;
  onView?: (worker: Worker) => void;
  onCall?: (worker: Worker) => void;
}

export const WorkerCard = React.memo(({ worker, index, onView, onCall }: WorkerCardProps) => {
  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 80).springify().damping(14)}
      style={styles.card}
    >
      {/* Top Row: Avatar & Info */}
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          {worker.profilePhoto ? (
            <Image source={{ uri: worker.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Typography style={styles.avatarText}>{worker.name.charAt(0)}</Typography>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Typography variant="subtitle" weight="bold" style={styles.nameText} numberOfLines={1}>
              {worker.name}
            </Typography>
            {worker.verificationStatus === 'VERIFIED' && (
              <Feather name="check-circle" size={14} color={theme.colors.success} />
            )}
            {worker.verificationStatus === 'PENDING' && (
              <Feather name="check-circle" size={14} color={theme.colors.warning} />
            )}
          </View>
          <Typography variant="caption" style={styles.idText}>ID: {worker.workerId}</Typography>
          <View style={styles.phoneRow}>
            <Feather name="phone" size={10} color={theme.colors.textSecondary} />
            <Typography variant="caption" style={styles.phoneText}>{worker.phone}</Typography>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <WorkerStatusBadge status={worker.status} verificationStatus={worker.verificationStatus} />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Bottom Row: Stats & Actions */}
      <View style={styles.bottomRow}>
        <View style={styles.statsWrapper}>
          <WorkerStatsRow 
            walletBalance={worker.walletBalance}
            pendingWithdrawal={worker.pendingWithdrawal}
            totalEarned={worker.totalEarned}
          />
        </View>
        <View style={styles.actionsWrapper}>
          <WorkerCardActions worker={worker} onView={onView} onCall={onCall} />
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    flexShrink: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.surface,
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  nameText: {
    color: theme.colors.textPrimary,
    flexShrink: 1,
  },
  idText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  phoneText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  statusContainer: {
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsWrapper: {
    flex: 1,
    marginRight: 16,
  },
  actionsWrapper: {
    width: 116,
    flexShrink: 0,
  },
});
