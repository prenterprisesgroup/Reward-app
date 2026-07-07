import React from 'react';
import { StyleSheet, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { theme } from '../../../../constants/theme';
import { CompanyDetailsHeader } from '../../../../features/companies/components/CompanyDetailsHeader';
import { CompanySummaryCard } from '../../../../features/companies/components/CompanySummaryCard';
import { CompanyDetailsStats } from '../../../../features/companies/components/CompanyDetailsStats';
import { CompanyAdminContactCard } from '../../../../features/companies/components/CompanyAdminContactCard';
import { CompanyRecentActivityCard } from '../../../../features/companies/components/CompanyRecentActivityCard';
import { CompanyQuickLinks } from '../../../../features/companies/components/CompanyQuickLinks';
import { CompanyInfoSection } from '../../../../features/companies/components/CompanyInfoSection';
import { CompanyAdminActions } from '../../../../features/companies/components/CompanyAdminActions';
import { useCompanyDetailsQuery } from '../../../../features/companies/hooks/useCompanies';
import { Typography } from '../../../../components/common/Typography';

export default function CompanyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  
  const { data, isLoading, isError, error, refetch, isRefetching } = useCompanyDetailsQuery(id as string);

  const isTablet = width >= 600;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Typography>Loading company details...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Typography>Error loading company. {String(error)}</Typography>
        </View>
      </SafeAreaView>
    );
  }

  const { company, stats, primaryAdmin, admins, subscription, verification } = data;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <CompanyDetailsHeader company={company} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <CompanySummaryCard company={company} verification={verification} />
        <CompanyDetailsStats stats={stats} />
        <CompanyAdminContactCard primaryAdmin={primaryAdmin} admins={admins} />

        <View style={[styles.twoColumnSection, isTablet && styles.twoColumnTablet]}>
          <View style={[styles.column, isTablet && styles.columnTablet]}>
            <CompanyRecentActivityCard companyId={company.id} />
          </View>
          <View style={[styles.column, isTablet && styles.columnTablet]}>
            <CompanyQuickLinks company={company} />
          </View>
        </View>

        <CompanyInfoSection company={company} />
        <CompanyAdminActions company={company} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  twoColumnSection: {
    flexDirection: 'column',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    gap: 16,
  },
  twoColumnTablet: {
    flexDirection: 'row',
    alignItems: 'stretch', // ensures both cards have equal height if possible
  },
  column: {
    flex: 1,
  },
  columnTablet: {
    minWidth: '48%',
  }
});
