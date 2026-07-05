import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../common/Typography';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useRouter, useSegments } from 'expo-router';

interface BottomNavigationProps {
  isAdmin?: boolean;
}

export function BottomNavigation({ isAdmin = false }: BottomNavigationProps) {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const bottomSpacing = Math.max(insets.bottom + 12, 24);

  // Safely find the current route from segments
  // segments will look like ['(admin)', 'qr-batches'] or ['(worker)', 'scan'] or just ['qr-batches'] depending on expo router versions
  const currentSegment = segments.length > 0 ? segments[segments.length - 1] : '';

  // Determine active route
  let activeRoute = isAdmin ? 'dashboard' : 'home';
  if (isAdmin) {
    if (currentSegment === 'qr-batches') {
      activeRoute = 'qr-batches';
    } else if (currentSegment === 'payments') {
      activeRoute = 'payments';
    } else if (currentSegment === 'profile') {
      activeRoute = 'profile';
    } else if (currentSegment === 'index' || currentSegment === '(admin)') {
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
      >
        <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
          <IconFamily
            name={iconName}
            size={24}
            color={isActive ? '#FFFFFF' : '#6B7280'}
          />
          {hasBadge && <View style={styles.badge} />}
        </View>
        <Typography style={[styles.navLabel, isActive && styles.navLabelActive]}>
          {label}
        </Typography>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.bottomNavWrapper, { bottom: bottomSpacing }]}>
      <View style={styles.bottomNavContainer}>
        {isAdmin ? (
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
    alignItems: 'center',
    zIndex: 9999,
    elevation: 20,
  },
  bottomNavContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 76,
    width: '92%',
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#E5E7EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconContainerActive: {
    backgroundColor: '#4CAF50', // Primary Green
  },
  navLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    // fontFamily: 'Inter' // If available in your Typography component
  },
  navLabelActive: {
    color: '#4CAF50', // Primary Green
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
