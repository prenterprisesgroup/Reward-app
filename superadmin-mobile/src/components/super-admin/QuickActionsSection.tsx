import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import { QuickActionCard } from './QuickActionCard';
import { useRouter } from 'expo-router';

export function QuickActionsSection() {
  const router = useRouter();
  
  const actions = [
    { 
      title: 'Manage\nCompanies', 
      iconName: 'briefcase' as const,
      onPress: () => router.push('/(super-admin)/companies')
    },
    { title: 'Company\nAdmins', iconName: 'user' as const },
    { title: 'Analytics', iconName: 'bar-chart-2' as const },
    { title: 'Platform\nSettings', iconName: 'settings' as const },
  ];

  return (
    <View style={styles.container}>
      <Typography style={styles.sectionTitle} variant="title">Quick Actions</Typography>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action, index) => (
          <QuickActionCard 
            key={index}
            index={index}
            title={action.title}
            iconName={action.iconName}
            onPress={action.onPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm, // space for shadow
  }
});
