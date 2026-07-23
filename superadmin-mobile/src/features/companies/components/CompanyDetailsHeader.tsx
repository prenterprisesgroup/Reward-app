import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CompanyActionSheet } from './CompanyActionSheet';

interface CompanyDetailsHeaderProps {
  company: {
    id: string;
    name: string;
    status: string;
  };
}

export function CompanyDetailsHeader({ company }: CompanyDetailsHeaderProps) {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.iconButton}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>
      
      <Typography style={styles.title} numberOfLines={1}>{company.name}</Typography>

      <TouchableOpacity 
        style={styles.iconButton}
        onPress={() => setShowOptions(true)}
      >
        <Feather name="more-vertical" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      <CompanyActionSheet 
        visible={showOptions} 
        onClose={() => setShowOptions(false)} 
        company={company} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
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
