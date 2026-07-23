import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { theme } from '../../../constants/theme';
import { AppListScreen } from '../../../components/common/list/AppListScreen';
import { AppSearchBar } from '../../../components/common/list/AppSearchBar';
import { useQrBatchesList } from '../../../features/super-admin/hooks/useSuperAdminListQueries';
import { Typography } from '../../../components/common/Typography';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function SuperAdminQrBatchesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useQrBatchesList({
    limit: 20,
    search: searchQuery || undefined,
  });

  const batches = useMemo(() => {
    return data?.pages.flatMap((page) => page.items || page.data || []) || [];
  }, [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return theme.colors.success;
      case 'DRAFT': return theme.colors.warning;
      case 'INACTIVE': return theme.colors.textSecondary;
      default: return theme.colors.textTertiary;
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Typography variant="subtitle" weight="bold">{item.productName}</Typography>
          <Typography variant="caption" color="textSecondary">{item.batchId}</Typography>
        </View>
        <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) + '30', backgroundColor: getStatusColor(item.status) + '10' }]}>
          <Typography variant="caption" weight="semiBold" style={{ color: getStatusColor(item.status) }}>
            {item.status}
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
        <View style={styles.infoRow}>
          <Feather name="grid" size={14} color={theme.colors.textSecondary} />
          <Typography variant="caption" color="textSecondary" style={styles.infoText}>
            {item.generatedCount} Generated • {item.redeemedCount} Redeemed
          </Typography>
        </View>
        <View style={styles.infoRow}>
          <Feather name="gift" size={14} color={theme.colors.textSecondary} />
          <Typography variant="caption" color="textSecondary" style={styles.infoText}>
            ₹{item.rewardAmount} per scan
          </Typography>
        </View>
        <View style={styles.infoRow}>
          <Feather name="calendar" size={14} color={theme.colors.textSecondary} />
          <Typography variant="caption" color="textSecondary" style={styles.infoText}>
            Created {item.createdAt ? format(new Date(item.createdAt), 'MMM dd, yyyy') : 'N/A'}
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
      <ScreenHeader title="QR Batches" showBack />
      <View style={styles.container}>
        <AppSearchBar
          placeholder="Search by product or batch ID..."
          onSearch={setSearchQuery}
        />
        <AppListScreen
          data={batches}
          keyExtractor={(item) => item.id || item.batchId}
          renderItem={renderItem}
          isLoading={isLoading}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onRefresh={refetch}
          onEndReached={handleEndReached}
          onRetry={refetch}
          emptyTitle="No Batches Found"
          emptyMessage="No QR batches match your criteria."
          emptyIcon="grid"
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
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
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
