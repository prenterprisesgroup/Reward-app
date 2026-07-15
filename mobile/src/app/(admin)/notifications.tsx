import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/common/Typography';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { NotificationCard } from '../../components/cards/NotificationCard';
import { 
  useNotificationsInfiniteQuery, 
  useMarkNotificationReadMutation, 
  useMarkAllReadMutation, 
  useDeleteNotificationMutation,
  InAppNotification
} from '../../hooks/useNotifications';

export default function AdminNotificationsScreen() {
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

  const notifications = data?.pages.flatMap(page => page.data) || [];
  const unreadCount = data?.pages[0]?.meta?.unreadCount || 0;

  const handlePress = (notification: InAppNotification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }

    switch (notification.action) {
      case 'OPEN_QR_BATCH':
        router.push(`/(admin)/qr-batch-details?id=${notification.actionPayload?.batchId}`);
        break;
      case 'OPEN_WORKER':
        router.push(`/(admin)/worker-details?id=${notification.actionPayload?.workerId}`);
        break;
      case 'OPEN_WITHDRAWAL':
        router.push('/(admin)/payments');
        break;
      case 'OPEN_SETTINGS':
        router.push('/(admin)/profile');
        break;
    }
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Typography style={styles.emptyText}>No notifications here yet.</Typography>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Typography style={styles.title}>Notifications</Typography>
        {unreadCount > 0 ? (
          <TouchableOpacity 
            style={styles.markAllBtn}
            onPress={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCircle2 size={20} color={theme.colors.primary} />
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
          <Typography style={[styles.tabText, activeTab === 'ALL' && styles.activeTabText]}>All</Typography>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'UNREAD' && styles.activeTab]}
          onPress={() => setActiveTab('UNREAD')}
        >
          <Typography style={[styles.tabText, activeTab === 'UNREAD' && styles.activeTabText]}>Unread {unreadCount > 0 ? `(${unreadCount})` : ''}</Typography>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NotificationCard 
            notification={item} 
            onPress={handlePress}
            onMarkRead={(id) => markReadMutation.mutate(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
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
  container: { flex: 1, backgroundColor: '#F8F8F6' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    paddingTop: 16, 
    marginBottom: 16 
  },
  iconBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 16, 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...theme.shadows.sm 
  },
  markAllBtn: {
    width: 44, 
    height: 44, 
    borderRadius: 16, 
    backgroundColor: 'rgba(0, 169, 114, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textPrimary },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
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
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
  }
});
