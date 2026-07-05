import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';

interface InfoGridItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: React.ReactNode;
  iconColor?: string;
  iconBgColor?: string;
}

export const InfoGridItem = React.memo(({ 
  icon, 
  label, 
  value,
  iconColor = theme.colors.success,
  iconBgColor = theme.colors.successLight 
}: InfoGridItemProps) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
        <Feather name={icon} size={16} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Typography variant="caption" style={styles.label} numberOfLines={1}>{label}</Typography>
        <View style={styles.valueContainer}>
          {typeof value === 'string' || typeof value === 'number' ? (
            <Typography variant="body" weight="medium" style={styles.value} numberOfLines={1}>
              {value}
            </Typography>
          ) : (
            value
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '50%',
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    color: theme.colors.textPrimary,
  }
});
