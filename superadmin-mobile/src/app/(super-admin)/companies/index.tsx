import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { AppSearchBar } from '../../../components/common/list/AppSearchBar';
import { CompanyFilterPills } from '../../../features/companies/components/CompanyFilterPills';
import { CompanyStatsRow } from '../../../features/companies/components/CompanyStatsRow';
import { CompanyCard } from '../../../features/companies/components/CompanyCard';
import { Typography } from '../../../components/common/Typography';
import { Skeleton } from '../../../components/common/ui/Skeleton';
import { EmptyState } from '../../../components/common/ui/EmptyState';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useCompaniesQuery, 
  useApproveCompanyMutation, 
  useSuspendCompanyMutation 
} from '../../../features/companies/hooks/useCompanies';
import { queryKeys } from '../../../features/companies/hooks/queryKeys';
import { companiesApi } from '../../../features/companies/api/companies.api';

interface CompaniesListHeaderProps {
  totalCompanies: number;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CompaniesListHeader = React.memo(({ totalCompanies, activeFilter, setActiveFilter, searchQuery, setSearchQuery }: CompaniesListHeaderProps) => {
  return (
    <View style={{ paddingBottom: 16 }}>
      <ScreenHeader title="Companies" subtitle={`${totalCompanies} Registered Companies`} showSearch />
      <View style={{ paddingHorizontal: 16 }}>
        <AppSearchBar 
          placeholder="Search company name, ID or industry..."
          onSearch={setSearchQuery} 
          initialValue={searchQuery}
        />
      </View>
      <CompanyFilterPills activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <CompanyStatsRow />
    </View>
  );
});

export default function CompaniesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useCompaniesQuery({
    status: activeFilter === 'all' ? undefined : activeFilter.toUpperCase(),
    search: searchQuery || undefined,
  });

  const approveMutation = useApproveCompanyMutation();
  const suspendMutation = useSuspendCompanyMutation();

  const handleAction = useCallback((id: string, currentStatus: string) => {
    if (currentStatus === 'ACTIVE') {
      Alert.alert('Suspend Company', 'Are you sure you want to suspend this company?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Suspend', style: 'destructive', onPress: () => suspendMutation.mutate(id) }
      ]);
    } else if (currentStatus === 'PENDING' || currentStatus === 'SUSPENDED') {
      Alert.alert('Activate Company', 'Are you sure you want to activate this company?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Activate', onPress: () => approveMutation.mutate(id) }
      ]);
    }
  }, [approveMutation, suspendMutation]);

  // Stabilized: prefetch + navigate called from FlatList row — needs stable reference
  const handleViewCompany = useCallback((id: string) => {
    // Prefetch before navigating
    queryClient.prefetchQuery({
      queryKey: queryKeys.superAdmin.companies.detail(id),
      queryFn: ({ signal }) => companiesApi.getCompanyDetails(id, signal)
    });
    queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.superAdmin.companies.activity(id),
      queryFn: ({ signal }) => companiesApi.getCompanyActivity(id, { page: 1, limit: 10 }, signal),
      initialPageParam: 1
    });
    router.push(`/(super-admin)/companies/${id}`);
  }, [queryClient, router]);

  // We moved the header to a separate component (CompaniesListHeader) to prevent
  // it from unmounting when searchQuery or activeFilter changes, preserving search state!

  // Stabilized: onEndReached passed to FlatList — inline function recreated every render
  const handleEndReached = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  const companies = useMemo(
    () => data?.pages.flatMap(page => page.data) || [],
    [data]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <CompaniesListHeader
            totalCompanies={data?.pages[0]?.pagination.totalItems || 0}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        }
        renderItem={({ item }) => (
          <CompanyCard
            id={item.id}
            name={item.name}
            displayId={item.displayId}
            industry={item.industry}
            adminName={item.primaryAdminName}
            workersCount={item.workersCount.toString()}
            qrBatches={item.qrBatches.toString()}
            rewardsDistributed={`₹${(item.rewardsDistributed / 100000).toFixed(2)} L`}
            status={item.status}
            onView={() => handleViewCompany(item.id)}
            onEdit={() => {
              router.push(`/companies/${item.id}/edit`);
            }}
            onAction={() => handleAction(item.id, item.status)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ paddingHorizontal: 16, marginTop: 16, gap: 16 }}>
              <Skeleton height={140} borderRadius={16} />
              <Skeleton height={140} borderRadius={16} />
              <Skeleton height={140} borderRadius={16} />
            </View>
          ) : (
            <EmptyState 
              icon="briefcase"
              title="No companies found"
              message="There are no companies matching your search or filter criteria."
            />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? <Typography style={{textAlign: 'center', marginVertical: 20}}>Loading more...</Typography> : null
        }
      />

      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => router.push('/(super-admin)/companies/create/step-1')}>
        <Feather name="plus" size={20} color={theme.colors.surface} />
        <Typography style={styles.fabText}>Add Company</Typography>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 42,
    right: 16,
    backgroundColor: theme.colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 30,
    ...theme.shadows.md,
  },
  fabText: {
    color: theme.colors.surface,
    fontWeight: '700',
    fontSize: 16, // Slightly larger font
    marginLeft: 8,
  }
});
