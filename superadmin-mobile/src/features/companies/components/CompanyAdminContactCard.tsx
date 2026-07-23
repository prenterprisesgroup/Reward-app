import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { Linking, ToastAndroid, Platform, Alert } from 'react-native';

interface CompanyAdminContactCardProps {
  primaryAdmin: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePhotoUrl?: string | null;
  } | null;
  admins: any[];
}

export function CompanyAdminContactCard({ primaryAdmin, admins }: CompanyAdminContactCardProps) {
  if (!primaryAdmin) {
    return (
      <View style={styles.card}>
        <Typography>No primary admin assigned.</Typography>
      </View>
    );
  }

  const initial = primaryAdmin.name ? primaryAdmin.name.charAt(0).toUpperCase() : 'A';

  return (
    <View style={styles.card}>
      <View style={styles.leftContent}>
        <View style={styles.avatarContainer}>
          {primaryAdmin.profilePhotoUrl ? (
            <Image 
              source={{ uri: primaryAdmin.profilePhotoUrl }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={[styles.avatar, styles.initialsAvatar]}>
              <Typography variant="headingSm" style={styles.initialsText}>{initial}</Typography>
            </View>
          )}
        </View>
        
        <View style={styles.info}>
          <Typography style={styles.roleLabel}>Primary Company Admin</Typography>
          <View style={styles.nameRow}>
            <Typography style={styles.name}>{primaryAdmin.name}</Typography>
            <View style={styles.primaryBadge}>
              <Typography style={styles.primaryBadgeText}>Primary</Typography>
            </View>
          </View>
          
          <View style={styles.contactRow}>
            <Feather name="user" size={12} color={theme.colors.textSecondary} />
            <Typography style={styles.contactText}>Super Admin</Typography>
          </View>
          
          <View style={styles.contactRow}>
            <Feather name="phone" size={12} color={theme.colors.success} />
            <Typography style={styles.contactText}>{primaryAdmin.phone}</Typography>
          </View>
          
          <View style={styles.contactRow}>
            <Feather name="mail" size={12} color={theme.colors.success} />
            <Typography style={styles.contactText}>{primaryAdmin.email}</Typography>
          </View>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => {
            if (primaryAdmin?.phone) Linking.openURL(`tel:${primaryAdmin.phone}`);
            else if (Platform.OS === 'android') ToastAndroid.show('No phone number available', ToastAndroid.SHORT);
          }}
        >
          <View style={styles.actionIconBg}>
            <Feather name="phone" size={18} color={theme.colors.success} />
          </View>
          <Typography style={styles.actionLabel}>Call</Typography>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => {
            if (primaryAdmin?.email) Linking.openURL(`mailto:${primaryAdmin.email}`);
            else if (Platform.OS === 'android') ToastAndroid.show('No email available', ToastAndroid.SHORT);
          }}
        >
          <View style={styles.actionIconBg}>
            <Feather name="mail" size={18} color={theme.colors.success} />
          </View>
          <Typography style={styles.actionLabel}>Email</Typography>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => {
            if (Platform.OS === 'android') ToastAndroid.show('View Profile coming soon', ToastAndroid.SHORT);
            else Alert.alert('Coming Soon', 'View Profile coming soon');
          }}
        >
          <View style={styles.actionIconBg}>
            <Feather name="user" size={18} color={theme.colors.success} />
          </View>
          <Typography style={styles.actionLabel}>View Profile</Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 200,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initialsAvatar: {
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginRight: 8,
  },
  primaryBadge: {
    backgroundColor: theme.colors.successBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.success,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...theme.shadows.sm,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  }
});
