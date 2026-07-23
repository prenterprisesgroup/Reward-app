import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform, ToastAndroid, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuthStore } from '../../../store/useAuthStore';
import { apiClient } from '../../../api/client';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [isUploading, setIsUploading] = React.useState(false);

  const handleEditAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        const asset = result.assets[0];
        
        const token = useAuthStore.getState().token;
        const uploadUrl = `${apiClient.defaults.baseURL}/api/v1/auth/me/photo`;

        const uploadResult = await FileSystem.uploadAsync(uploadUrl, asset.uri, {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'image',
          mimeType: asset.mimeType || 'image/jpeg',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const responseData = JSON.parse(uploadResult.body);

        if (uploadResult.status >= 200 && uploadResult.status < 300 && responseData?.user) {
          setUser(responseData.user);
          if (Platform.OS === 'android') {
            ToastAndroid.show('Profile picture updated', ToastAndroid.SHORT);
          } else {
            Alert.alert('Success', 'Profile picture updated');
          }
        } else {
          throw new Error(responseData?.error || 'Failed to upload image');
        }
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Router redirect is handled automatically by RequireRole
          }
        },
      ]
    );
  };

  const handleComingSoon = (feature: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${feature} coming soon`, ToastAndroid.SHORT);
    } else {
      Alert.alert('Coming Soon', `${feature} coming soon`);
    }
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>
      <Typography variant="title" style={styles.headerTitle}>Profile</Typography>
    </View>
  );

  const renderSettingItem = (icon: keyof typeof Feather.glyphMap, title: string, subtitle?: string, onPress?: () => void, isDestructive = false) => (
    <TouchableOpacity 
      style={[styles.settingItem, isDestructive && styles.destructiveItem]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isDestructive && { backgroundColor: theme.colors.error + '20' }]}>
        <Feather name={icon} size={20} color={isDestructive ? theme.colors.error : theme.colors.primaryDark} />
      </View>
      <View style={styles.settingContent}>
        <Typography 
          variant="body" 
          weight="semiBold" 
          color={isDestructive ? 'error' : 'textPrimary'}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
            {subtitle}
          </Typography>
        )}
      </View>
      <Feather name="chevron-right" size={20} color={isDestructive ? theme.colors.error : theme.colors.border} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            {isUploading ? (
              <View style={[styles.avatar, styles.loadingAvatar]}>
                <ActivityIndicator size="large" color={theme.colors.primaryDark} />
              </View>
            ) : (
              <Image 
                source={{ uri: user?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Super Admin')}&background=0D8ABC&color=fff&size=150` }} 
                style={styles.avatar}
              />
            )}
            <TouchableOpacity 
              style={styles.editAvatarBtn}
              onPress={handleEditAvatar}
              disabled={isUploading}
            >
              <Feather name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Typography variant="title" style={styles.nameText}>
            {user?.name || 'Super Admin'}
          </Typography>
          
          <View style={styles.roleBadge}>
            <Typography variant="caption" weight="bold" color="primaryDark">
              {user?.role?.replace('_', ' ') || 'SUPER ADMIN'}
            </Typography>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Typography variant="body" weight="bold" color="textSecondary" style={styles.sectionTitle}>
            Account Information
          </Typography>
          <View style={styles.card}>
            {renderSettingItem('phone', 'Phone Number', user?.phone || '+91 - Not provided', () => handleComingSoon('Update phone number'))}
            <View style={styles.divider} />
            {renderSettingItem('lock', 'Change Password', 'Update your login password', () => handleComingSoon('Change password'))}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Typography variant="body" weight="bold" color="textSecondary" style={styles.sectionTitle}>
            Preferences
          </Typography>
          <View style={styles.card}>
            {renderSettingItem('bell', 'Notifications', 'Manage push and email alerts', () => handleComingSoon('Notification settings'))}
            <View style={styles.divider} />
            {renderSettingItem('moon', 'Dark Mode', 'System default', () => handleComingSoon('Theme settings'))}
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Typography variant="body" weight="bold" color="textSecondary" style={styles.sectionTitle}>
            Session
          </Typography>
          <View style={styles.card}>
            {renderSettingItem('log-out', 'Log Out', 'End your current session', handleLogout, true)}
          </View>
        </View>
        
        <View style={styles.versionContainer}>
          <Typography variant="caption" color="textSecondary">
            PR Enterprises Super Admin v1.0.0
          </Typography>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },
  loadingAvatar: {
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primaryDark,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  nameText: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  roleBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginLeft: 72, // Aligns with text
  },
  destructiveItem: {
    backgroundColor: '#FFF5F5',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  }
});
