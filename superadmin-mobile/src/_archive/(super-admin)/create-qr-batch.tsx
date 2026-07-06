import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { useCreateBarcodeBatchMutation } from '../../hooks/useCreateBarcodeBatchMutation';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight'; // Assume we might need to create this or just rely on KeyboardAvoidingView and padding

export default function CreateQRBatchScreen() {
  const insets = useSafeAreaInsets();
  const { toastConfig, showToast, hideToast } = useToast();
  const createMutation = useCreateBarcodeBatchMutation();
  
  const [form, setForm] = useState({
    batchName: '',
    rewardAmount: '',
    quantity: '',
    description: '',
    expiresAt: null,
  });

  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  // Computed Values
  const summary = useMemo(() => ({
    reward: Number(form.rewardAmount) || 0,
    quantity: Number(form.quantity) || 0,
    total: (Number(form.rewardAmount) || 0) * (Number(form.quantity) || 0),
  }), [form]);

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (form.batchName && form.batchName.length < 3) errs.batchName = 'Batch name must be at least 3 characters.';
    if (form.rewardAmount && (Number(form.rewardAmount) <= 0 || isNaN(Number(form.rewardAmount)))) errs.rewardAmount = 'Reward must be greater than zero.';
    if (form.quantity && (Number(form.quantity) <= 0 || isNaN(Number(form.quantity)))) errs.quantity = 'Quantity must be greater than zero.';
    if (form.quantity && Number(form.quantity) > 100000) errs.quantity = 'Maximum quantity is 100,000.';
    if (form.description.length > 200) errs.description = 'Description must be 200 characters or less.';
    return errs;
  }, [form]);

  const isFormValid = 
    form.batchName.length >= 3 &&
    Number(form.rewardAmount) > 0 &&
    Number(form.quantity) > 0 &&
    Number(form.quantity) <= 100000 &&
    form.description.length <= 200;

  const hasUnsavedChanges = form.batchName || form.rewardAmount || form.quantity || form.description;

  const resetForm = useCallback(() => {
    setForm({
      batchName: '',
      rewardAmount: '',
      quantity: '',
      description: '',
      expiresAt: null,
    });
  }, []);

  const handleTextChange = useCallback((field: keyof typeof form, value: string) => {
    let sanitizedValue = value;

    if (field === 'rewardAmount' || field === 'quantity') {
      // Remove all non-numeric characters
      sanitizedValue = value.replace(/[^0-9]/g, '');
      // Remove leading zeros
      sanitizedValue = sanitizedValue.replace(/^0+/, '');
      
      // Enforce max quantity limit
      if (field === 'quantity' && sanitizedValue.length > 0) {
        if (Number(sanitizedValue) > 100000) {
          sanitizedValue = '100000';
        }
      }
    }

    setForm(prev => ({ ...prev, [field]: sanitizedValue }));
  }, []);

  const handleCancelPress = useCallback(() => {
    if (hasUnsavedChanges && !createMutation.isSuccess) {
      setCancelModalVisible(true);
    } else {
      router.back();
    }
  }, [hasUnsavedChanges, createMutation.isSuccess]);

  const confirmCancel = useCallback(() => {
    setCancelModalVisible(false);
    router.back();
  }, []);

  const handleGenerate = useCallback(() => {
    if (!isFormValid || createMutation.isPending) return;
    
    createMutation.mutate({
      batchName: form.batchName,
      rewardPerQR: Number(form.rewardAmount),
      totalQRCodes: Number(form.quantity),
      description: form.description,
      expiresAt: form.expiresAt || undefined,
    }, {
      onSuccess: () => {
        resetForm();
      }
    });
  }, [isFormValid, form, createMutation, resetForm]);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const formatNumber = (val: number) => val.toLocaleString('en-IN');

  const charCountColor = form.description.length > 200 ? theme.colors.error : 
                         form.description.length > 180 ? theme.colors.warning : 
                         theme.colors.textTertiary;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 150 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>

            <TouchableOpacity onPress={handleCancelPress} style={styles.iconBtn} accessibilityRole="button">
              <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Typography variant="headingLg" weight="bold" style={styles.headerTitle}>Create QR Batch</Typography>
              <Typography style={styles.headerSubtitle}>
                Generate a new batch of reward QR codes{'\n'}for your workers.
              </Typography>
            </View>
            
            <TouchableOpacity style={styles.iconBtn} accessibilityRole="button">
              <Feather name="bell" size={20} color={theme.colors.textPrimary} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* Section 1: Batch Information */}
          <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: theme.colors.success + '15' }]}>
                <Feather name="file-text" size={20} color={theme.colors.success} />
              </View>
              <Typography variant="title" weight="bold">Batch Information</Typography>
            </View>

            <View style={styles.inputGroup}>
              <Typography style={styles.inputLabel}>Batch Name</Typography>
              <View style={[styles.inputWrapper, errors.batchName && styles.inputWrapperError]}>
                <TextInput
                  style={styles.input}
                  placeholder="June Factory Batch"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={form.batchName}
                  onChangeText={(val) => handleTextChange('batchName', val)}
                  editable={!createMutation.isPending && !createMutation.isSuccess}
                  accessibilityLabel="Batch Name Input"
                  autoCapitalize="words"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
              {errors.batchName && <Typography style={styles.errorText}>{errors.batchName}</Typography>}
            </View>

            <View style={styles.inputGroup}>
              <Typography style={styles.inputLabel}>Reward Per QR (₹)</Typography>
              <View style={[styles.inputWrapper, errors.rewardAmount && styles.inputWrapperError]}>
                <TextInput
                  style={styles.input}
                  placeholder="100"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="number-pad"
                  value={form.rewardAmount}
                  onChangeText={(val) => handleTextChange('rewardAmount', val)}
                  editable={!createMutation.isPending && !createMutation.isSuccess}
                  accessibilityLabel="Reward Per QR Input"
                  returnKeyType="next"
                />
              </View>
              {errors.rewardAmount && <Typography style={styles.errorText}>{errors.rewardAmount}</Typography>}
            </View>

            <View style={styles.inputGroup}>
              <Typography style={styles.inputLabel}>Number of QR Codes</Typography>
              <View style={[styles.inputWrapper, errors.quantity && styles.inputWrapperError]}>
                <TextInput
                  style={styles.input}
                  placeholder="1000"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="number-pad"
                  value={form.quantity}
                  onChangeText={(val) => handleTextChange('quantity', val)}
                  editable={!createMutation.isPending && !createMutation.isSuccess}
                  accessibilityLabel="Number of QR Codes Input"
                  returnKeyType="next"
                />
                <View style={[styles.inputTrailingIcon, { backgroundColor: theme.colors.success + '15' }]}>
                  <MaterialCommunityIcons name="qrcode" size={20} color={theme.colors.success} />
                </View>
              </View>
              {errors.quantity && <Typography style={styles.errorText}>{errors.quantity}</Typography>}
            </View>

            <View style={styles.inputGroup}>
              <Typography style={styles.inputLabel}>Description (Optional)</Typography>
              <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start' }, errors.description && styles.inputWrapperError]}>
                <TextInput
                  style={[styles.input, { height: '100%', paddingTop: 12, paddingBottom: 30 }]}
                  placeholder="Add a short description about this batch..."
                  placeholderTextColor={theme.colors.textTertiary}
                  multiline
                  maxLength={200}
                  textAlignVertical="top"
                  value={form.description}
                  onChangeText={(val) => handleTextChange('description', val)}
                  editable={!createMutation.isPending && !createMutation.isSuccess}
                  accessibilityLabel="Description Input"
                  blurOnSubmit={true}
                  returnKeyType="done"
                />
                <Typography variant="caption" style={[styles.charCounter, { color: charCountColor }]}>
                  {form.description.length}/200
                </Typography>
              </View>
              {errors.description && <Typography style={styles.errorText}>{errors.description}</Typography>}
            </View>
          </Animated.View>

          {/* Section 2: Live Summary */}
          <Animated.View entering={FadeInUp.delay(200).springify()} style={[styles.card, { backgroundColor: '#F2F6F3' }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: theme.colors.success + '20' }]}>
                <Feather name="pie-chart" size={20} color={theme.colors.success} />
              </View>
              <Typography variant="title" weight="bold">Live Summary</Typography>
            </View>

            <View style={styles.summaryCols}>
              <View style={styles.summaryCol}>
                <Typography variant="caption" style={styles.summaryLabel}>Batch Name</Typography>
                <Typography weight="bold" style={styles.summaryValue} numberOfLines={1}>
                  {form.batchName || '-'}
                </Typography>
              </View>
              <View style={styles.summaryCol}>
                <Typography variant="caption" style={styles.summaryLabel}>Reward Per QR</Typography>
                <Typography weight="bold" style={styles.summaryValue} numberOfLines={1}>
                  {summary.reward ? formatCurrency(summary.reward) : '-'}
                </Typography>
              </View>
              <View style={styles.summaryCol}>
                <Typography variant="caption" style={styles.summaryLabel}>QR Quantity</Typography>
                <Typography weight="bold" style={styles.summaryValue} numberOfLines={1}>
                  {summary.quantity ? formatNumber(summary.quantity) : '-'}
                </Typography>
              </View>
            </View>

            <View style={styles.divider} />

            <Typography variant="caption" style={styles.budgetLabel}>Estimated Total Reward Budget</Typography>
            <View style={styles.budgetBox}>
              <Typography variant="headingLg" weight="bold" style={styles.budgetValue} adjustsFontSizeToFit numberOfLines={1}>
                {summary.reward && summary.quantity 
                  ? `₹${summary.reward} × ${summary.quantity} = ${formatCurrency(summary.total)}`
                  : '₹0 × 0 = ₹0'}
              </Typography>
              <MaterialCommunityIcons name="wallet-outline" size={24} color={theme.colors.success} style={{ opacity: 0.5 }} />
            </View>
          </Animated.View>

          {/* Section 3: Important Notice */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={[styles.card, { backgroundColor: '#FFF7E6', borderColor: '#FFD591', borderWidth: 1 }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: theme.colors.warning + '20' }]}>
                <Feather name="info" size={20} color={theme.colors.warning} />
              </View>
              <Typography variant="title" weight="bold" style={{ color: theme.colors.warning }}>Important Notice</Typography>
              <View style={{ flex: 1 }} />
              <Feather name="shield" size={24} color={theme.colors.warning} style={{ opacity: 0.5 }} />
            </View>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: theme.colors.warning }]} />
                <Typography style={styles.bulletText}>QR codes cannot be modified after generation.</Typography>
              </View>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: theme.colors.warning }]} />
                <Typography style={styles.bulletText}>Please verify all details before creating the batch.</Typography>
              </View>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: theme.colors.warning }]} />
                <Typography style={styles.bulletText}>Generated QR codes are unique and secure.</Typography>
              </View>
            </View>
          </Animated.View>

          {/* Section 4: What Happens Next */}
          <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.card}>
            <Typography variant="title" weight="bold" style={{ marginBottom: theme.spacing.lg }}>What happens next?</Typography>
            
            <View style={styles.stepsFlow}>
              <View style={styles.stepItem}>
                <View style={styles.stepIconBox}>
                  <MaterialCommunityIcons name="qrcode-scan" size={24} color={theme.colors.success} />
                </View>
                <Typography variant="caption" weight="medium" style={styles.stepText}>QR Batch{'\n'}Ready</Typography>
              </View>
              
              <View style={styles.stepConnector} />
              
              <View style={styles.stepItem}>
                <View style={styles.stepIconBox}>
                  <Feather name="file-text" size={24} color={theme.colors.success} />
                </View>
                <Typography variant="caption" weight="medium" style={styles.stepText}>PDF{'\n'}Available</Typography>
              </View>
              
              <View style={styles.stepConnector} />
              
              <View style={styles.stepItem}>
                <View style={styles.stepIconBox}>
                  <Feather name="download" size={24} color={theme.colors.success} />
                </View>
                <Typography variant="caption" weight="medium" style={styles.stepText}>Download{'\n'}after generation</Typography>
              </View>
            </View>
          </Animated.View>

        </ScrollView>

        {/* Sticky Footer */}
        <Animated.View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity 
            style={[styles.primaryBtn, (!isFormValid || createMutation.isPending || createMutation.isSuccess) && styles.primaryBtnDisabled]}
            onPress={handleGenerate}
            disabled={!isFormValid || createMutation.isPending || createMutation.isSuccess}
            accessibilityRole="button"
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" style={styles.btnIcon} />
            ) : createMutation.isSuccess ? (
              <Feather name="check" size={20} color="#fff" style={styles.btnIcon} />
            ) : (
              <MaterialCommunityIcons name="qrcode" size={20} color="#fff" style={styles.btnIcon} />
            )}
            <Typography weight="bold" style={styles.primaryBtnText}>
              {createMutation.isPending ? 'Generating...' : createMutation.isSuccess ? 'Generated' : 'Generate QR Batch'}
            </Typography>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.secondaryBtn, createMutation.isPending && styles.secondaryBtnDisabled]}
            onPress={handleCancelPress}
            disabled={createMutation.isPending || createMutation.isSuccess}
            accessibilityRole="button"
          >
            <Typography weight="bold" style={styles.secondaryBtnText}>Cancel</Typography>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>

      <ConfirmationModal
        visible={cancelModalVisible}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to discard them and go back?"
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        onConfirm={confirmCancel}
        onCancel={() => setCancelModalVisible(false)}
      />

      <Toast
        visible={toastConfig.visible}
        type={toastConfig.type}
        message={toastConfig.message}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  headerTitle: {
    textAlign: 'center',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: '#FAFAFA',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  inputTrailingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  charCounter: {
    position: 'absolute',
    bottom: 8,
    right: 12,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  summaryCols: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    color: theme.colors.textTertiary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  budgetLabel: {
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  budgetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.success + '10',
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  budgetValue: {
    color: theme.colors.success,
    flex: 1,
    paddingRight: 8,
  },
  bulletList: {
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  stepsFlow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  stepConnector: {
    flex: 0.5,
    height: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    marginTop: 24,
    marginHorizontal: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 28,
    marginBottom: theme.spacing.md,
  },
  primaryBtnDisabled: {
    backgroundColor: theme.colors.border,
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  secondaryBtnDisabled: {
    opacity: 0.5,
  },
  secondaryBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
});
