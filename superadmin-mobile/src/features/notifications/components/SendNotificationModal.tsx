import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { theme } from '../../../constants/theme';
import { useTemplatesQuery, useSendNotificationMutation } from '../hooks/useNotifications';
import { NotificationChannel, TemplateModel } from '../types/notifications.types';
import { RecipientSearchInput } from './RecipientSearchInput';
import { TemplatePreview } from './TemplatePreview';
import { X, Send } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CHANNELS: { label: string; value: NotificationChannel }[] = [
  { label: 'Email', value: 'EMAIL' },
  { label: 'SMS', value: 'SMS' },
  { label: 'Push', value: 'PUSH' },
];

export const SendNotificationModal = ({ visible, onClose }: Props) => {
  const { data: templates = [], isLoading: isLoadingTemplates } = useTemplatesQuery();
  const sendMutation = useSendNotificationMutation();

  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel>('EMAIL');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [variablesForm, setVariablesForm] = useState<Record<string, string>>({});
  const [variableErrors, setVariableErrors] = useState<Record<string, string>>({});

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: { recipientId: '' }
  });

  const recipientId = watch('recipientId');

  // Memoize the selected template
  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  // Extract required variables from the template subject and body
  const requiredVariables = useMemo(() => {
    if (!selectedTemplate) return [];
    const varRegex = /{{([^}]+)}}/g;
    const matches = [...(selectedTemplate.body.match(varRegex) || []), ...(selectedTemplate.subject.match(varRegex) || [])];
    const uniqueVars = Array.from(new Set(matches.map(m => m.replace(/{{|}}/g, ''))));
    return uniqueVars;
  }, [selectedTemplate]);

  // Reset variable state when template changes
  useEffect(() => {
    setVariablesForm({});
    setVariableErrors({});
  }, [selectedTemplateId]);

  const handleSend = () => {
    if (!recipientId) {
      // Handled by react-hook-form basically, but we do manual check for safety
      return;
    }

    if (!selectedTemplateId) {
      return;
    }

    // Validate variables
    let hasError = false;
    const newErrors: Record<string, string> = {};
    requiredVariables.forEach(v => {
      if (!variablesForm[v] || variablesForm[v].trim() === '') {
        newErrors[v] = 'This variable is required';
        hasError = true;
      }
    });

    if (hasError) {
      setVariableErrors(newErrors);
      return;
    }

    sendMutation.mutate(
      {
        channel: selectedChannel,
        recipientId,
        templateId: selectedTemplateId,
        variables: variablesForm
      },
      {
        onSuccess: () => {
          reset();
          setSelectedTemplateId('');
          setVariablesForm({});
          onClose();
        }
      }
    );
  };

  const handleClose = () => {
    reset();
    setSelectedTemplateId('');
    setVariablesForm({});
    setVariableErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Send Notification</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.label}>Select Channel</Text>
          <View style={styles.chipGroup}>
            {CHANNELS.map(c => (
              <TouchableOpacity
                key={c.value}
                style={[styles.chip, selectedChannel === c.value && styles.chipActive]}
                onPress={() => setSelectedChannel(c.value)}
              >
                <Text style={[styles.chipText, selectedChannel === c.value && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Controller
            control={control}
            name="recipientId"
            rules={{ required: "Recipient is required" }}
            render={({ field: { onChange, value } }) => (
              <RecipientSearchInput 
                value={value} 
                onChange={onChange} 
                error={errors.recipientId?.message as string} 
              />
            )}
          />

          <Text style={styles.label}>Select Template</Text>
          {isLoadingTemplates ? (
            <ActivityIndicator size="small" color={theme.colors.primaryDark} style={{ alignSelf: 'flex-start', marginVertical: 10 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
              {templates.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.templateChip, selectedTemplateId === t.id && styles.templateChipActive]}
                  onPress={() => setSelectedTemplateId(t.id)}
                >
                  <Text style={[styles.templateChipText, selectedTemplateId === t.id && styles.templateChipTextActive]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TemplatePreview template={selectedTemplate} />

          {/* Dynamic Variables Form */}
          {requiredVariables.length > 0 && (
            <View style={styles.variablesSection}>
              <Text style={styles.sectionTitle}>Template Variables</Text>
              {requiredVariables.map(v => (
                <View key={v} style={styles.varInputContainer}>
                  <Text style={styles.label}>{`{{${v}}}`}</Text>
                  <TextInput
                    style={[styles.input, variableErrors[v] && styles.inputError]}
                    placeholder={`Enter value for ${v}...`}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={variablesForm[v] || ''}
                    onChangeText={(val) => {
                      setVariablesForm(prev => ({ ...prev, [v]: val }));
                      if (variableErrors[v]) {
                        setVariableErrors(prev => ({ ...prev, [v]: '' }));
                      }
                    }}
                  />
                  {variableErrors[v] && <Text style={styles.errorText}>{variableErrors[v]}</Text>}
                </View>
              ))}
            </View>
          )}

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.btn, styles.btnCancel]} 
            onPress={handleClose}
            disabled={sendMutation.isPending}
          >
            <Text style={styles.btnCancelText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.btn, 
              styles.btnSubmit, 
              (!recipientId || !selectedTemplateId || sendMutation.isPending) && styles.btnDisabled
            ]} 
            onPress={handleSubmit(handleSend)}
            disabled={!recipientId || !selectedTemplateId || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Send size={18} color="#fff" />
                <Text style={styles.btnSubmitText}>Dispatch</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  chip: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
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
  templateScroll: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  templateChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
  },
  templateChipActive: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  templateChipText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  templateChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  variablesSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 40,
  },
  sectionTitle: {
    ...theme.typography.body,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  varInputContainer: {
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    ...theme.typography.body,
    backgroundColor: theme.colors.background,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
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
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnSubmitText: {
    ...theme.typography.button,
    color: '#fff',
  }
});
