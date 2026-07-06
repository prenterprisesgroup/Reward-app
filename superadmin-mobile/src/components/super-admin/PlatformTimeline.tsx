import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlatformTimelineItem } from './PlatformTimelineItem';

interface EventItem {
  iconName: any;
  title: string;
  subtitle: string;
  timeText: string;
}

interface PlatformTimelineProps {
  events: EventItem[];
}

export function PlatformTimeline({ events }: PlatformTimelineProps) {
  return (
    <View style={styles.container}>
      {events.map((event, index) => (
        <PlatformTimelineItem
          key={index}
          index={index}
          iconName={event.iconName}
          title={event.title}
          subtitle={event.subtitle}
          timeText={event.timeText}
          isLast={index === events.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  }
});
