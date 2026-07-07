import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { PlatformTimeline } from '../../../components/super-admin/PlatformTimeline';
import { Feather } from '@expo/vector-icons';
import { ToastAndroid, Platform, Alert } from 'react-native';

import { useCompanyActivityQuery } from '../hooks/useCompanies';

export function CompanyRecentActivityCard({ companyId }: { companyId: string }) {
  const { data, isLoading, isError } = useCompanyActivityQuery(companyId);

  const activities = data?.pages.flatMap(p => p.data) || [];

  const getIcon = (type: string) => {
    if (type.includes('QR')) return 'grid';
    if (type.includes('REWARD')) return 'gift';
    if (type.includes('WITHDRAWAL')) return 'credit-card';
    if (type.includes('USER') || type.includes('WORKER')) return 'user-plus';
    return 'activity';
  };

  const events = activities.map(act => ({
    iconName: getIcon(act.type) as any,
    title: act.title,
    subtitle: act.description,
    timeText: new Date(act.createdAt).toLocaleString()
  }));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Typography style={styles.sectionTitle} variant="title">Recent Activity</Typography>
        <TouchableOpacity 
          style={styles.viewAllBtn}
          onPress={() => {
            if (Platform.OS === 'android') ToastAndroid.show('Full activity log coming soon', ToastAndroid.SHORT);
            else Alert.alert('Coming Soon', 'Full activity log coming soon');
          }}
        >
          <Typography style={styles.viewAllText}>View All</Typography>
          <Feather name="chevron-right" size={14} color={theme.colors.success} />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <Typography>Loading activity...</Typography>
      ) : isError ? (
        <Typography>Error loading activity.</Typography>
      ) : events.length === 0 ? (
        <Typography>No recent activity found.</Typography>
      ) : (
        <PlatformTimeline events={events} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.success,
    marginRight: 4,
  }
});
