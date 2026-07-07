import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { ToastAndroid, Platform, Alert } from 'react-native';

interface CompanyQuickLinksProps {
  company: {
    id: string;
  };
}

export function CompanyQuickLinks({ company }: CompanyQuickLinksProps) {
  const links = [
    { icon: 'users' as const, title: 'View Workers', subtitle: 'Manage all workers' },
    { icon: 'grid' as const, title: 'QR Batches', subtitle: 'View all QR batches' },
    { icon: 'credit-card' as const, title: 'Payment Requests', subtitle: 'Pending & approved' },
    { icon: 'bar-chart-2' as const, title: 'Reports', subtitle: 'Company reports & logs' },
  ];

  return (
    <View style={styles.card}>
      <Typography style={styles.sectionTitle} variant="title">Quick Actions</Typography>
      
      {links.map((link, index) => (
        <React.Fragment key={index}>
          <TouchableOpacity 
            style={styles.linkRow}
            onPress={() => {
              if (Platform.OS === 'android') ToastAndroid.show(`${link.title} feature coming soon`, ToastAndroid.SHORT);
              else Alert.alert('Coming Soon', `${link.title} feature coming soon`);
            }}
          >
            <View style={styles.iconContainer}>
              <Feather name={link.icon} size={18} color={theme.colors.success} />
            </View>
            <View style={styles.textContainer}>
              <Typography style={styles.title}>{link.title}</Typography>
              <Typography style={styles.subtitle}>{link.subtitle}</Typography>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
          {index < links.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.successBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
  }
});
