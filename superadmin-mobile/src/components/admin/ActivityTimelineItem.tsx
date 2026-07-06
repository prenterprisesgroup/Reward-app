import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

export interface ActivityItemProps {
  item: {
    id?: string;
    type: string;
    desc: string;
    time: string;
    amount: string;
    amountColor: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    batch?: string;
    upi?: string;
    status?: string;
  };
  index: number;
  isLast?: boolean;
}

export const ActivityTimelineItem = React.memo(({ item, index, isLast = false }: ActivityItemProps) => {
  return (
    <Animated.View entering={FadeInUp.delay((index % 10) * 50).springify()} style={styles.activityRow}>
      <View style={styles.activityTimeline}>
        <View style={[styles.activityIconWrapper, { backgroundColor: item.iconBg }]}>
          <MaterialCommunityIcons name={item.icon as any} size={20} color={item.iconColor} />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Typography weight="bold" style={[styles.activityType, { color: item.iconColor }]}>{item.type}</Typography>
          <Typography style={styles.activityTime}>{item.time}</Typography>
        </View>
        <View style={styles.activityBody}>
          <View style={styles.activityDescCol}>
            <Typography style={styles.activityDesc}>{item.desc}</Typography>
            {item.batch || item.upi ? (
              <View style={styles.badgeLabel}>
                <Typography style={styles.badgeLabelText}>{item.batch || item.upi}</Typography>
              </View>
            ) : null}
          </View>
          <View style={styles.activityAmountCol}>
            <Typography weight="bold" style={[styles.activityAmount, { color: item.amountColor }]}>{item.amount}</Typography>
            {item.status && (
              <Typography style={styles.activityStatus}>{item.status}</Typography>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  activityRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityTimeline: {
    alignItems: 'center',
    width: 40,
    marginRight: 12,
  },
  activityIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
    borderStyle: 'dashed',
    marginTop: 4,
    marginBottom: -12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityType: {
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  activityBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityDescCol: {
    flex: 1,
    paddingRight: 16,
  },
  activityDesc: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  badgeLabel: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeLabelText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  activityAmountCol: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 15,
  },
  activityStatus: {
    fontSize: 12,
    color: theme.colors.warning,
    backgroundColor: theme.colors.warningBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
});
