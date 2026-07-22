import React, { useCallback } from 'react';
import { 
  FlatList, 
  RefreshControl, 
  StyleSheet, 
  View, 
  ActivityIndicator 
} from 'react-native';
import { theme } from '../../../constants/theme';
import { EmptyState } from '../ui/EmptyState';
import { Typography } from '../Typography';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export interface AppListScreenProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  
  // States
  isLoading?: boolean;
  isError?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  
  // Actions
  onRefresh?: () => void;
  onEndReached?: () => void;
  onRetry?: () => void;
  
  // UI Overrides
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: keyof typeof Feather.glyphMap;
  loadingSkeleton?: React.ReactElement;
  
  // Layout
  ListHeaderComponent?: React.ReactElement;
  contentContainerStyle?: object;
}

export function AppListScreen<T>({
  data,
  renderItem,
  keyExtractor,
  isLoading = false,
  isError = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onRefresh,
  onEndReached,
  onRetry,
  emptyTitle = 'No data found',
  emptyMessage = 'There is no data to display at this time.',
  emptyIcon = 'inbox',
  loadingSkeleton,
  ListHeaderComponent,
  contentContainerStyle,
}: AppListScreenProps<T>) {
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading && !isError) {
      onEndReached?.();
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, isError, onEndReached]);

  if (isError && !data.length) {
    return (
      <View style={[styles.centerContainer, contentContainerStyle]}>
        <Feather name="alert-circle" size={48} color={theme.colors.error} />
        <Typography variant="headingSm" style={styles.errorTitle}>
          Something went wrong
        </Typography>
        <Typography variant="body" color="textSecondary" style={styles.errorMessage}>
          We couldn't load the data. Please try again.
        </Typography>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Typography variant="button" color="textLight">
              Retry
            </Typography>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (isLoading && !data.length) {
    return (
      <View style={[styles.container, contentContainerStyle]}>
        {ListHeaderComponent}
        {loadingSkeleton ? (
          loadingSkeleton
        ) : (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primaryDark} />
          </View>
        )}
      </View>
    );
  }

  const renderFooter = () => {
    if (!isFetchingNextPage) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primaryDark} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading || isError) return null;
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
      />
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isLoading && data.length > 0}
            onRefresh={onRefresh}
            colors={[theme.colors.primaryDark]}
            tintColor={theme.colors.primaryDark}
          />
        ) : undefined
      }
      contentContainerStyle={[styles.listContent, contentContainerStyle, !data.length && { flex: 1 }]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  errorTitle: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
});
