import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../constants/theme';
import { useNotificationHistoryQuery } from '../../../features/notifications/hooks/useNotifications';
import { NotificationLogCard } from '../../../features/notifications/components/NotificationLogCard';
import { SendNotificationModal } from '../../../features/notifications/components/SendNotificationModal';
import { NotificationFilters } from '../../../features/notifications/types/notifications.types';
import { Plus } from 'lucide-react-native';

export default function NotificationsScreen() {
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const { 
    data, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    refetch, 
    isRefetching 
  } = useNotificationHistoryQuery(filters, 20);

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
          <Text style={styles.errorText}>Failed to load notification history.</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No notifications sent yet.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Notifications</Text>
      </View>

      <View style={styles.content}>
        <FlatList
          data={logs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <NotificationLogCard log={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          
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

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      {isModalVisible && (
        <SendNotificationModal 
          visible={isModalVisible} 
          onClose={() => setIsModalVisible(false)} 
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
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  }
});
