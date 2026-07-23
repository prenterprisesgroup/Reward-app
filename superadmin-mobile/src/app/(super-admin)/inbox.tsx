import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/common/Typography';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { NotificationCard } from '../../shared/notifications/components/NotificationCard';
import { 
  useNotificationsInfiniteQuery, 
  useMarkNotificationReadMutation, 
  useMarkAllReadMutation, 
  useDeleteNotificationMutation,
  InAppNotification
} from '../../shared/notifications/hooks/useNotifications';
import { EmptyState } from '../../components/common/ui/EmptyState';
import { Skeleton } from '../../components/common/ui/Skeleton';

export default function InboxScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD'>('ALL');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching
  } = useNotificationsInfiniteQuery('ALL', activeTab, 20);

  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const notifications = data?.pages.flatMap((page: any) => page.data) || [];
  const unreadCount = data?.pages[0]?.meta?.unreadCount || 0;

  const handlePress = useCallback((notification: InAppNotification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }

    switch (notification.action) {
      case 'OPEN_COMPANY':
        const targetId = notification.actionPayload?.companyId || notification.actionPayload?.id;
        if (targetId) {
          router.push(`/(super-admin)/companies/${targetId}`);
        }
        break;
      case 'OPEN_WORKER':
      case 'OPEN_WITHDRAWAL':
      case 'OPEN_SETTINGS':
        // Future extensions for Super Admin
        break;
    }
  }, [markReadMutation, router]);

  const handleMarkRead = useCallback((id: string) => {
    markReadMutation.mutate(id);
  }, [markReadMutation]);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const notificationColors = useMemo(() => ({
    primary: theme.colors.primary,
    success: theme.colors.success,
    error: theme.colors.error,
    surface: theme.colors.surface,
    surfaceHighlight: theme.colors.background,
    text: theme.colors.textPrimary,
    textSecondary: theme.colors.textSecondary,
  }), []);

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={{ padding: 16, gap: 16 }}>
          <Skeleton height={80} borderRadius={12} />
          <Skeleton height={80} borderRadius={12} />
          <Skeleton height={80} borderRadius={12} />
          <Skeleton height={80} borderRadius={12} />
        </View>
      );
    }
    return (
      <EmptyState
        title="No notifications"
        message="You're all caught up! We'll notify you when there's new activity."
        icon="bell"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Typography style={styles.title}>Inbox</Typography>
        {unreadCount > 0 ? (
          <TouchableOpacity 
            style={styles.markAllBtn}
            onPress={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <Feather name="check-circle" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ALL' && styles.activeTab]}
          onPress={() => setActiveTab('ALL')}
        >
          <Typography style={[styles.tabText, activeTab === 'ALL' ? styles.activeTabText : {}]}>All</Typography>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'UNREAD' && styles.activeTab]}
          onPress={() => setActiveTab('UNREAD')}
        >
          <Typography style={[styles.tabText, activeTab === 'UNREAD' ? styles.activeTabText : {}]}>
            Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Typography>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NotificationCard 
            notification={item}
            colors={notificationColors}
            onPress={handlePress}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching && !isFetchingNextPage} 
            onRefresh={refetch} 
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ margin: 16 }} />
          ) : null
        }
        removeClippedSubviews={true}
        windowSize={5}
        maxToRenderPerBatch={10}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: 16, 
    marginBottom: 16 
  },
  iconBtn: { 
    width: 44, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'flex-start',
  },
  markAllBtn: {
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: theme.colors.surface, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  title: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 40,
  }
});
