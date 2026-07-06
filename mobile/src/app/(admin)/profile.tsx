import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Typography } from '../../components/common/Typography';
import { theme } from '../../constants/theme';
import { Card } from '../../components/cards/Card';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

// ----------------------------------------------------------------------
// TYPES & MOCK DATA
// ----------------------------------------------------------------------
import { useCompanyProfileQuery } from '../../hooks/useCompanyProfile';
import { ActivityIndicator } from 'react-native';

// ----------------------------------------------------------------------
// REUSABLE COMPONENTS
// ----------------------------------------------------------------------

const InfoRow = React.memo(({ icon, title, value, isLast = false, valueColor = 'textPrimary' }: { icon: any, title: string, value: string, isLast?: boolean, valueColor?: keyof typeof theme.colors }) => (
  <View style={styles.infoRowContainer}>
    <View style={styles.infoRowContent}>
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon} size={18} color={theme.colors.textSecondary} style={{ marginRight: theme.spacing.sm }} />
        <Typography variant="bodySmall" color="textSecondary">{title}</Typography>
      </View>
      <View style={styles.infoRowRight}>
        <Typography variant="bodySmall" color={valueColor} weight="semiBold" style={{ textAlign: 'right', flexShrink: 1 }}>
          {value}
        </Typography>
      </View>
    </View>
    {!isLast && <View style={styles.divider} />}
  </View>
));
InfoRow.displayName = 'InfoRow';

const SettingsRow = React.memo(({ icon, title, rightText, isDanger = false, isLast = false }: { icon: any, title: string, rightText?: string, isDanger?: boolean, isLast?: boolean }) => (
  <TouchableOpacity style={styles.settingsRowContainer} activeOpacity={0.7}>
    <View style={styles.settingsRowContent}>
      <View style={styles.settingsRowLeft}>
        <Ionicons name={icon} size={20} color={isDanger ? theme.colors.error : theme.colors.primaryDark} style={{ marginRight: theme.spacing.md }} />
        <Typography variant="body" color={isDanger ? 'error' : 'textPrimary'} weight={isDanger ? 'semiBold' : 'medium'}>{title}</Typography>
      </View>
      <View style={styles.settingsRowRight}>
        {rightText && (
          <Typography variant="bodySmall" color="textSecondary" style={{ marginRight: theme.spacing.sm }}>
            {rightText}
          </Typography>
        )}
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
      </View>
    </View>
    {!isLast && <View style={styles.divider} />}
  </TouchableOpacity>
));
SettingsRow.displayName = 'SettingsRow';

const SupportCard = React.memo(({ icon, title, subtitle, width }: { icon: any, title: string, subtitle: string, width: number }) => (
  <TouchableOpacity activeOpacity={0.7} style={[styles.supportCard, { width }]}>
    <Ionicons name={icon} size={24} color={theme.colors.primaryDark} style={{ marginBottom: theme.spacing.sm }} />
    <Typography variant="bodySmall" weight="bold" color="textPrimary">{title}</Typography>
    <Typography variant="caption" color="textSecondary" style={{ marginTop: 2 }}>{subtitle}</Typography>
  </TouchableOpacity>
));
SupportCard.displayName = 'SupportCard';

// ----------------------------------------------------------------------
// MAIN SCREEN
// ----------------------------------------------------------------------

export default function AdminProfileScreen() {
  const { width } = useWindowDimensions();
  const { data: profile, isLoading, isError } = useCompanyProfileQuery();

  // Calculate support card width (3 equal cards with gap)
  const paddingHorizontal = theme.spacing.lg * 2;
  const gap = theme.spacing.sm * 2;
  const supportCardWidth = (width - paddingHorizontal - gap) / 3;

  const supportCardWidth = (width - paddingHorizontal - gap) / 3;

  if (isLoading) {
    return (
      <ScreenWrapper backgroundColor={theme.colors.background} safeAreaEdges={['top', 'left', 'right', 'bottom']} paddingHorizontal={0}>
        <View style={styles.header}>
          <View style={{ width: 40 }} /> 
          <Typography variant="headingLg" weight="bold" color="textPrimary">Company Profile</Typography>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primaryDark} />
        </View>
      </ScreenWrapper>
    );
  }

  if (isError || !profile) {
    return (
      <ScreenWrapper backgroundColor={theme.colors.background} safeAreaEdges={['top', 'left', 'right', 'bottom']} paddingHorizontal={0}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="body" color="error">Failed to load company profile.</Typography>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={theme.colors.background} safeAreaEdges={['top', 'left', 'right', 'bottom']} paddingHorizontal={0}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ width: 40 }} /> 
        <Typography variant="headingLg" weight="bold" color="textPrimary">Company Profile</Typography>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.textPrimary} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SECTION 1: HERO CARD */}
        <Animated.View entering={FadeInUp.duration(400).springify()}>
          <Card variant="elevated" style={styles.section}>
            <View style={{ flexDirection: 'column' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoPlaceholder}>
                    <Typography variant="headingLg" weight="bold" color="primaryDark">PR</Typography>
                    <Typography variant="caption" weight="bold" color="primaryDark" style={{ fontSize: 7, letterSpacing: 0.5, flexShrink: 1 }} numberOfLines={1}>ENTERPRISES</Typography>
                  </View>
                </View>
                <TouchableOpacity style={styles.editBtn}>
                  <Ionicons name="pencil" size={14} color={theme.colors.primaryDark} style={{ marginRight: 4 }} />
                  <Typography variant="caption" weight="bold" color="primaryDark">Edit</Typography>
                </TouchableOpacity>
              </View>

              <View style={styles.heroNameRow}>
                <Typography variant="headingLg" weight="bold" color="textPrimary" style={{ marginRight: theme.spacing.sm, flexShrink: 1 }}>
                  {profile.companyName}
                </Typography>
                {profile.verified && (
                  <View style={styles.verifiedPill}>
                    <Ionicons name="checkmark-circle" size={12} color={theme.colors.success} style={{ marginRight: 4 }} />
                    <Typography variant="caption" color="success" numberOfLines={1}>Verified Company</Typography>
                  </View>
                )}
              </View>
              <Typography variant="bodySmall" color="textSecondary">
                Company ID: {profile.companyId}
              </Typography>
            </View>
          </Card>
        </Animated.View>

        {/* SECTION 2: COMPANY INFORMATION */}
        <Animated.View entering={FadeInUp.delay(100).duration(400).springify()}>
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business-outline" size={20} color={theme.colors.primaryDark} style={{ marginRight: theme.spacing.sm }} />
              <Typography variant="body" weight="bold" color="textPrimary">Company Information</Typography>
            </View>
            <InfoRow icon="mail-outline" title="Company Email" value={profile.email} />
            <InfoRow icon="call-outline" title="Company Phone" value={profile.phone} />
            <InfoRow icon="location-outline" title="Registered Address" value={profile.address} />
            <InfoRow icon="document-text-outline" title="GST Number" value={profile.gstNumber} />
            <InfoRow icon="calendar-outline" title="Created On" value={profile.createdAt} isLast />
          </Card>
        </Animated.View>

        {/* SECTION 3: PAYOUT SETTINGS */}
        <Animated.View entering={FadeInUp.delay(200).duration(400).springify()}>
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeaderBetween}>
              <View style={styles.sectionHeaderNoMargin}>
                <MaterialCommunityIcons name="bank-outline" size={20} color={theme.colors.primaryDark} style={{ marginRight: theme.spacing.sm }} />
                <Typography variant="body" weight="bold" color="textPrimary">Payout Settings</Typography>
              </View>
              <TouchableOpacity style={styles.editBtnSmall}>
                <Ionicons name="pencil-outline" size={12} color={theme.colors.primaryDark} style={{ marginRight: 4 }} />
                <Typography variant="caption" weight="semiBold" color="primaryDark">Edit</Typography>
              </TouchableOpacity>
            </View>
            <InfoRow icon="at" title="Primary UPI" value={profile.upiId} />
            <InfoRow icon="business-outline" title="Bank Account" value={profile.bankAccountMasked} />
            <InfoRow icon="cash-outline" title="Settlement Method" value={profile.settlementMethod} isLast />
          </Card>
        </Animated.View>

        {/* SECTION 4: ACCOUNT SETTINGS */}
        <Animated.View entering={FadeInUp.delay(300).duration(400).springify()}>
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings-outline" size={20} color={theme.colors.primaryDark} style={{ marginRight: theme.spacing.sm }} />
              <Typography variant="body" weight="bold" color="textPrimary">Account Settings</Typography>
            </View>
            <SettingsRow icon="notifications-outline" title="Notifications" />
            <SettingsRow icon="globe-outline" title="Language" rightText={profile.language} />
            <SettingsRow icon="shield-checkmark-outline" title="Security" />
            <SettingsRow icon="lock-closed-outline" title="Privacy" />
            <SettingsRow icon="help-circle-outline" title="Help & Support" />
            <SettingsRow icon="document-text-outline" title="Terms & Conditions" isLast />
          </Card>
        </Animated.View>

        {/* SECTION 5: SUPPORT */}
        <Animated.View entering={FadeInUp.delay(400).duration(400).springify()}>
          <View style={styles.supportContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="headset-outline" size={20} color={theme.colors.primaryDark} style={{ marginRight: theme.spacing.sm }} />
              <Typography variant="body" weight="bold" color="textPrimary">Support</Typography>
            </View>
            <View style={styles.supportCardsRow}>
              <SupportCard icon="call-outline" title="Contact Support" subtitle="Talk to our team" width={supportCardWidth} />
              <SupportCard icon="ticket-outline" title="Raise a Ticket" subtitle="Get help quickly" width={supportCardWidth} />
              <SupportCard icon="help-circle-outline" title="FAQs" subtitle="Find answers" width={supportCardWidth} />
            </View>
          </View>
        </Animated.View>

        {/* SECTION 6: DANGER ZONE */}
        <Animated.View entering={FadeInUp.delay(500).duration(400).springify()}>
          <Card variant="flat" style={styles.dangerSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-outline" size={20} color={theme.colors.error} style={{ marginRight: theme.spacing.sm }} />
              <Typography variant="body" weight="bold" color="error">Danger Zone</Typography>
            </View>
            <View style={styles.dangerRow}>
              <TouchableOpacity style={styles.dangerActionBtn} activeOpacity={0.7}>
                <Ionicons name="log-out-outline" size={20} color={theme.colors.error} style={{ marginRight: theme.spacing.sm }} />
                <View style={styles.dangerActionText}>
                  <Typography variant="bodySmall" weight="bold" color="error">Logout</Typography>
                  <Typography variant="caption" style={styles.dangerSubtitle}>Sign out from this account</Typography>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>

        <View style={{ height: theme.spacing['4xl'] }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    borderWidth: 1.5,
    borderColor: theme.colors.surface,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
    paddingTop: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionHeaderNoMargin: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  heroContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 64,
    height: 64,
    marginRight: theme.spacing.md,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadgeIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 2,
  },
  heroInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
    alignSelf: 'center',
  },
  editBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryLight,
  },
  infoRowContainer: {
    marginBottom: theme.spacing.md,
  },
  infoRowContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  infoRowRight: {
    flex: 1.5,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginTop: theme.spacing.md,
  },
  settingsRowContainer: {
    marginBottom: theme.spacing.md,
  },
  settingsRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportContainer: {
    marginBottom: theme.spacing.lg,
  },
  supportCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 20,
    alignItems: 'flex-start',
    ...theme.shadows.sm,
  },
  dangerSection: {
    backgroundColor: theme.colors.errorBackground,
    padding: theme.spacing.lg,
    borderRadius: 24,
    borderWidth: 0,
    marginBottom: theme.spacing.xl,
  },
  dangerRow: {
    flexDirection: 'column',
    gap: theme.spacing.md,
  },
  dangerActionBtn: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  dangerActionText: {
    flex: 1,
  },
  dangerSubtitle: {
    color: theme.colors.error, 
    opacity: 0.8,
    marginTop: 2,
    fontSize: 10,
  }
});
