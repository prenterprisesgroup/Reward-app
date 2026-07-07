import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Search, Filter, X } from 'lucide-react-native';
import { theme } from '../../../constants/theme';
import { AuditFilters } from '../types/audit.types';

interface Props {
  filters: AuditFilters;
  onFiltersChange: (filters: AuditFilters) => void;
}

export const AuditFilterBar = ({ filters, onFiltersChange }: Props) => {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue || undefined });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, filters, onFiltersChange]);

  const activeFilterCount = Object.keys(filters).filter(k => k !== 'search' && filters[k as keyof AuditFilters] !== undefined).length;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={18} color={theme.colors.textSecondary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search actor, action, company..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchValue}
          onChangeText={setSearchValue}
          autoCapitalize="none"
        />
        {searchValue.length > 0 && (
          <TouchableOpacity onPress={() => setSearchValue('')}>
            <X size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity style={styles.filterBtn}>
        <Filter size={18} color={theme.colors.textSecondary} />
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    height: 44,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    height: '100%',
  },
  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
