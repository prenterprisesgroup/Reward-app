import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { ToastAndroid, Platform, Alert } from 'react-native';

import { CompanyStatus } from '../types/company.types';

interface CompanyCardProps {
  id: string;
  name: string;
  displayId: string;
  industry: string;
  adminName: string;
  workersCount: string;
  qrBatches: string;
  rewardsDistributed: string;
  status: CompanyStatus;
  logoUrl?: string;
  onView?: () => void;
  onEdit?: () => void;
  onAction?: () => void; // Suspend / Approve / Activate depending on status
}

export const CompanyCard = memo(function CompanyCard({
  name,
  displayId,
  industry,
  adminName,
  workersCount,
  qrBatches,
  rewardsDistributed,
  status,
  logoUrl,
  onView,
  onEdit,
  onAction,
}: CompanyCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'ACTIVE': return theme.colors.success;
      case 'PENDING': return theme.colors.warning;
      case 'SUSPENDED': return theme.colors.error;
      case 'REJECTED': return theme.colors.textSecondary;
    }
  };

  const getStatusBgColor = () => {
    switch (status) {
      case 'ACTIVE': return theme.colors.successBackground;
      case 'PENDING': return theme.colors.warningBackground;
      case 'SUSPENDED': return theme.colors.error + '15';
      case 'REJECTED': return theme.colors.disabledSurface;
    }
  };

  const getActionIcon = () => {
    switch (status) {
      case 'ACTIVE': return { name: 'pause' as const, color: theme.colors.error, label: 'Suspend' };
      case 'PENDING': return { name: 'check' as const, color: theme.colors.success, label: 'Approve' };
      case 'SUSPENDED': return { name: 'play' as const, color: theme.colors.success, label: 'Activate' };
      case 'REJECTED': return { name: 'x' as const, color: theme.colors.textSecondary, label: 'Rejected' };
    }
  };

  const actionDetails = getActionIcon();

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8} 
      onPress={onView}
      accessibilityRole="button"
      accessibilityLabel={`View details for company ${name}`}
      accessibilityHint="Navigates to the company details screen"
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} />
          ) : (
            <Typography variant="title" color="primaryDark">
              {name.substring(0, 2).toUpperCase()}
            </Typography>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Typography style={styles.companyName} numberOfLines={1}>{name}</Typography>
            {status === 'ACTIVE' && (
              <MaterialIcons name="verified" size={16} color={theme.colors.success} style={{ marginLeft: 4 }} />
            )}
            {status === 'PENDING' && (
              <MaterialIcons name="pending" size={16} color={theme.colors.warning} style={{ marginLeft: 4 }} />
            )}
            {status === 'SUSPENDED' && (
              <MaterialIcons name="cancel" size={16} color={theme.colors.error} style={{ marginLeft: 4 }} />
            )}
          </View>
          
          <View style={styles.badgeRow}>
            <Typography style={styles.idText}>ID: {displayId}</Typography>
            <View style={styles.industryBadge}>
              <Typography style={styles.industryText}>{industry}</Typography>
            </View>
          </View>

          <View style={styles.adminRow}>
            <Feather name="user" size={12} color={theme.colors.textSecondary} />
            <View style={{ marginLeft: 6 }}>
              <Typography style={styles.adminName}>{adminName}</Typography>
              <Typography style={styles.adminLabel}>Admin</Typography>
            </View>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor() }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Typography style={[styles.statusText, { color: getStatusColor() }]}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </Typography>
          </View>
          <TouchableOpacity 
            style={styles.moreButton}
            accessibilityRole="button"
            accessibilityLabel="More options"
            onPress={() => {
              if (Platform.OS === 'android') ToastAndroid.show('More options coming soon', ToastAndroid.SHORT);
              else Alert.alert('Coming Soon', 'More options coming soon');
            }}
          >
            <Feather name="more-vertical" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Typography style={styles.statLabel}>Workers</Typography>
            <Typography style={styles.statValue}>{workersCount}</Typography>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.statItem}>
            <Typography style={styles.statLabel}>QR Batches</Typography>
            <Typography style={styles.statValue}>{qrBatches}</Typography>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.statItem}>
            <Typography style={styles.statLabel}>Rewards Distributed</Typography>
            <Typography style={styles.statValue}>{rewardsDistributed}</Typography>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={onView}
            accessibilityRole="button"
            accessibilityLabel="View company details"
          >
            <View style={[styles.actionIconBg, { borderColor: theme.colors.textSecondary }]}>
              <Feather name="eye" size={14} color={theme.colors.textSecondary} />
            </View>
            <Typography style={styles.actionLabel}>View</Typography>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit company details"
          >
            <View style={[styles.actionIconBg, { borderColor: theme.colors.primaryDark }]}>
              <Feather name="edit-2" size={14} color={theme.colors.primaryDark} />
            </View>
            <Typography style={styles.actionLabel}>Edit</Typography>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={`${actionDetails.label} company`}
          >
            <View style={[styles.actionIconBg, { borderColor: actionDetails.color }]}>
              <Feather name={actionDetails.name} size={14} color={actionDetails.color} />
            </View>
            <Typography style={styles.actionLabel}>{actionDetails.label}</Typography>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  idText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  industryBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  industryText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  adminLabel: {
    fontSize: 10,
    color: theme.colors.textTertiary,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  moreButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 16,
  },
  footer: {
    flexDirection: 'column',
    gap: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statItem: {
    alignItems: 'flex-start',
    flex: 1, // Allow stats to distribute evenly
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.borderLight,
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14, // Slightly smaller to prevent text breaking
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background, // Subtle separator for actions
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  }
});
