import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../../constants/theme';
import { TemplateModel } from '../types/notifications.types';

interface Props {
  template: TemplateModel | null;
}

export const TemplatePreview = ({ template }: Props) => {
  if (!template) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Select a template to view preview.</Text>
      </View>
    );
  }

  // Regex to find {{variable_name}}
  const varRegex = /{{([^}]+)}}/g;

  const renderBodyWithHighlighting = (text: string) => {
    const parts = text.split(varRegex);
    return parts.map((part, index) => {
      // Every odd index is a matched group from the regex split
      if (index % 2 !== 0) {
        return (
          <Text key={index} style={styles.variableBadge}>
            {`{{${part}}}`}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Template Preview</Text>
      <View style={styles.previewBox}>
        <Text style={styles.subjectText} selectable>
          <Text style={styles.fieldLabel}>Subject: </Text>
          {renderBodyWithHighlighting(template.subject)}
        </Text>
        
        <View style={styles.divider} />
        
        <ScrollView style={styles.bodyScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          <Text style={styles.bodyText} selectable>
            {renderBodyWithHighlighting(template.body)}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  emptyContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  previewBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    maxHeight: 200,
  },
  fieldLabel: {
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  subjectText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
  bodyScroll: {
    flexGrow: 0,
  },
  bodyText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
  variableBadge: {
    backgroundColor: theme.colors.primaryDark + '20',
    color: theme.colors.primaryDark,
    fontWeight: 'bold',
  }
});
