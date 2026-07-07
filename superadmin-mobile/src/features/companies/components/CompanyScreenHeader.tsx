import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { ToastAndroid, Platform, Alert } from 'react-native';

interface CompanyScreenHeaderProps {
  totalCompanies: number;
}

export function CompanyScreenHeader({ totalCompanies }: CompanyScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <Typography variant="headingXl" style={styles.title}>Companies</Typography>
        <View style={styles.subtitleRow}>
          <View style={styles.greenDot} />
          <Typography variant="body" color="textSecondary" style={styles.subtitle}>
            {totalCompanies} Registered Companies
          </Typography>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {
            if (Platform.OS === 'android') ToastAndroid.show('Notifications coming soon', ToastAndroid.SHORT);
            else Alert.alert('Coming Soon', 'Notifications coming soon');
          }}
        >
          <View style={styles.notificationDot} />
          <Feather name="bell" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {
            if (Platform.OS === 'android') ToastAndroid.show('Use the search bar below', ToastAndroid.SHORT);
            else Alert.alert('Search', 'Use the search bar below');
          }}
        >
          <Feather name="search" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
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
    zIndex: 1,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
});
