import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Image } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Typography } from '../../components/common/Typography';
import { theme } from '../../constants/theme';
import { Card } from '../../components/cards/Card';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function CompanyDetailsMockup() {
  const { width } = useWindowDimensions();
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  return (
    <ScreenWrapper backgroundColor={theme.colors.background} safeAreaEdges={['top', 'left', 'right', 'bottom']} paddingHorizontal={0}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Typography variant="headingLg" weight="bold" color="textPrimary">Company Details</Typography>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.textPrimary} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HERO CARD */}
        <Animated.View entering={FadeInUp.duration(400).springify()}>
          <Card variant="elevated" style={styles.section}>
            <View style={styles.heroTop}>
              <View style={styles.logoBox}>
                <Typography variant="headingXl" weight="bold" color="primaryDark">PR</Typography>
                <Typography variant="overline" weight="bold" color="primaryDark">ENTERPRISES</Typography>
              </View>
              <View style={styles.heroTopRight}>
                <View style={styles.heroNameRow}>
                  <Typography variant="headingMd" weight="bold" style={{ marginRight: theme.spacing.sm }}>PR Enterprises</Typography>
                  <View style={styles.verifiedPill}>
                    <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} style={{ marginRight: 4 }} />
                    <Typography variant="caption" color="success" weight="semiBold">Verified Company</Typography>
                  </View>
                </View>
                <Typography variant="bodySmall" color="textSecondary">ID: CMP-1024</Typography>
              </View>
            </View>

            <View style={styles.heroBottomRow}>
              <View style={styles.heroBottomCol}>
                <Ionicons name="business-outline" size={18} color={theme.colors.primaryDark} style={styles.heroBottomIcon} />
                <View>
                  <Typography variant="caption" color="textSecondary">Industry</Typography>
                  <Typography variant="bodySmall" weight="bold">Construction</Typography>
                </View>
              </View>
              <View style={styles.heroBottomCol}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primaryDark} style={styles.heroBottomIcon} />
                <View>
                  <Typography variant="caption" color="textSecondary">Registered Since</Typography>
                  <Typography variant="bodySmall" weight="bold">18 May 2025</Typography>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: theme.colors.successBackground }]}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                <Typography variant="caption" color="success" weight="bold">Active</Typography>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* STATS GRID */}
        <Animated.View entering={FadeInUp.delay(100).duration(400).springify()} style={styles.statsGrid}>
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="people-outline" size={20} color={theme.colors.primaryDark} />
            </View>
            <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>Company Admins</Typography>
            <Typography variant="headingMd" weight="bold" style={{ marginVertical: 4 }}>3</Typography>
            <Typography variant="caption" color="textTertiary">Total Admins</Typography>
          </Card>
          
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="people" size={20} color={theme.colors.primaryDark} />
            </View>
            <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>Active Workers</Typography>
            <Typography variant="headingMd" weight="bold" style={{ marginVertical: 4 }}>2,845</Typography>
            <Typography variant="caption" color="textTertiary">Currently Active</Typography>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="qr-code-outline" size={20} color={theme.colors.primaryDark} />
            </View>
            <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>QR Reward Batches</Typography>
            <Typography variant="headingMd" weight="bold" style={{ marginVertical: 4 }}>128</Typography>
            <Typography variant="caption" color="textTertiary">Total Batches</Typography>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="gift-outline" size={20} color={theme.colors.primaryDark} />
            </View>
            <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>Rewards Distributed</Typography>
            <Typography variant="headingMd" weight="bold" style={{ marginVertical: 4 }}>₹18.60 L</Typography>
            <Typography variant="caption" color="textTertiary">Total Distributed</Typography>
          </Card>
        </Animated.View>

        {/* PRIMARY COMPANY ADMIN */}
        <Animated.View entering={FadeInUp.delay(200).duration(400).springify()}>
          <Card variant="elevated" style={styles.section}>
            <Typography variant="bodySmall" weight="bold" color="textPrimary" style={{ marginBottom: theme.spacing.md }}>Primary Company Admin</Typography>
            
            <View style={styles.adminRow}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.adminAvatar} />
              
              <View style={styles.adminInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Typography variant="body" weight="bold" style={{ marginRight: 8 }}>Rohit Sharma</Typography>
                  <View style={styles.primaryBadge}>
                    <Typography variant="caption" color="success" style={{ fontSize: 10 }}>Primary</Typography>
                  </View>
                </View>
                
                <View style={styles.adminMetaRow}>
                  <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
                  <Typography variant="caption" color="textSecondary" style={{ marginLeft: 6 }}>Super Admin</Typography>
                </View>
                <View style={styles.adminMetaRow}>
                  <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
                  <Typography variant="caption" color="textSecondary" style={{ marginLeft: 6 }}>+91 98765 43210</Typography>
                </View>
                <View style={styles.adminMetaRow}>
                  <Ionicons name="mail-outline" size={14} color={theme.colors.textSecondary} />
                  <Typography variant="caption" color="textSecondary" style={{ marginLeft: 6 }}>rohit.sharma@prenterprises.com</Typography>
                </View>
              </View>

              <View style={styles.adminActionsCol}>
                <TouchableOpacity style={styles.adminActionBtn}>
                  <Ionicons name="call-outline" size={20} color={theme.colors.primaryDark} />
                  <Typography variant="caption" style={{ fontSize: 10, marginTop: 4 }}>Call</Typography>
                </TouchableOpacity>
                <TouchableOpacity style={styles.adminActionBtn}>
                  <Ionicons name="mail-outline" size={20} color={theme.colors.primaryDark} />
                  <Typography variant="caption" style={{ fontSize: 10, marginTop: 4 }}>Email</Typography>
                </TouchableOpacity>
                <TouchableOpacity style={styles.adminActionBtn}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.primaryDark} />
                  <Typography variant="caption" style={{ fontSize: 10, marginTop: 4, textAlign: 'center' }}>View Profile</Typography>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* TWO COLUMN SECTION */}
        <Animated.View entering={FadeInUp.delay(300).duration(400).springify()} style={styles.twoColumnContainer}>
          {/* RECENT ACTIVITY */}
          <Card variant="elevated" style={styles.halfCard}>
            <View style={styles.sectionHeaderBetween}>
              <Typography variant="bodySmall" weight="bold">Recent Activity</Typography>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Typography variant="caption" color="success" weight="bold">View All</Typography>
                <Ionicons name="chevron-forward" size={12} color={theme.colors.success} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timelineItem}>
              <View style={styles.timelineLine} />
              <View style={styles.timelineDot} />
              <View style={styles.timelineIconBox}>
                <Ionicons name="qr-code-outline" size={14} color={theme.colors.primaryDark} />
              </View>
              <View style={styles.timelineContent}>
                <Typography variant="caption" weight="bold">Latest QR Batch Generated</Typography>
                <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>Batch "PR-QR-128" generated</Typography>
                <Typography variant="caption" color="textTertiary" style={{ fontSize: 10 }}>Today, 10:30 AM</Typography>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineLine} />
              <View style={styles.timelineDot} />
              <View style={styles.timelineIconBox}>
                <Ionicons name="gift-outline" size={14} color={theme.colors.primaryDark} />
              </View>
              <View style={styles.timelineContent}>
                <Typography variant="caption" weight="bold">Latest Reward Distribution</Typography>
                <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>₹2,45,000 distributed to 312 workers</Typography>
                <Typography variant="caption" color="textTertiary" style={{ fontSize: 10 }}>Yesterday, 04:15 PM</Typography>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineLine} />
              <View style={styles.timelineDot} />
              <View style={styles.timelineIconBox}>
                <Ionicons name="wallet-outline" size={14} color={theme.colors.primaryDark} />
              </View>
              <View style={styles.timelineContent}>
                <Typography variant="caption" weight="bold">Latest Withdrawal Approval</Typography>
                <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>₹1,80,000 approved for withdrawal</Typography>
                <Typography variant="caption" color="textTertiary" style={{ fontSize: 10 }}>Yesterday, 11:20 AM</Typography>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineIconBox}>
                <Ionicons name="person-add-outline" size={14} color={theme.colors.primaryDark} />
              </View>
              <View style={styles.timelineContent}>
                <Typography variant="caption" weight="bold">New Worker Registered</Typography>
                <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>45 new workers added</Typography>
                <Typography variant="caption" color="textTertiary" style={{ fontSize: 10 }}>17 May 2025, 03:40 PM</Typography>
              </View>
            </View>
          </Card>

          {/* QUICK ACTIONS */}
          <Card variant="elevated" style={styles.halfCard}>
            <Typography variant="bodySmall" weight="bold" style={{ marginBottom: theme.spacing.md }}>Quick Actions</Typography>
            
            <TouchableOpacity style={styles.quickActionBtn}>
              <View style={styles.quickActionIconBox}>
                <Ionicons name="people-outline" size={18} color={theme.colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="caption" weight="bold">View Workers</Typography>
                <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>Manage all workers</Typography>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionBtn}>
              <View style={styles.quickActionIconBox}>
                <Ionicons name="qr-code-outline" size={18} color={theme.colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="caption" weight="bold">QR Batches</Typography>
                <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>View all QR batches</Typography>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionBtn}>
              <View style={styles.quickActionIconBox}>
                <Ionicons name="wallet-outline" size={18} color={theme.colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="caption" weight="bold">Payment Requests</Typography>
                <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>Pending & approved</Typography>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickActionBtn, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <View style={styles.quickActionIconBox}>
                <Ionicons name="bar-chart-outline" size={18} color={theme.colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="caption" weight="bold">Reports</Typography>
                <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>Company reports & logs</Typography>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* COMPANY INFORMATION */}
        <Animated.View entering={FadeInUp.delay(400).duration(400).springify()}>
          <Card variant="elevated" style={styles.section}>
            <Typography variant="bodySmall" weight="bold" style={{ marginBottom: theme.spacing.md }}>Company Information</Typography>
            <View style={styles.infoGrid}>
              <View style={styles.infoCol}>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color={theme.colors.primaryDark} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="caption" color="textSecondary">Registered Address</Typography>
                    <Typography variant="caption" weight="bold">123, Industrial Area, Sector 5,{'\n'}Gurugram, Haryana - 122001</Typography>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="document-text-outline" size={18} color={theme.colors.primaryDark} style={{ marginRight: 8 }} />
                  <View>
                    <Typography variant="caption" color="textSecondary">GST Number</Typography>
                    <Typography variant="caption" weight="bold">06ABCDE1234F1Z5</Typography>
                  </View>
                </View>
                <View style={[styles.infoRow, { marginBottom: 0 }]}>
                  <Ionicons name="call-outline" size={18} color={theme.colors.primaryDark} style={{ marginRight: 8 }} />
                  <View>
                    <Typography variant="caption" color="textSecondary">Primary Contact</Typography>
                    <Typography variant="caption" weight="bold">+91 98765 43210</Typography>
                  </View>
                </View>
              </View>

              <View style={styles.infoCol}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="bank-outline" size={18} color={theme.colors.primaryDark} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="caption" color="textSecondary">Settlement Method</Typography>
                    <Typography variant="caption" weight="bold">Automatic Settlement (Daily)</Typography>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={18} color={theme.colors.primaryDark} style={{ marginRight: 8 }} />
                  <View>
                    <Typography variant="caption" color="textSecondary">Created Date</Typography>
                    <Typography variant="caption" weight="bold">18 May 2025, 09:30 AM</Typography>
                  </View>
                </View>
                <View style={[styles.infoRow, { marginBottom: 0 }]}>
                  <Ionicons name="time-outline" size={18} color={theme.colors.primaryDark} style={{ marginRight: 8 }} />
                  <View>
                    <Typography variant="caption" color="textSecondary">Last Updated</Typography>
                    <Typography variant="caption" weight="bold">17 May 2025, 04:15 PM</Typography>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* ADMIN ACTIONS */}
        <Animated.View entering={FadeInUp.delay(500).duration(400).springify()}>
          <Typography variant="bodySmall" weight="bold" style={{ marginBottom: theme.spacing.sm }}>Admin Actions</Typography>
          <View style={styles.adminActionsGrid}>
            <TouchableOpacity style={styles.actionPill}>
              <Ionicons name="pencil-outline" size={18} color={theme.colors.primaryDark} style={{ marginRight: 8 }} />
              <View>
                <Typography variant="caption" weight="bold" color="primaryDark">Edit Company</Typography>
                <Typography variant="caption" color="textSecondary" style={{ fontSize: 9 }}>Update details</Typography>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionPill, { backgroundColor: '#FFF4E5' }]}>
              <Ionicons name="pause-circle-outline" size={18} color="#FF9500" style={{ marginRight: 8 }} />
              <View>
                <Typography variant="caption" weight="bold" style={{ color: '#FF9500' }}>Suspend Company</Typography>
                <Typography variant="caption" color="textSecondary" style={{ fontSize: 9 }}>Temporarily suspend</Typography>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionPill, { backgroundColor: theme.colors.errorBackground }]}>
              <Ionicons name="person-remove-outline" size={18} color={theme.colors.error} style={{ marginRight: 8 }} />
              <View>
                <Typography variant="caption" weight="bold" color="error">Deactivate Company</Typography>
                <Typography variant="caption" color="textSecondary" style={{ fontSize: 9 }}>Deactivate access</Typography>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionPill, { backgroundColor: theme.colors.errorBackground }]}>
              <Ionicons name="trash-outline" size={18} color={theme.colors.error} style={{ marginRight: 8 }} />
              <View>
                <Typography variant="caption" weight="bold" color="error">Delete Company</Typography>
                <Typography variant="caption" color="textSecondary" style={{ fontSize: 9 }}>*Only if no active workers</Typography>
              </View>
            </TouchableOpacity>
          </View>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
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
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoBox: {
    width: 72,
    height: 72,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  heroTopRight: {
    flex: 1,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.md,
  },
  heroBottomCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroBottomIcon: {
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: theme.spacing.md,
    borderRadius: 16,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryLight + '40', // light transparent
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: theme.spacing.md,
  },
  adminInfo: {
    flex: 1,
  },
  primaryBadge: {
    backgroundColor: theme.colors.successBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  adminMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  adminActionsCol: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  adminActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  halfCard: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: 20,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    bottom: -16,
    width: 1.5,
    backgroundColor: theme.colors.borderLight,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primaryDark,
    position: 'absolute',
    left: -12,
    top: 8,
    zIndex: 1,
  },
  timelineIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: theme.colors.primaryLight + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  timelineContent: {
    flex: 1,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    marginBottom: theme.spacing.sm,
  },
  quickActionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryLight + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  infoCol: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  adminActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight + '40',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    width: '48%',
  }
});
