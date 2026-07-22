import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../../../../constants/theme';
import { AppListScreen } from '../../../../../components/common/list/AppListScreen';
import { AppSearchBar } from '../../../../../components/common/list/AppSearchBar';
import { useCompanyWorkersQuery } from '../../../../../features/companies/hooks/useCompanies';
import { Typography } from '../../../../../components/common/Typography';
import { ScreenHeader } from '../../../../../components/common/ScreenHeader';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { formatDistanceToNow } from 'date-fns';
import { BackendCompanyWorker } from '../../../../../features/companies/types/company.types';

export default function CompanyWorkersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useCompanyWorkersQuery(id, {
    limit: 20,
    search: searchQuery || undefined,
  });

  const workers = useMemo(() => {
    return data?.pages.flatMap((page) => page.data || []) || [];
  }, [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/(super-admin)/workers/${item.id}?companyId=${id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {item.profilePhotoUrl ? (
            <Image source={{ uri: item.profilePhotoUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Typography variant="headingSm" color="primaryDark">
                {item.name?.charAt(0)?.toUpperCase() || 'W'}
              </Typography>
            </View>
          )}
        </View>
        <View style={styles.cardHeaderContent}>
          <Typography variant="bodyLarge" numberOfLines={1}>{item.name}</Typography>
          <Typography variant="bodySmall" color="textSecondary">
            {item.phone}
          </Typography>
        </View>
        <View style={[styles.statusBadge, item.status ? styles.statusActive : styles.statusInactive]}>
          <Typography variant="caption" color={item.status ? 'success' : 'error'}>
            {item.status ? 'ACTIVE' : 'INACTIVE'}
          </Typography>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Typography variant="caption" color="textTertiary">Rewards Earned</Typography>
          <Typography variant="bodyLarge" color="primary">₹{item.totalRewardsEarned}</Typography>
        </View>
        <View style={styles.statItem}>
          <Typography variant="caption" color="textTertiary">QR Scans</Typography>
          <Typography variant="bodyLarge">{item.totalQrScans}</Typography>
        </View>
        <View style={styles.statItem}>
          <Typography variant="caption" color="textTertiary">Last Scan</Typography>
          <Typography variant="bodySmall" numberOfLines={1}>
            {item.lastScanDate ? formatDistanceToNow(new Date(item.lastScanDate), { addSuffix: true }) : 'Never'}
          </Typography>
        </View>
      </View>
    </TouchableOpacity>
  ), [id, router]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Company Workers" showBack />

      <View style={styles.searchContainer}>
        <AppSearchBar
          placeholder="Search by name or phone..."
          
          onSearch={setSearchQuery}
        />
      </View>

      <AppListScreen
        data={workers}
        renderItem={renderItem}
      keyExtractor={(item: any) => item.id}
        isLoading={isLoading}
        isError={isError}
        onRefresh={refetch}
        onEndReached={handleEndReached}
        isFetchingNextPage={isFetchingNextPage}
        emptyTitle="No Workers Found"
        
        emptyIcon="users"
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderContent: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    marginLeft: theme.spacing.sm,
  },
  statusActive: {
    backgroundColor: theme.colors.success + '1A',
  },
  statusInactive: {
    backgroundColor: theme.colors.error + '1A',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
});
