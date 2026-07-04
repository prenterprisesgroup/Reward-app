import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Typography } from '../common/Typography';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { theme } from '../../constants/theme';
import { AlertTriangle } from 'lucide-react-native';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal = React.memo(({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmationModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.iconContainer}>
                <AlertTriangle size={24} color={theme.colors.error} />
              </View>
              
              <Typography style={styles.title}>{title}</Typography>
              <Typography style={styles.message}>{message}</Typography>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                  <Typography style={styles.cancelText}>{cancelText}</Typography>
                </TouchableOpacity>
                <PrimaryButton 
                  title={confirmText} 
                  onPress={onConfirm} 
                  style={styles.confirmBtn}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E5',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: theme.colors.error,
  }
});
