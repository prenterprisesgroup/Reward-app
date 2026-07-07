import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';

const FILTERS = [
  { id: 'all', label: 'All', color: 'transparent' },
  { id: 'active', label: 'Active', color: theme.colors.success },
  { id: 'inactive', label: 'Inactive', color: theme.colors.textTertiary },
  { id: 'pending', label: 'Pending Verification', color: theme.colors.warning },
];

interface CompanyFilterPillsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function CompanyFilterPills({ activeFilter, onFilterChange }: CompanyFilterPillsProps) {

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <TouchableOpacity 
              key={filter.id}
              style={[
                styles.pill,
                isActive ? styles.activePill : null
              ]}
              onPress={() => onFilterChange(filter.id)}
            >
              {filter.id !== 'all' && (
                <View style={[styles.dot, { backgroundColor: filter.color }]} />
              )}
              <Typography 
                style={[
                  styles.label,
                  isActive ? styles.activeLabel : null
                ]}
              >
                {filter.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
        
        <TouchableOpacity 
          style={styles.sortPill}
          onPress={() => {
            import('react-native').then(({ ToastAndroid, Platform, Alert }) => {
              if (Platform.OS === 'android') ToastAndroid.show('Sorting coming soon', ToastAndroid.SHORT);
              else Alert.alert('Coming Soon', 'Sorting coming soon');
            });
          }}
        >
          <Feather name="calendar" size={14} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
          <Typography style={styles.sortLabel}>Newest</Typography>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  activePill: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeLabel: {
    color: theme.colors.surface,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginLeft: 4,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  }
});
