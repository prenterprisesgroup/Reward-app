import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { theme } from '../../../constants/theme';
import { AppListScreen } from '../../../components/common/list/AppListScreen';
import { AppSearchBar } from '../../../components/common/list/AppSearchBar';
import { useQrScansList } from '../../../features/super-admin/hooks/useSuperAdminListQueries';
import { Typography } from '../../../components/common/Typography';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function SuperAdminQrScansScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useQrScansList({
    limit: 20,
    search: searchQuery || undefined,
  });

  const scans = useMemo(() => {
    return data?.pages.flatMap((page) => page.items || page.data || []) || [];
  }, [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Typography variant="subtitle" weight="bold">{item.code}</Typography>
        </View>
        <View style={styles.amountBadge}>
          <Typography variant="subtitle" weight="bold" color="primaryDark">
            +₹{item.rewardAmount}
          </Typography>
        </View>
      </View>
      <View style={styles.cardBody}>
        {item.company && (
          <View style={styles.infoRow}>
            <Feather name="briefcase" size={14} color={theme.colors.textSecondary} />
            <Typography variant="caption" color="textSecondary" style={styles.infoText}>
              {item.company.name || 'Unknown Company'}
            </Typography>
          </View>
        )}
        {item.worker && (
          <View style={styles.infoRow}>
            <Feather name="user" size={14} color={theme.colors.textSecondary} />
            <Typography variant="caption" color="textSecondary" style={styles.infoText}>
              Redeemed by: {item.worker.name} ({item.worker.phone})
            </Typography>
          </View>
        )}
        <View style={styles.infoRow}>
          <Feather name="clock" size={14} color={theme.colors.textSecondary} />
          <Typography variant="caption" color="textSecondary" style={styles.infoText}>
            {item.redeemedAt ? format(new Date(item.redeemedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
          </Typography>
        </View>
      </View>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScreenHeader title="QR Redeemed" showBack />
      <View style={styles.container}>
        <AppSearchBar
          placeholder="Search by QR code..."
          onSearch={setSearchQuery}
        />
        <AppListScreen
          data={scans}
          keyExtractor={(item) => item.id || item.code}
          renderItem={renderItem}
          isLoading={isLoading}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onRefresh={refetch}
          onEndReached={handleEndReached}
          onRetry={refetch}
          emptyTitle="No Scans Found"
          emptyMessage="No QR codes have been redeemed yet."
          emptyIcon="check-circle"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  amountBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryLight + '30',
  },
  cardBody: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  infoText: {
    marginLeft: theme.spacing.sm,
  },
});
