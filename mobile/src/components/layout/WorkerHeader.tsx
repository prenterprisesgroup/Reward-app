import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Typography } from '../common/Typography';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WorkerHeaderProps {
  user: any;
  isLoading: boolean;
  isError: boolean;
  unreadCount?: number;
}

const WorkerHeaderComponent: React.FC<WorkerHeaderProps> = ({ 
  user, 
  isLoading, 
  isError, 
  unreadCount = 0 
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getDisplayName = () => {
    // Backend getMe returns { user: { ... } }, so we safely unwrap if needed
    const u = user?.user || user;
    if (u?.fullName) return u.fullName;
    if (u?.name) return u.name;
    if (u?.firstName && u?.lastName) return `${u.firstName} ${u.lastName}`;
    return 'Worker';
  };

  const displayName = isError ? 'Worker' : getDisplayName();
  
  // also unwrap for avatar
  const uForAvatar = user?.user || user;

  return (
    <View style={[styles.container, { paddingTop: 16 }]}>
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          {isLoading ? (
            <View style={styles.avatarSkeleton} />
          ) : (
            <Image 
              source={uForAvatar?.profilePhotoUrl ? { uri: uForAvatar.profilePhotoUrl } : require('../../../assets/images/avatar.png')} 
              style={styles.avatar} 
            />
          )}
        </View>
        <TouchableOpacity 
          style={styles.notificationBtn} 
          onPress={() => router.push('/(worker)/notifications')}
          activeOpacity={0.7}
        >
          <Feather name="bell" size={22} color={theme.colors.textPrimary} />
          {unreadCount > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>
      
      <View style={styles.greetingContainer}>
        {isLoading ? (
          <>
            <View style={styles.greetingSkeleton} />
            <View style={styles.nameSkeleton} />
          </>
        ) : (
          <>
            <Typography style={styles.greetingText}>Hello,</Typography>
            <View style={styles.nameRow}>
              <Typography style={styles.nameText}>{displayName}</Typography>
              <Typography style={styles.emoji}>👋</Typography>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...theme.shadows.sm,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarSkeleton: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.border,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  emoji: {
    fontSize: 24,
    marginLeft: 8,
  },
  greetingSkeleton: {
    width: 60,
    height: 18,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  nameSkeleton: {
    width: 180,
    height: 32,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
  },
});

export const WorkerHeader = React.memo(WorkerHeaderComponent);
