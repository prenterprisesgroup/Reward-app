import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../../constants/theme';
import { AuditLogModel } from '../types/audit.types';
import { X } from 'lucide-react-native';

interface Props {
  log: AuditLogModel | null;
  onClose: () => void;
}

const JsonViewer = ({ data, title }: { data: any, title: string }) => {
  if (!data) return null;
  
  return (
    <View style={styles.jsonSection}>
      <Text style={styles.jsonTitle}>{title}</Text>
      <ScrollView horizontal style={styles.jsonScroll}>
        <Text style={styles.jsonText}>{JSON.stringify(data, null, 2)}</Text>
      </ScrollView>
    </View>
  );
};

export const AuditStateDiffModal = ({ log, onClose }: Props) => {
  if (!log) return null;

  return (
    <Modal
      visible={!!log}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Audit Details</Text>
            <Text style={styles.subtitle}>{log.action}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.metaCard}>
            <Text style={styles.metaText}>Actor: {log.actorName} {log.actorRole ? `(${log.actorRole})` : ''}</Text>
            {log.companyName && <Text style={styles.metaText}>Company: {log.companyName}</Text>}
            <Text style={styles.metaText}>Time: {log.timestamp.toLocaleString()}</Text>
          </View>

          {(!log.beforeState && !log.afterState) ? (
            <Text style={styles.emptyText}>No state changes recorded for this event.</Text>
          ) : (
            <View style={styles.diffContainer}>
              <JsonViewer data={log.beforeState} title="Before State" />
              <JsonViewer data={log.afterState} title="After State" />
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h3,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.primaryDark,
    fontWeight: 'bold',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  metaCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  metaText: {
    ...theme.typography.body,
    marginBottom: 4,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  diffContainer: {
    gap: theme.spacing.lg,
    paddingBottom: 40,
  },
  jsonSection: {
    backgroundColor: '#1E1E1E',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  jsonTitle: {
    ...theme.typography.caption,
    color: '#fff',
    backgroundColor: '#2D2D2D',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontWeight: 'bold',
  },
  jsonScroll: {
    padding: theme.spacing.md,
  },
  jsonText: {
    fontFamily: 'monospace',
    color: '#D4D4D4',
    fontSize: 12,
  }
});
