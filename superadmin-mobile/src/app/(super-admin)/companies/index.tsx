import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../constants/theme';
import { CompanyScreenHeader } from '../../../features/companies/components/CompanyScreenHeader';
import { CompanySearchBar } from '../../../features/companies/components/CompanySearchBar';
import { CompanyFilterPills } from '../../../features/companies/components/CompanyFilterPills';
import { CompanyStatsRow } from '../../../features/companies/components/CompanyStatsRow';
import { CompanyCard } from '../../../features/companies/components/CompanyCard';
import { Typography } from '../../../components/common/Typography';
import { Feather } from '@expo/vector-icons';

type CompanyStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

const MOCK_COMPANIES = [
  {
    id: '1',
    name: 'PR Enterprises',
    displayId: 'CMP-1024',
    industry: 'Construction',
    adminName: 'Rohit Sharma',
    workersCount: '2,845',
    qrBatches: '128',
    rewardsDistributed: '₹18.60 L',
    status: 'ACTIVE' as CompanyStatus,
  },
  {
    id: '2',
    name: 'BuildRight Infra',
    displayId: 'CMP-1025',
    industry: 'Infrastructure',
    adminName: 'Amit Verma',
    workersCount: '1,920',
    qrBatches: '86',
    rewardsDistributed: '₹12.40 L',
    status: 'ACTIVE' as CompanyStatus,
  },
  {
    id: '3',
    name: 'Skyline Constructions',
    displayId: 'CMP-1026',
    industry: 'Construction',
    adminName: 'Neha Gupta',
    workersCount: '3,560',
    qrBatches: '104',
    rewardsDistributed: '₹28.75 L',
    status: 'ACTIVE' as CompanyStatus,
  },
  {
    id: '4',
    name: 'GreenCraft Pvt. Ltd.',
    displayId: 'CMP-1027',
    industry: 'Manufacturing',
    adminName: 'Vikas Yadav',
    workersCount: '950',
    qrBatches: '42',
    rewardsDistributed: '₹6.20 L',
    status: 'PENDING' as CompanyStatus,
  },
  {
    id: '5',
    name: 'AB Infra Solutions',
    displayId: 'CMP-1028',
    industry: 'Infrastructure',
    adminName: 'Sandeep Patel',
    workersCount: '620',
    qrBatches: '28',
    rewardsDistributed: '₹4.80 L',
    status: 'SUSPENDED' as CompanyStatus,
  },
];

export default function CompaniesScreen() {
  const renderHeader = () => (
    <>
      <CompanyScreenHeader totalCompanies={128} />
      <CompanySearchBar />
      <CompanyFilterPills />
      <CompanyStatsRow />
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={MOCK_COMPANIES}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <CompanyCard
            id={item.id}
            name={item.name}
            displayId={item.displayId}
            industry={item.industry}
            adminName={item.adminName}
            workersCount={item.workersCount}
            qrBatches={item.qrBatches}
            rewardsDistributed={item.rewardsDistributed}
            status={item.status}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
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
    right: 24,
    backgroundColor: theme.colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    ...theme.shadows.md,
  },
  fabText: {
    color: theme.colors.surface,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  }
});
