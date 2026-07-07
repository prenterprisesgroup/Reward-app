import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../components/common/Typography';
import { Card } from '../../components/cards/Card';
import { ArrowLeft, Bell, ChevronRight, Edit2, Phone, Mail, Building, Calendar, Shield, CreditCard, LogOut, Settings, Globe, Lock, HelpCircle, Info, FileText, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BottomNavigation } from '../../components/navigation/BottomNavigation';
import { theme } from '../../constants/theme';
import { useUserQuery } from '../../hooks/useUserQuery';
import { useAuthStore } from '../../store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';

const SettingRow = React.memo(({ icon: Icon, title, value, onPress, isDestructive = false }: any) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
    <View style={styles.settingRowLeft}>
      {Icon && <Icon size={20} color={isDestructive ? theme.colors.error : theme.colors.primary} style={styles.settingIcon} />}
      <Typography style={[styles.settingTitle, isDestructive && styles.destructiveText]}>{title}</Typography>
    </View>
    <View style={[styles.settingRowRight, { flexShrink: 1, paddingLeft: 16 }]}>
      {value && <Typography style={styles.settingValue} numberOfLines={1} ellipsizeMode="tail">{value}</Typography>}
      <ChevronRight size={20} color={isDestructive ? theme.colors.error : theme.colors.textTertiary} />
    </View>
  </TouchableOpacity>
));

const HelpCard = React.memo(({ icon: Icon, title, onPress }: any) => (
  <TouchableOpacity style={styles.helpCard} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.helpCardContent}>
      <Icon size={20} color={theme.colors.primary} />
      <Typography style={styles.helpCardTitle}>{title}</Typography>
      <ChevronRight size={16} color={theme.colors.textTertiary} />
    </View>
  </TouchableOpacity>
));

export default function ProfileScreen() {
  const router = useRouter();
  const { data, isLoading } = useUserQuery();
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallScreen = width <= 360;
  
  const user = data?.user;

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      queryClient.clear();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  }, [logout, queryClient, router]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return 'N/A';
    return new Date(user.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }, [user?.createdAt]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Typography style={styles.title}>My Profile</Typography>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Typography>Error loading profile.</Typography>
        </View>
      </SafeAreaView>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ width: 44 }} />
        <Typography style={styles.title}>My Profile</Typography>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(worker)/notifications')}>
          <Bell size={20} color={theme.colors.textPrimary} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 20, 32) }]} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* PROFILE HEADER CARD */}
        <Card style={styles.profileHeaderCard}>
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarContainer}>
              {user.profilePhotoUrl ? (
                <Image source={{ uri: user.profilePhotoUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Typography style={styles.avatarFallbackText}>{getInitials(user.name)}</Typography>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Edit2 size={12} color="#FFF" />
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Typography style={styles.profileName} numberOfLines={1}>{user.name}</Typography>
              <View style={styles.badgesRow}>
                <View style={styles.workerIdBadge}>
                  <Typography style={styles.workerIdText}>Worker ID: WR-10248</Typography> 
                  {/* using static fallback as per instructions if unavailable, WR-10248 from design */}
                </View>
              </View>
              <View style={styles.verifiedBadge}>
                <Shield size={12} color={theme.colors.primary} />
                <Typography style={styles.verifiedText}>Verified Worker</Typography>
              </View>
            </View>

            <TouchableOpacity style={styles.editProfileBtn} onPress={() => router.push('/(worker)/edit-profile')}>
              <Edit2 size={14} color={theme.colors.primary} style={!isSmallScreen && { marginRight: 6 }} />
              {!isSmallScreen && <Typography style={styles.editProfileBtnText}>Edit Profile</Typography>}
            </TouchableOpacity>
          </View>
          
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png' }} style={styles.leafDecoration} style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, opacity: 0.1, transform: [{ rotate: '45deg' }] }} />
        </Card>

        {/* ACCOUNT INFORMATION */}
        <Typography style={styles.sectionHeader}>
          <Building size={18} color={theme.colors.primary} style={{ marginRight: 8 }} /> Account Information
        </Typography>
        <Card style={styles.sectionCard}>
          <SettingRow icon={Phone} title="Phone Number" value={`+91 ${user.phone}`} />
          <SettingRow icon={Mail} title="Email Address" value={user.email || 'Not added'} />
          <SettingRow icon={Building} title="Registered Company" value="2 Companies" />
          <SettingRow icon={Calendar} title="Member Since" value={memberSince} />
        </Card>

        {/* PAYMENT INFORMATION */}
        <Typography style={styles.sectionHeader}>
          <CreditCard size={18} color={theme.colors.primary} style={{ marginRight: 8 }} /> Payment Information
        </Typography>
        <Card style={styles.paymentCard}>
          <View style={styles.paymentCardInner}>
            <View style={styles.upiLogoContainer}>
              <Typography style={styles.upiLogoText}>UPI</Typography>
            </View>
            <View style={[styles.upiInfo, { flexShrink: 1, paddingRight: 12 }]}>
              <Typography style={styles.upiLabel}>Registered UPI</Typography>
              <Typography style={styles.upiValue} numberOfLines={1} ellipsizeMode="middle">{user.upiId || 'Not linked'}</Typography>
              <View style={styles.verifiedBadgeRow}>
                <Shield size={12} color={theme.colors.primary} />
                <Typography style={styles.verifiedText}>Verified</Typography>
              </View>
            </View>
            <TouchableOpacity style={styles.changeUpiBtn} onPress={() => router.push('/(worker)/change-upi')}>
              {!isSmallScreen && <Typography style={styles.changeUpiBtnText}>Change UPI</Typography>}
              <ChevronRight size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* ACCOUNT SETTINGS */}
        <Typography style={styles.sectionHeader}>
          <Settings size={18} color={theme.colors.primary} style={{ marginRight: 8 }} /> Account Settings
        </Typography>
        <Card style={styles.sectionCard}>
          <SettingRow icon={Bell} title="Notifications" />
          <SettingRow icon={Globe} title="Language" />
          <SettingRow icon={Lock} title="Privacy" />
          <SettingRow icon={HelpCircle} title="Help & Support" />
          <SettingRow icon={Info} title="About App" />
          <SettingRow icon={FileText} title="Terms & Conditions" />
        </Card>

        {/* HELP SECTION */}
        <Typography style={styles.sectionHeader}>
          <HelpCircle size={18} color={theme.colors.primary} style={{ marginRight: 8 }} /> Need Help?
        </Typography>
        <View style={styles.helpCardsRow}>
          <HelpCard icon={MessageSquare} title="Contact Support" />
          <HelpCard icon={Phone} title="Call Support" />
          <HelpCard icon={HelpCircle} title="FAQs" />
        </View>

        {/* LOGOUT */}
        <Card style={[styles.sectionCard, styles.logoutCard]}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <View style={styles.logoutBtnLeft}>
              <LogOut size={24} color={theme.colors.error} style={{ marginRight: 16 }} />
              <View>
                <Typography style={styles.logoutTitle}>Logout</Typography>
                <Typography style={styles.logoutSubtitle}>Sign out from your account</Typography>
              </View>
            </View>
            <ChevronRight size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Unified Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  iconBtn: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm },
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
  notificationDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, borderWidth: 1.5, borderColor: '#FFF' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  
  profileHeaderCard: { padding: 20, marginBottom: 24, overflow: 'hidden', backgroundColor: '#FFF', borderRadius: 24, ...theme.shadows.md },
  profileHeaderContent: { flexDirection: 'row', alignItems: 'center', zIndex: 2 },
  avatarContainer: { position: 'relative', marginRight: 16 },
  avatarImage: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.surface },
  avatarFallback: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  avatarFallbackText: { fontSize: 24, fontWeight: '700', color: theme.colors.primary },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  badgesRow: { flexDirection: 'row', marginBottom: 6 },
  workerIdBadge: { backgroundColor: '#F1F3F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  workerIdText: { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  verifiedText: { fontSize: 11, fontWeight: '600', color: theme.colors.primary, marginLeft: 4 },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFF' },
  editProfileBtnText: { fontSize: 12, fontWeight: '600', color: theme.colors.primary },

  sectionHeader: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12, flexDirection: 'row', alignItems: 'center', marginLeft: 4 },
  sectionCard: { padding: 0, overflow: 'hidden', marginBottom: 24, borderRadius: 20, backgroundColor: '#FFF', ...theme.shadows.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
  settingRowLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { marginRight: 12 },
  settingTitle: { fontSize: 14, fontWeight: '500', color: theme.colors.textPrimary },
  settingRowRight: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { fontSize: 14, color: theme.colors.textSecondary, marginRight: 8, flexShrink: 1 },
  destructiveText: { color: theme.colors.error, fontWeight: '600' },

  paymentCard: { padding: 16, marginBottom: 24, borderRadius: 20, backgroundColor: '#FFF', ...theme.shadows.sm },
  paymentCardInner: { flexDirection: 'row', alignItems: 'center' },
  upiLogoContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  upiLogoText: { fontSize: 14, fontWeight: '800', color: '#666', fontStyle: 'italic' },
  upiInfo: { flex: 1 },
  upiLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 },
  upiValue: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 4 },
  verifiedBadgeRow: { flexDirection: 'row', alignItems: 'center' },

  changeUpiBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#F8F9FA' },
  changeUpiBtnText: { fontSize: 13, fontWeight: '600', color: theme.colors.textPrimary, marginRight: 4 },

  helpCardsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24, gap: 8 },
  helpCard: { minWidth: 105, flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 12, ...theme.shadows.sm },
  helpCardContent: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' },
  helpCardTitle: { fontSize: 12, fontWeight: '600', color: theme.colors.textPrimary, marginLeft: 6, marginRight: 4 },

  logoutCard: { backgroundColor: '#FFF0F0', borderColor: '#FFE0E0', borderWidth: 1 ,  marginBottom: 60},
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  logoutBtnLeft: { flexDirection: 'row', alignItems: 'center' },
  logoutTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.error, marginBottom: 2 },
  logoutSubtitle: { fontSize: 12, color: '#FF8A8A' }
});
