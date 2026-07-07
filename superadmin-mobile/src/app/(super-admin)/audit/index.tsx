import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../constants/theme';
import { useAuditLogsQuery } from '../../../features/audit/hooks/useAudit';
import { AuditLogCard } from '../../../features/audit/components/AuditLogCard';
import { AuditFilterBar } from '../../../features/audit/components/AuditFilterBar';
import { AuditStateDiffModal } from '../../../features/audit/components/AuditStateDiffModal';
import { OfflineBanner } from '../../../features/audit/components/OfflineBanner';
import { AuditFilters, AuditLogModel } from '../../../features/audit/types/audit.types';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from 'expo-router';

export default function AuditLogsScreen() {
  const [filters, setFilters] = useState<AuditFilters>({});
  const [selectedLog, setSelectedLog] = useState<AuditLogModel | null>(null);
  
  const { 
    data, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    refetch, 
    isRefetching 
  } = useAuditLogsQuery(filters, 20);

  // Auto-refresh when coming back online
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected && isError) {
          refetch();
        }
      });
      return () => unsubscribe();
    }, [isError, refetch])
  );

  const logs = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primaryDark} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryDark} />
        </View>
      );
    }
    
    if (isError && logs.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load audit logs.</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No audit logs found.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <OfflineBanner />
      
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Global Audit Logs</Text>
      </View>

      <View style={styles.content}>
        <AuditFilterBar filters={filters} onFiltersChange={setFilters} />
        
        <FlatList
          data={logs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <AuditLogCard log={item} onPress={setSelectedLog} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          
          // Virtualized Infinite List Optimization Props
          removeClippedSubviews={true}
          windowSize={11}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={refetch}
              colors={[theme.colors.primaryDark]}
              tintColor={theme.colors.primaryDark}
            />
          }
        />
      </View>

      <AuditStateDiffModal 
        log={selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
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
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  listContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  }
});
