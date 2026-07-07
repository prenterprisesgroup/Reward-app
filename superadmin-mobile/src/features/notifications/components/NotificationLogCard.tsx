import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../constants/theme';
import { NotificationLogModel, NotificationStatus } from '../types/notifications.types';
import { Mail, MessageSquare, Smartphone, Activity } from 'lucide-react-native';
import { format } from 'date-fns';

const getStatusColor = (status: NotificationStatus) => {
  switch (status) {
    case 'QUEUED': return theme.colors.textSecondary;
    case 'PROCESSING': return theme.colors.primary;
    case 'SENT': return theme.colors.success;
    case 'FAILED': return theme.colors.error;
    default: return theme.colors.textSecondary;
  }
};

const getChannelIcon = (channel: string, size = 16) => {
  switch (channel) {
    case 'EMAIL': return <Mail size={size} color={theme.colors.textSecondary} />;
    case 'SMS': return <MessageSquare size={size} color={theme.colors.textSecondary} />;
    case 'PUSH': return <Smartphone size={size} color={theme.colors.textSecondary} />;
    default: return <Activity size={size} color={theme.colors.textSecondary} />;
  }
};

interface Props {
  log: NotificationLogModel;
}

export const NotificationLogCard = memo(({ log }: Props) => {
  const statusColor = getStatusColor(log.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.channelBadge}>
          {getChannelIcon(log.channel)}
          <Text style={styles.channelText}>{log.channel}</Text>
        </View>
        <Text style={styles.timeText}>{format(log.createdAt, 'MMM dd, HH:mm')}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.templateText} numberOfLines={1}>
          Template: {log.templateName}
        </Text>
        <Text style={styles.recipientText} numberOfLines={1}>
          To: {log.recipientName}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{log.status}</Text>
        </View>
        {log.error && (
          <Text style={styles.errorText} numberOfLines={1}>
            {log.error}
          </Text>
        )}
      </View>
    </View>
  );
}, (prev, next) => prev.log.id === next.log.id && prev.log.status === next.log.status);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  channelText: {
    ...theme.typography.caption,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  timeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  content: {
    marginBottom: theme.spacing.sm,
    gap: 2,
  },
  templateText: {
    ...theme.typography.body,
    fontWeight: '500',
    color: theme.colors.text,
  },
  recipientText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
    paddingTop: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: 'bold',
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    flex: 1,
    textAlign: 'right',
    marginLeft: theme.spacing.sm,
  }
});
