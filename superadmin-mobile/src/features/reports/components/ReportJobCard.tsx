import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../../../constants/theme';
import { ReportJobModel } from '../types/reports.types';
import { useDownloadReportMutation } from '../hooks/useReports';
import { Download, AlertCircle, FileText, CheckCircle, Clock } from 'lucide-react-native';

interface Props {
  job: ReportJobModel;
}

export const ReportJobCard = memo(({ job }: Props) => {
  const downloadMutation = useDownloadReportMutation();

  const handleDownload = () => {
    if (job.isDownloadable && !downloadMutation.isPending) {
      downloadMutation.mutate({ id: job.id, format: job.format });
    }
  };

  const getStatusIcon = () => {
    if (job.isProcessing) return <Clock size={16} color={theme.colors.warning} />;
    if (job.isFailed) return <AlertCircle size={16} color={theme.colors.error} />;
    return <CheckCircle size={16} color={theme.colors.success} />;
  };

  const getStatusColor = () => {
    if (job.isProcessing) return theme.colors.warning;
    if (job.isFailed) return theme.colors.error;
    return theme.colors.success;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <FileText size={20} color={theme.colors.primaryDark} />
          <Text style={styles.title}>{job.displayTitle}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {job.status}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>Format: {job.format}</Text>
        <Text style={styles.detailText}>
          Requested: {job.createdAt.toLocaleDateString()} {job.createdAt.toLocaleTimeString()}
        </Text>
      </View>

      {job.isProcessing && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${job.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{job.progress}%</Text>
        </View>
      )}

      {job.isFailed && job.failureReason && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorReason}>{job.failureReason}</Text>
        </View>
      )}

      {job.isDownloadable && (
        <TouchableOpacity 
          style={[styles.downloadButton, downloadMutation.isPending && styles.downloadButtonDisabled]}
          onPress={handleDownload}
          disabled={downloadMutation.isPending}
        >
          {downloadMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Download size={18} color="#fff" />
              <Text style={styles.downloadText}>Download {job.format}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
    gap: 4,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: 'bold',
  },
  details: {
    marginBottom: theme.spacing.md,
  },
  detailText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    width: 35,
    textAlign: 'right',
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '10',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  errorReason: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
  downloadButton: {
    backgroundColor: theme.colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.sm,
  },
  downloadButtonDisabled: {
    opacity: 0.7,
  },
  downloadText: {
    ...theme.typography.body,
    color: '#fff',
  }
});
