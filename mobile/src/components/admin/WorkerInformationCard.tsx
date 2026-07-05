import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { InfoGrid } from '../ui/InfoGrid';
import { InfoGridItem } from '../ui/InfoGridItem';

interface WorkerInformationCardProps {
  worker: any;
  metrics: any;
}

export const WorkerInformationCard = React.memo(({ worker, metrics }: WorkerInformationCardProps) => {
  return (
    <View style={styles.card}>
      <Typography variant="subtitle" weight="bold" style={styles.title}>Worker Information</Typography>
      
      <InfoGrid>
        <InfoGridItem 
          icon="briefcase"
          label="Company"
          value={metrics.company}
          iconColor={theme.colors.success}
          iconBgColor={theme.colors.successLight}
        />
        <InfoGridItem 
          icon="calendar"
          label="Joined Date"
          value={metrics.joinedDate}
          iconColor={theme.colors.success}
          iconBgColor={theme.colors.successLight}
        />
        <InfoGridItem 
          icon="grid"
          label="Total QR Redeemed"
          value={metrics.totalQRRedeemed}
          iconColor={theme.colors.success}
          iconBgColor={theme.colors.successLight}
        />
        <InfoGridItem 
          icon="clock"
          label="Last Scan Time"
          value={metrics.lastScan}
          iconColor={theme.colors.success}
          iconBgColor={theme.colors.successLight}
        />
        <InfoGridItem 
          icon="map"
          label="Department"
          value={metrics.department}
          iconColor={theme.colors.success}
          iconBgColor={theme.colors.successLight}
        />
        <InfoGridItem 
          icon="shield"
          label="Status"
          value={
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: worker.status === 'ACTIVE' ? theme.colors.success : theme.colors.textSecondary }]} />
              <Typography variant="caption" style={[styles.statusText, { color: worker.status === 'ACTIVE' ? theme.colors.successDark : theme.colors.textSecondary }]}>
                {worker.status.charAt(0) + worker.status.slice(1).toLowerCase()}
              </Typography>
            </View>
          }
          iconColor={theme.colors.success}
          iconBgColor={theme.colors.successLight}
        />
      </InfoGrid>
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
  title: {
    marginBottom: theme.spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontWeight: '500',
  }
});
