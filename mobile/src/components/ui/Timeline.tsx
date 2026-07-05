import React from 'react';
import { View, StyleSheet } from 'react-native';

interface TimelineProps {
  children: React.ReactNode;
}

export const Timeline = React.memo(({ children }: TimelineProps) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingLeft: 8,
  }
});
