import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
import { CompanyScreenHeader } from '../../../features/companies/components/CompanyScreenHeader';
import { CompanySearchBar } from '../../../features/companies/components/CompanySearchBar';
import { CompanyFilterPills } from '../../../features/companies/components/CompanyFilterPills';
import { CompanyStatsRow } from '../../../features/companies/components/CompanyStatsRow';
import { CompanyCard } from '../../../features/companies/components/CompanyCard';
import { Typography } from '../../../components/common/Typography';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useCompaniesQuery } from '../../../features/companies/hooks/useCompanies';
import { queryKeys } from '../../../features/companies/hooks/queryKeys';
import { companiesApi } from '../../../features/companies/api/companies.api';



export default function CompaniesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    search: debouncedSearch || undefined,
  });

  const handleViewCompany = (id: string) => {
    // Prefetch before navigating
    queryClient.prefetchQuery({
      queryKey: queryKeys.superAdmin.companies.detail(id),
      queryFn: ({ signal }) => companiesApi.getCompanyDetails(id, signal)
    });
    queryClient.prefetchQuery({
      queryKey: queryKeys.superAdmin.companies.activity(id),
      queryFn: ({ signal }) => companiesApi.getCompanyActivity(id, { page: 1, limit: 10 }, signal)
    });
    router.push(`/(super-admin)/companies/${id}`);
  };

  const renderHeader = () => {
    const totalCompanies = data?.pages[0]?.pagination.totalItems || 0;
    return (
      <>
        <CompanyScreenHeader totalCompanies={totalCompanies} />
        <CompanySearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <CompanyFilterPills activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <CompanyStatsRow />
      </>
    );
  };

  const companies = data?.pages.flatMap(page => page.data) || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
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
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          isLoading ? <Typography style={{textAlign: 'center', marginTop: 20}}>Loading...</Typography> : 
          <Typography style={{textAlign: 'center', marginTop: 20}}>No companies found</Typography>
        }
        ListFooterComponent={
          isFetchingNextPage ? <Typography style={{textAlign: 'center', marginVertical: 20}}>Loading more...</Typography> : null
        }
      />

      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => router.push('/companies/create/step-1')}>
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
    bottom: 24,
    alignSelf: 'center', // Center it horizontally
    backgroundColor: theme.colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32, // Wider padding
    paddingVertical: 16, // Taller
    borderRadius: 30, // Pill shape
    width: '85%', // Take up most of the width like the design
    maxWidth: 400,
    ...theme.shadows.md,
  },
  fabText: {
    color: theme.colors.surface,
    fontWeight: '700',
    fontSize: 16, // Slightly larger font
    marginLeft: 8,
  }
});
