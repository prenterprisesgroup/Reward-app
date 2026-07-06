import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface TimelineItemProps {
  isLast?: boolean;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  dotColor?: string;
}

export const TimelineItem = React.memo(({ 
  isLast = false, 
  leftContent, 
  rightContent,
  dotColor = theme.colors.success
}: TimelineItemProps) => {
  return (
    <View style={styles.container}>
      {/* Left Axis: Dot and Line */}
      <View style={styles.axis}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        {!isLast && <View style={styles.line} />}
      </View>
      
      {/* Content Area */}
      <View style={[styles.contentWrapper, isLast && styles.contentWrapperLast]}>
        <View style={styles.leftContent}>
          {leftContent}
        </View>
        <View style={styles.rightContent}>
          {rightContent}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  axis: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    zIndex: 1,
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: theme.colors.borderLight,
    marginTop: -2,
    marginBottom: -6,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
    paddingBottom: theme.spacing.xl,
    paddingLeft: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  contentWrapperLast: {
    paddingBottom: 0,
  },
  leftContent: {
    flex: 1,
    minWidth: 0,
  },
  rightContent: {
    flexShrink: 0,
    alignItems: 'flex-end',
  },
});
