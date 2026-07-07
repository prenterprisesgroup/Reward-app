import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather, MaterialIcons } from '@expo/vector-icons';

interface CompanySummaryCardProps {
  company: {
    name: string;
    displayId: string;
    industry: string;
    status: string;
    createdAt: string;
  };
  verification: {
    isVerified: boolean;
  };
}

export function CompanySummaryCard({ company, verification }: CompanySummaryCardProps) {
  const getStatusColor = () => {
    switch(company.status) {
      case 'ACTIVE': return theme.colors.success;
      case 'PENDING': return theme.colors.warning;
      case 'SUSPENDED': return theme.colors.error;
      case 'REJECTED': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusBackground = () => {
    switch(company.status) {
      case 'ACTIVE': return theme.colors.successBackground;
      case 'PENDING': return theme.colors.warningBackground;
      case 'SUSPENDED': return theme.colors.errorBackground;
      case 'REJECTED': return theme.colors.errorBackground;
      default: return theme.colors.background;
    }
  };

  const initials = company.name.substring(0, 2).toUpperCase();
  const registeredDate = new Date(company.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Typography variant="headingXl" color="primaryDark">{initials}</Typography>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Typography style={styles.companyName} numberOfLines={1}>{company.name}</Typography>
            {verification?.isVerified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={14} color={theme.colors.success} style={{ marginRight: 4 }} />
                <Typography style={styles.verifiedText}>Verified Company</Typography>
              </View>
            )}
          </View>
          <Typography style={styles.idText}>ID: {company.displayId}</Typography>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomSection}>
        <View style={styles.infoBlock}>
          <Feather name="file-text" size={16} color={theme.colors.success} style={styles.icon} />
          <View>
            <Typography style={styles.label}>Industry</Typography>
            <Typography style={styles.value}>{company.industry}</Typography>
          </View>
        </View>
        
        <View style={styles.infoBlock}>
          <Feather name="calendar" size={16} color={theme.colors.success} style={styles.icon} />
          <View>
            <Typography style={styles.label}>Registered Since</Typography>
            <Typography style={styles.value}>{registeredDate}</Typography>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusBackground() }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Typography style={[styles.statusText, { color: getStatusColor() }]}>{company.status}</Typography>
        </View>
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
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoSubText: {
    fontSize: 8,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    marginTop: 2,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
    gap: 8,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.success,
  },
  idText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 16,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 10,
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.success,
  },
});
