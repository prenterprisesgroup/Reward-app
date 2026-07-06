import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../components/common/Typography';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { InputField } from '../../components/forms/InputField';
import { ArrowLeft, CreditCard, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import { useRouter, useNavigation } from 'expo-router';
import { theme } from '../../constants/theme';
import { useUserQuery } from '../../hooks/useUserQuery';
import { useUpdateUpiMutation } from '../../hooks/useUpdateUpiMutation';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Card } from '../../components/cards/Card';

export default function ChangeUpiScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useUserQuery();
  const updateUpi = useUpdateUpiMutation();
  const { toastConfig, showToast, hideToast } = useToast();
  
  const currentUpi = data?.user?.upiId || '';

  const [newUpi, setNewUpi] = useState('');
  const [confirmUpi, setConfirmUpi] = useState('');
  
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  const isDirty = useMemo(() => {
    return newUpi.length > 0 || confirmUpi.length > 0;
  }, [newUpi, confirmUpi]);

  // Handle unsaved changes warning
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isDirty || updateUpi.isSuccess) {
        return;
      }
      
      e.preventDefault();
      setPendingAction(e.data.action);
      setShowExitModal(true);
    });

    return unsubscribe;
  }, [navigation, isDirty, updateUpi.isSuccess]);

  const handleDiscard = () => {
    setShowExitModal(false);
    if (pendingAction) {
      navigation.dispatch(pendingAction);
    }
  };

  const validate = () => {
    if (!newUpi.trim()) return 'Please enter a new UPI ID';
    if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(newUpi)) return 'Please enter a valid UPI format (e.g., name@bank)';
    if (newUpi === currentUpi) return 'New UPI ID cannot be the same as your current UPI ID';
    if (newUpi !== confirmUpi) return 'New UPI and Confirm UPI do not match';
    return null;
  };

  const handleUpdate = () => {
    const errorMsg = validate();
    if (errorMsg) {
      showToast(errorMsg, 'error');
      return;
    }

    updateUpi.mutate({ upiId: newUpi }, {
      onSuccess: () => {
        showToast('Your UPI ID has been updated successfully', 'success');
        setTimeout(() => {
          router.back();
        }, 1500);
      },
      onError: (error: any) => {
        showToast(error.response?.data?.message || 'Failed to update UPI ID', 'error');
      }
    });
  };

  const isMatch = useMemo(() => {
    if (newUpi.length === 0 || confirmUpi.length === 0) return false;
    return newUpi === confirmUpi && /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(newUpi);
  }, [newUpi, confirmUpi]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Toast {...toastConfig} onHide={hideToast} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Typography style={styles.title}>Change UPI</Typography>
          <View style={{ width: 44 }} />
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            
            <Card style={styles.heroCard}>
              <View style={styles.heroCardHeader}>
                <View style={styles.upiLogoContainer}>
                  <Typography style={styles.upiLogoText}>UPI</Typography>
                </View>
                <View style={styles.heroCardText}>
                  <Typography style={styles.heroCardLabel}>Current Registered UPI</Typography>
                  <Typography style={styles.heroCardValue}>{currentUpi || 'Not linked yet'}</Typography>
                </View>
              </View>
              {currentUpi ? (
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={14} color={theme.colors.primary} style={{ marginRight: 6 }} />
                  <Typography style={styles.verifiedText}>Verified</Typography>
                </View>
              ) : null}
            </Card>

            <View style={styles.securityCard}>
              <View style={styles.securityIconContainer}>
                <ShieldAlert size={20} color="#059669" />
              </View>
              <View style={styles.securityTextContainer}>
                <Typography style={styles.securityTitle}>Secure Update</Typography>
                <Typography style={styles.securityDesc}>UPI updates are protected. Your rewards will be securely transferred to your new UPI ID once verified.</Typography>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Typography style={styles.label}>New UPI ID</Typography>
                <InputField
                  value={newUpi}
                  onChangeText={setNewUpi}
                  placeholder="e.g. yourname@bank"
                  autoCapitalize="none"
                  leftIcon={<CreditCard size={20} color={isMatch ? theme.colors.success : theme.colors.textSecondary} />}
                />
              </View>

              <View style={styles.inputGroup}>
                <Typography style={styles.label}>Confirm New UPI ID</Typography>
                <InputField
                  value={confirmUpi}
                  onChangeText={setConfirmUpi}
                  placeholder="Re-enter your new UPI ID"
                  autoCapitalize="none"
                  leftIcon={<CreditCard size={20} color={isMatch ? theme.colors.success : theme.colors.textSecondary} />}
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.cancelBtn, updateUpi.isPending && { opacity: 0.5 }]} 
            disabled={updateUpi.isPending}
          >
            <Typography style={styles.cancelBtnText}>Cancel</Typography>
          </TouchableOpacity>
          <PrimaryButton 
            title="Update UPI ID" 
            onPress={handleUpdate} 
            style={styles.saveBtn}
            loading={updateUpi.isPending}
            disabled={!isDirty || updateUpi.isPending}
          />
        </View>
      </KeyboardAvoidingView>
      
      <ConfirmationModal
        visible={showExitModal}
        title="Unsaved Changes"
        message="You have unsaved UPI changes. Are you sure you want to discard them and leave?"
        confirmText="Discard"
        cancelText="Continue Editing"
        onConfirm={handleDiscard}
        onCancel={() => setShowExitModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  iconBtn: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm },
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },
  
  heroCard: { padding: 20, backgroundColor: '#FFF', borderRadius: 24, marginBottom: 16, ...theme.shadows.sm },
  heroCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  upiLogoContainer: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#F1F3F5' },
  upiLogoText: { fontSize: 15, fontWeight: '800', color: '#666', fontStyle: 'italic' },
  heroCardText: { flex: 1 },
  heroCardLabel: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 4 },
  heroCardValue: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignSelf: 'flex-start' },
  verifiedText: { fontSize: 13, fontWeight: '600', color: theme.colors.primary },

  securityCard: { flexDirection: 'row', backgroundColor: '#ECFDF5', padding: 16, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: '#D1FAE5' },
  securityIconContainer: { marginRight: 12, marginTop: 2 },
  securityTextContainer: { flex: 1 },
  securityTitle: { fontSize: 14, fontWeight: '700', color: '#065F46', marginBottom: 4 },
  securityDesc: { fontSize: 13, color: '#047857', lineHeight: 20 },

  formSection: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8, marginLeft: 4 },
  
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    padding: 24, 
    paddingTop: 16, 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderTopWidth: 1, 
    borderTopColor: '#F1F3F5', 
    alignItems: 'center' 
  },
  cancelBtn: { flex: 1, marginRight: 12, height: 52, borderRadius: 16, borderWidth: 1, borderColor: '#E8E8E5', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
  saveBtn: { flex: 2 }
});
