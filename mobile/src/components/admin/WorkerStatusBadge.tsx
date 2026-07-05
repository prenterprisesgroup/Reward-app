import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { WorkerStatus, WorkerVerificationStatus } from '../../types/worker';

interface WorkerStatusBadgeProps {
  status?: WorkerStatus;
  verificationStatus?: WorkerVerificationStatus;
}

export function WorkerStatusBadge({ status, verificationStatus }: WorkerStatusBadgeProps) {
  // If pending verification, show that first
  if (verificationStatus === 'PENDING') {
    return (
      <View style={[styles.badge, { backgroundColor: theme.colors.warningBackground }]}>
        <View style={[styles.dot, { backgroundColor: theme.colors.warning }]} />
        <Typography variant="caption" weight="medium" style={{ color: theme.colors.warning }}>
          Pending Verification
        </Typography>
      </View>
    );
  }

  // Otherwise show status
  let bgColor = theme.colors.successBackground;
  let dotColor = theme.colors.success;
  let textColor = theme.colors.success;
  let label = 'Active';

  if (status === WorkerStatus.INACTIVE) {
    bgColor = theme.colors.borderLight;
    dotColor = theme.colors.textSecondary;
    textColor = theme.colors.textSecondary;
    label = 'Inactive';
  } else if (status === WorkerStatus.BLOCKED) {
    bgColor = theme.colors.errorBackground;
    dotColor = theme.colors.error;
    textColor = theme.colors.error;
    label = 'Blocked';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Typography variant="caption" weight="medium" style={{ color: textColor }}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
