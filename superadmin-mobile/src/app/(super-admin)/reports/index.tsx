import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../constants/theme';
import { useReportsHistoryQuery } from '../../../features/reports/hooks/useReports';
import { ReportJobCard } from '../../../features/reports/components/ReportJobCard';
import { GenerateReportModal } from '../../../features/reports/components/GenerateReportModal';
import { Plus } from 'lucide-react-native';

export default function ReportsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { data, isLoading, isError, refetch, isRefetching } = useReportsHistoryQuery();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primaryDark} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load reports history.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const reports = data?.data || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Reports</Text>
        <TouchableOpacity style={styles.generateBtn} onPress={() => setModalVisible(true)}>
          <Plus size={20} color="#fff" />
          <Text style={styles.generateBtnText}>New Report</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={[theme.colors.primaryDark]}
            tintColor={theme.colors.primaryDark}
          />
        }
        renderItem={({ item }) => <ReportJobCard job={item} />}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reports generated yet.</Text>
            <Text style={styles.emptySubtext}>Click 'New Report' to create one.</Text>
          </View>
        )}
      />

      {modalVisible && (
        <GenerateReportModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  screenTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  generateBtnText: {
    ...theme.typography.button,
    color: '#fff',
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    ...theme.typography.h4,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  errorText: {
    ...theme.typography.h4,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  retryBtn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
  },
  retryText: {
    ...theme.typography.button,
    color: theme.colors.text,
  }
});
