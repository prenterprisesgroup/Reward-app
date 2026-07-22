import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert, ActivityIndicator } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useApproveCompanyMutation, useRejectCompanyMutation, useSuspendCompanyMutation } from '../hooks/useCompanies';

interface CompanyActionSheetProps {
  visible: boolean;
  onClose: () => void;
  company: {
    id: string;
    status: string;
  };
}

export function CompanyActionSheet({ visible, onClose, company }: CompanyActionSheetProps) {
  const approveMutation = useApproveCompanyMutation();
  const rejectMutation = useRejectCompanyMutation();
  const suspendMutation = useSuspendCompanyMutation();
  
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (
    actionName: string,
    actionTitle: string,
    actionDesc: string,
    mutation: any,
    isDestructive: boolean = false
  ) => {
    Alert.alert(
      actionTitle,
      actionDesc,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: isDestructive ? 'destructive' : 'default',
          onPress: async () => {
            setLoadingAction(actionName);
            try {
              await mutation.mutateAsync(company.id);
              onClose();
            } catch (e) {
              // Error is handled in the mutation
            } finally {
              setLoadingAction(null);
            }
          }
        }
      ]
    );
  };

  const renderAction = (
    id: string,
    icon: any, 
    title: string, 
    subtitle: string, 
    color: string, 
    onPress: () => void,
    isDestructive: boolean = false
  ) => {
    const isLoading = loadingAction === id;
    
    return (
      <TouchableOpacity 
        style={styles.actionRow} 
        onPress={onPress}
        disabled={isLoading || loadingAction !== null}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '1A' }]}>
          {isLoading ? (
            <ActivityIndicator size="small" color={color} />
          ) : (
            <Feather name={icon} size={20} color={color} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Typography variant="body" color={isDestructive ? 'error' : 'textPrimary'}>{title}</Typography>
          <Typography variant="bodySmall" color="textSecondary">{subtitle}</Typography>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              
              <View style={styles.header}>
                <Typography variant="headingMd">Company Options</Typography>
              </View>

              <View style={styles.content}>
                
                {company.status === 'PENDING' && (
                  <>
                    {renderAction(
                      'approve', 'check-circle', 'Approve Company', 'Activate access', theme.colors.success, 
                      () => handleAction('approve', 'Approve Company', 'Are you sure you want to approve this company?', approveMutation)
                    )}
                    <View style={styles.divider} />
                    {renderAction(
                      'reject', 'x-circle', 'Reject Company', 'Deny application', theme.colors.error, 
                      () => handleAction('reject', 'Reject Company', 'Are you sure you want to reject this company?', rejectMutation, true),
                      true
                    )}
                    <View style={styles.divider} />
                  </>
                )}

                {company.status === 'SUSPENDED' && (
                  <>
                    {renderAction(
                      'activate', 'check-circle', 'Activate Company', 'Restore access', theme.colors.success, 
                      () => handleAction('activate', 'Activate Company', 'Are you sure you want to restore access?', approveMutation)
                    )}
                    <View style={styles.divider} />
                  </>
                )}

                {company.status === 'ACTIVE' && (
                  <>
                    {renderAction(
                      'suspend', 'pause-circle', 'Suspend Company', 'Temporarily disable access', theme.colors.warning, 
                      () => handleAction('suspend', 'Suspend Company', 'Are you sure you want to suspend this company? They will lose access.', suspendMutation, true)
                    )}
                    <View style={styles.divider} />
                  </>
                )}

                {/* Edit Company Action */}
                <TouchableOpacity 
                  style={styles.actionRow}
                  onPress={() => {
                    Alert.alert('Coming Soon', 'Edit feature will be available soon.');
                    onClose();
                  }}
                >
                  <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '1A' }]}>
                    <Feather name="edit-2" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.textContainer}>
                    <Typography variant="body">Edit Details</Typography>
                    <Typography variant="bodySmall" color="textSecondary">Modify company information</Typography>
                  </View>
                </TouchableOpacity>

              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 56, // Align with text
  }
});
