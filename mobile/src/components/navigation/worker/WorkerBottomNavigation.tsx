import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, Animated as RNAnimated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../common/Typography';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';
import { useRouter, useSegments } from 'expo-router';

export interface WorkerBottomNavigationProps {
  /** Optional badge configuration for future extensibility */
  badges?: {
    [key: string]: { hasBadge: boolean; count?: number };
  };
}

export const WorkerBottomNavigation = React.memo(({ badges }: WorkerBottomNavigationProps) => {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  
  // Safe Area handling - don't hardcode height
  const bottomSpacing = Math.max(insets.bottom, 16);

  // Safely find the current route
  const currentSegment = segments.length > 0 ? segments[segments.length - 1] : '';

  // Determine active route
  let activeRoute = 'home';
  if (currentSegment === 'wallet') activeRoute = 'wallet';
  else if (currentSegment === 'scan') activeRoute = 'scan';
  else if (currentSegment === 'notifications') activeRoute = 'notifications';
  else if (currentSegment === 'profile') activeRoute = 'profile';

  // FAB Dimensions
  const FAB_SIZE = 64;
  const fabTopOffset = -(FAB_SIZE * 0.35); // Responsive overlap

  // Navigation handlers - useCallback to prevent unnecessary re-renders
  const navigateTo = useCallback((route: string, path: any) => {
    if (activeRoute !== route) {
      // Use replace instead of push to prevent infinite stack growth
      // when switching between simulated tabs.
      router.replace(path);
    }
  }, [activeRoute, router]);

  const renderNavItem = useCallback((
    id: string,
    label: string,
    IconFamily: any,
    iconName: string,
    onPress: () => void,
  ) => {
    const isActive = activeRoute === id;
    const badgeConfig = badges?.[id];
    
    return (
      <TouchableOpacity
        key={id}
        style={styles.navItem}
        onPress={onPress}
        accessible={true}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={`${label} tab`}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <IconFamily
            name={iconName}
            size={24}
            color={isActive ? theme.colors.primary : '#8E8E93'}
          />
          {badgeConfig?.hasBadge && (
            <View style={styles.badge}>
              {badgeConfig.count && badgeConfig.count > 0 ? (
                <Typography style={styles.badgeText}>
                  {badgeConfig.count > 9 ? '9+' : badgeConfig.count}
                </Typography>
              ) : null}
            </View>
          )}
        </View>
        <Typography style={[styles.navLabel, isActive && styles.navLabelActive]}>
          {label}
        </Typography>
      </TouchableOpacity>
    );
  }, [activeRoute, badges]);

  const renderScannerFAB = useCallback(() => {
    const isActive = activeRoute === 'scan';
    
    return (
      <View style={[styles.fabContainer, { top: fabTopOffset }]} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.fab, isActive && styles.fabActive]}
          onPress={() => navigateTo('scan', '/(worker)/scan')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Scan QR Code"
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        {/* Optical alignment label for consistency, optional */}
        <Typography style={[styles.navLabel, { marginTop: 40 }, isActive && styles.navLabelActive]}>
          Scan
        </Typography>
      </View>
    );
  }, [activeRoute, navigateTo]);

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomSpacing }]} pointerEvents="box-none">
      <View style={styles.container}>
        {renderNavItem('home', 'Home', Feather, 'home', () => navigateTo('home', '/(worker)'))}
        {renderNavItem('wallet', 'Wallet', MaterialCommunityIcons, 'wallet-outline', () => navigateTo('wallet', '/(worker)/wallet'))}
        
        {/* Placeholder for the FAB so spacing is correct */}
        <View style={styles.fabPlaceholder} />
        
        {renderNavItem('notifications', 'Alerts', Feather, 'bell', () => navigateTo('notifications', '/(worker)/notifications'))}
        {renderNavItem('profile', 'Profile', Feather, 'user', () => navigateTo('profile', '/(worker)/profile'))}
      </View>
      
      {/* Render FAB absolutely so it floats above */}
      {renderScannerFAB()}
    </View>
  );
});

WorkerBottomNavigation.displayName = 'WorkerBottomNavigation';

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 20, // Ensure it sits above bottom sheets/snackbars conceptually
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    width: '92%',
    height: 72,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 8, // Little gap from the very bottom
  },
  navItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  navLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  navLabelActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: theme.colors.error,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  fabPlaceholder: {
    width: 64, // Space for the FAB
  },
  fabContainer: {
    position: 'absolute',
    top: -24, // Lift it out of the container
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  fabActive: {
    backgroundColor: '#388E3C', // Slightly darker green when active
  }
});
