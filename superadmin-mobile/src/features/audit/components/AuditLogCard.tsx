import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../constants/theme';
import { AuditLogModel } from '../types/audit.types';
import { User, Building, Clock, Activity } from 'lucide-react-native';
import { format } from 'date-fns';

interface Props {
  log: AuditLogModel;
  onPress: (log: AuditLogModel) => void;
}

export const AuditLogCard = memo(({ log, onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(log)} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.actionBadge}>
          <Activity size={12} color={theme.colors.primaryDark} style={styles.icon} />
          <Text style={styles.actionText}>{log.action}</Text>
        </View>
        <Text style={styles.timeText}>{format(log.timestamp, 'MMM dd, HH:mm')}</Text>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <User size={14} color={theme.colors.textSecondary} style={styles.icon} />
          <Text style={styles.detailText} numberOfLines={1}>
            {log.actorName} {log.actorRole ? `(${log.actorRole})` : ''}
          </Text>
        </View>
        
        {log.companyName && (
          <View style={styles.detailItem}>
            <Building size={14} color={theme.colors.textSecondary} style={styles.icon} />
            <Text style={styles.detailText} numberOfLines={1}>
              {log.companyName}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => prevProps.log.id === nextProps.log.id);

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
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  actionText: {
    ...theme.typography.caption,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
  },
  timeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 4,
  },
  detailText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    flex: 1,
  }
});
