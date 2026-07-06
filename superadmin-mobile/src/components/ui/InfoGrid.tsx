import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface InfoGridProps {
  children: React.ReactNode;
}

export const InfoGrid = React.memo(({ children }: InfoGridProps) => {
  return (
    <View style={styles.grid}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.sm,
    rowGap: theme.spacing.lg,
  },
});
