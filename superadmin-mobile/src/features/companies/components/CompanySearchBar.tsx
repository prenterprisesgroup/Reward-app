import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';

export function CompanySearchBar() {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={theme.colors.textTertiary} style={styles.searchIcon} />
        <TextInput 
          style={styles.input}
          placeholder="Search company name, ID or industry..."
          placeholderTextColor={theme.colors.textTertiary}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="sliders" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 30, // Fully rounded like the design
    paddingHorizontal: theme.spacing.md,
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  filterButton: {
    padding: 8,
  }
});
