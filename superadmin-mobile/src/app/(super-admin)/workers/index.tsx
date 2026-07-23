import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { theme } from '../../../constants/theme';
import { AppListScreen } from '../../../components/common/list/AppListScreen';
import { AppSearchBar } from '../../../components/common/list/AppSearchBar';
import { useWorkersList } from '../../../features/super-admin/hooks/useSuperAdminListQueries';
import { Typography } from '../../../components/common/Typography';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { formatDistanceToNow } from 'date-fns';

export default function SuperAdminWorkersScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useWorkersList({
    limit: 20,
    search: searchQuery || undefined,
  });

  const workers = useMemo(() => {
    return data?.pages.flatMap((page) => page.users || page.items || page.data || []) || [];
  }, [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {item.profilePhoto ? (
            <Image source={{ uri: item.profilePhoto }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Typography variant="headingSm" color="primaryDark">
                {item.name?.charAt(0)?.toUpperCase() || 'W'}
              </Typography>
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Typography variant="subtitle" weight="bold">{item.name}</Typography>
          <Typography variant="caption" color="textSecondary">{item.phone}</Typography>
        </View>
        <View style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusInactive]}>
          <Typography variant="caption" color={item.isActive ? "success" : "error"} weight="semiBold">
            {item.isActive ? 'Active' : 'Inactive'}
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
          <Feather name="clock" size={14} color={theme.colors.textSecondary} />
          <Typography variant="caption" color="textSecondary" style={styles.infoText}>
            Joined {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : 'N/A'}
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
      <ScreenHeader title="Active Workers" showBack />
      <View style={styles.container}>
        <AppSearchBar
          placeholder="Search workers by name or phone..."
          onSearch={setSearchQuery}
        />
        <AppListScreen
          data={workers}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderItem}
          isLoading={isLoading}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onRefresh={refetch}
          onEndReached={handleEndReached}
          onRetry={refetch}
          emptyTitle="No Workers Found"
          emptyMessage="No active workers match your criteria."
          emptyIcon="users"
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
    marginBottom: theme.spacing.md,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: theme.colors.success + '10',
    borderColor: theme.colors.success + '30',
  },
  statusInactive: {
    backgroundColor: theme.colors.error + '10',
    borderColor: theme.colors.error + '30',
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
