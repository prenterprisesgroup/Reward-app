import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../common/Typography';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useRouter, useSegments } from 'expo-router';

interface BottomNavigationProps {
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export function BottomNavigation({ isAdmin = false, isSuperAdmin = false }: BottomNavigationProps) {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  // Safely find the current route from segments
  // segments will look like ['(admin)', 'qr-batches'] or ['(worker)', 'scan'] or ['(super-admin)', 'dashboard']
  const currentSegment = segments.length > 0 ? segments[segments.length - 1] : '';

  // Determine active route
  let activeRoute = 'home';
  if (isSuperAdmin) {
    if (currentSegment === 'dashboard' || currentSegment === '(super-admin)') {
      activeRoute = 'dashboard';
    } else if (currentSegment === 'companies') {
      activeRoute = 'companies';
    } else if (currentSegment === 'analytics') {
      activeRoute = 'analytics';
    } else if (currentSegment === 'settings') {
      activeRoute = 'settings';
    } else {
      activeRoute = 'dashboard';
    }
  } else if (isAdmin) {
    if (currentSegment === 'qr-batches') {
      activeRoute = 'qr-batches';
    } else if (currentSegment === 'payments') {
      activeRoute = 'payments';
    } else if (currentSegment === 'profile') {
      activeRoute = 'profile';
    } else if (currentSegment === 'index' || currentSegment === '(admin)') {
      activeRoute = 'dashboard';
    } else {
      activeRoute = 'dashboard';
    }
  } else {
    if (currentSegment === 'wallet') {
      activeRoute = 'wallet';
    } else if (currentSegment === 'scan') {
      activeRoute = 'scan';
    } else if (currentSegment === 'profile') {
      activeRoute = 'profile';
    } else if (currentSegment === 'index' || currentSegment === '(worker)') {
      activeRoute = 'home';
    }
  }

  const renderNavItem = (
    id: string,
    label: string,
    IconFamily: any,
    iconName: string,
    onPress: () => void,
    hasBadge?: boolean
  ) => {
    const isActive = activeRoute === id;
    return (
      <TouchableOpacity
        style={styles.navItem}
        onPress={onPress}
        accessible={true}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
      >
        <View style={styles.iconContainer}>
          <IconFamily
            name={iconName}
            size={28}
            color={isActive ? '#2DBE3D' : '#1F2937'}
          />
          {hasBadge && <View style={styles.badge} />}
        </View>
        <Typography style={[styles.navLabel, isActive ? styles.navLabelActive : {}]}>
          {label}
        </Typography>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.bottomNavWrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.bottomNavContainer}>
        {isSuperAdmin ? (
          <>
            {renderNavItem('dashboard', 'Dashboard', MaterialCommunityIcons, 'view-dashboard', () => {
              if (activeRoute !== 'dashboard') router.push('/(super-admin)/dashboard');
            })}
            {renderNavItem('companies', 'Companies', MaterialCommunityIcons, 'office-building', () => {
              if (activeRoute !== 'companies') router.push('/(super-admin)/companies');
            })}
            {renderNavItem('analytics', 'Analytics', MaterialCommunityIcons, 'chart-line', () => {
              if (activeRoute !== 'analytics') router.push('/(super-admin)/analytics');
            })}
            {renderNavItem('settings', 'Settings', Feather, 'settings', () => {
              if (activeRoute !== 'settings') router.push('/(super-admin)/settings');
            }, true /* hasBadge */)}
          </>
        ) : isAdmin ? (
          <>
            {renderNavItem('dashboard', 'Dashboard', MaterialCommunityIcons, 'view-dashboard', () => {
              if (activeRoute !== 'dashboard') router.push('/(admin)');
            })}
            {renderNavItem('qr-batches', 'QR Batches', MaterialCommunityIcons, 'qrcode-scan', () => {
              if (activeRoute !== 'qr-batches') router.push('/(admin)/qr-batches');
            })}
            {renderNavItem('payments', 'Payments', MaterialCommunityIcons, 'wallet-outline', () => {
              if (activeRoute !== 'payments') router.push('/(admin)/payments');
            })}
            {renderNavItem('profile', 'Profile', Feather, 'user', () => {
              if (activeRoute !== 'profile') router.push('/(admin)/profile');
            })}
          </>
        ) : (
          <>
            {renderNavItem('home', 'Home', Feather, 'home', () => {
              if (activeRoute !== 'home') router.push('/(worker)');
            })}
            {renderNavItem('scan', 'Scan', MaterialCommunityIcons, 'line-scan', () => {
              if (activeRoute !== 'scan') router.push('/(worker)/scan');
            })}
            {renderNavItem('wallet', 'Wallet', MaterialCommunityIcons, 'wallet-outline', () => {
              if (activeRoute !== 'wallet') router.push('/(worker)/wallet');
            })}
            {renderNavItem('profile', 'Profile', Feather, 'user', () => {
              if (activeRoute !== 'profile') router.push('/(worker)/profile');
            }, true /* Example badge on profile */)}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  bottomNavContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 84,
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  navLabelActive: {
    color: '#2DBE3D',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2DBE3D',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
