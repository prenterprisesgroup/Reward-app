import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { WorkerStatusBadge } from './WorkerStatusBadge';

interface WorkerProfileCardProps {
  worker: any;
  onCall: () => void;
}

export const WorkerProfileCard = React.memo(({ worker, onCall }: WorkerProfileCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: worker.avatar }} style={styles.avatar} />
          {worker.isVerified && (
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={12} color={theme.colors.surface} />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Typography variant="title" weight="bold" numberOfLines={1}>
            {worker.name}
          </Typography>
          <Typography variant="caption" style={styles.idText}>
            ID: {worker.workerId}
          </Typography>
          <View style={styles.statusWrapper}>
            <WorkerStatusBadge status={worker.status} verificationStatus={worker.verificationStatus} />
          </View>
        </View>

        <TouchableOpacity style={styles.callButton} onPress={onCall} activeOpacity={0.7} accessibilityRole="button">
          <Feather name="phone-call" size={16} color={theme.colors.success} />
          <Typography variant="caption" weight="medium" style={styles.callText}>Call Worker</Typography>
        </TouchableOpacity>
      </View>

      <View style={styles.contactContainer}>
        <View style={styles.contactRow}>
          <Feather name="phone" size={14} color={theme.colors.textSecondary} style={styles.contactIcon} />
          <Typography variant="caption" style={styles.contactText}>{worker.phone}</Typography>
        </View>
        {worker.upiId && (
          <View style={styles.contactRow}>
            <Feather name="check-circle" size={14} color={theme.colors.textSecondary} style={styles.contactIcon} />
            <Typography variant="caption" style={styles.contactText}>{worker.upiId}</Typography>
          </View>
        )}
      </View>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    flexShrink: 0,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.success,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  infoContainer: {
    flex: 1,
    minWidth: 0,
  },
  idText: {
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusWrapper: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    flexShrink: 0,
  },
  callText: {
    color: theme.colors.textPrimary,
  },
  contactContainer: {
    marginTop: theme.spacing.lg,
    gap: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    width: 20,
  },
  contactText: {
    color: theme.colors.textSecondary,
  }
});
