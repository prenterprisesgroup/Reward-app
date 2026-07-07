import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../../../constants/theme';
import { useGenerateReportMutation } from '../hooks/useReports';
import { ReportType, ReportFormat } from '../types/reports.types';
import { X } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const REPORT_TYPES: { label: string; value: ReportType }[] = [
  { label: 'Companies', value: 'COMPANIES' },
  { label: 'Workers', value: 'WORKERS' },
  { label: 'Withdrawals', value: 'WITHDRAWALS' },
  { label: 'Transactions', value: 'TRANSACTIONS' },
  { label: 'QR Batches', value: 'QR_BATCHES' },
  { label: 'Audit Logs', value: 'AUDIT_LOGS' },
];

const FORMATS: { label: string; value: ReportFormat }[] = [
  { label: 'CSV', value: 'CSV' },
  { label: 'Excel', value: 'EXCEL' },
  { label: 'PDF', value: 'PDF' },
];

export const GenerateReportModal = ({ visible, onClose }: Props) => {
  const [selectedType, setSelectedType] = useState<ReportType>('COMPANIES');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('CSV');
  const generateMutation = useGenerateReportMutation();

  const handleGenerate = () => {
    generateMutation.mutate(
      { reportType: selectedType, format: selectedFormat },
      {
        onSuccess: () => {
          onClose(); // Close modal on success
        }
      }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Generate New Report</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Select Report Type</Text>
          <View style={styles.chipGroup}>
            {REPORT_TYPES.map(type => (
              <TouchableOpacity
                key={type.value}
                style={[styles.chip, selectedType === type.value && styles.chipActive]}
                onPress={() => setSelectedType(type.value)}
              >
                <Text style={[styles.chipText, selectedType === type.value && styles.chipTextActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Select Format</Text>
          <View style={styles.chipGroup}>
            {FORMATS.map(fmt => (
              <TouchableOpacity
                key={fmt.value}
                style={[styles.chip, selectedFormat === fmt.value && styles.chipActive]}
                onPress={() => setSelectedFormat(fmt.value)}
              >
                <Text style={[styles.chipText, selectedFormat === fmt.value && styles.chipTextActive]}>
                  {fmt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.btn, styles.btnCancel]} 
              onPress={onClose}
              disabled={generateMutation.isPending}
            >
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btn, styles.btnSubmit, generateMutation.isPending && styles.btnSubmitDisabled]} 
              onPress={handleGenerate}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.btnSubmitText}>Generate</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h3,
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  chipActive: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  chipText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  btn: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  btnCancelText: {
    ...theme.typography.button,
    color: theme.colors.text,
  },
  btnSubmit: {
    backgroundColor: theme.colors.primaryDark,
    minWidth: 120,
  },
  btnSubmitDisabled: {
    opacity: 0.7,
  },
  btnSubmitText: {
    ...theme.typography.button,
    color: '#fff',
  }
});
