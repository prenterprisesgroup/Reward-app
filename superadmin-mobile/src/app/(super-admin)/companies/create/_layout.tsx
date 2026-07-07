import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Typography } from '../../../../components/common/Typography';
import { theme } from '../../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { createCompanySchema, CreateCompanyFormValues } from '../../../../features/companies/schemas/createCompany.schema';
import { useWizardStore } from '../../../../features/companies/store/useWizardStore';
import { LivePreviewCard } from '../../../../features/companies/components/create/LivePreviewCard';

const STEPS = [
  { id: 1, title: 'Company', route: '/companies/create/step-1' },
  { id: 2, title: 'Address', route: '/companies/create/step-2' },
  { id: 3, title: 'Settlement', route: '/companies/create/step-3' },
];

import { Alert, ToastAndroid } from 'react-native';

export default function CreateCompanyLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const { currentStep, completedSteps, resetWizard, draftStatus, setDraftStatus } = useWizardStore();

  const methods = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    mode: 'onChange',
    defaultValues: {
      settlementMethod: 'UPI'
    }
  });

  const scrollViewRef = useRef<ScrollView>(null);

  // Auto scroll to top when changing steps
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [pathname]);

  const handleClose = () => {
    if (draftStatus === 'IN_PROGRESS' || methods.formState.isDirty) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard this draft?',
        [
          { text: 'Continue Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => {
            setDraftStatus('DISCARDED');
            resetWizard();
            router.replace('/companies');
          }}
        ]
      );
    } else {
      resetWizard();
      router.replace('/companies');
    }
  };

  const isReviewOrSuccess = pathname.includes('review') || pathname.includes('success');

  return (
    <FormProvider {...methods}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header} accessibilityRole="header">
          <TouchableOpacity 
            onPress={handleClose} 
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Close wizard"
            accessibilityHint="Discards the draft and returns to companies list"
          >
            <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Typography variant="title" style={styles.headerTitle}>Create Company</Typography>
          <TouchableOpacity 
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => {
              if (Platform.OS === 'android') ToastAndroid.show('Notifications coming soon', ToastAndroid.SHORT);
              else Alert.alert('Coming Soon', 'Notifications coming soon');
            }}
          >
            <Feather name="bell" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Stepper (Only show if not on success screen) */}
          {!pathname.includes('success') && (
            <View 
              style={styles.stepperContainer}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 1, max: STEPS.length, now: currentStep }}
            >
              <Typography style={styles.stepCountText} accessibilityLabel={`Step ${currentStep} of ${STEPS.length}`}>
                Step {currentStep} of {STEPS.length}
              </Typography>
              <View style={styles.stepperTrack}>
                {STEPS.map((step, index) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = completedSteps.includes(step.id);
                  const isLast = index === STEPS.length - 1;

                  return (
                    <View 
                      key={step.id} 
                      style={styles.stepItemWrapper}
                      accessibilityState={{ selected: isActive, disabled: !isActive && !isCompleted }}
                      accessibilityLabel={`${step.title} step`}
                    >
                      <View style={styles.stepNodeContainer}>
                        <View style={[
                          styles.stepNode, 
                          (isActive || isCompleted) ? styles.stepNodeActive : styles.stepNodeInactive
                        ]}>
                          {isCompleted ? (
                            <Feather name="check" size={14} color={theme.colors.surface} />
                          ) : (
                            <View style={isActive ? styles.stepNodeInnerActive : styles.stepNodeInnerInactive} />
                          )}
                        </View>
                        {!isLast && (
                          <View style={[
                            styles.stepLine,
                            isCompleted ? styles.stepLineActive : styles.stepLineInactive
                          ]} />
                        )}
                      </View>
                      <Typography style={[
                        styles.stepTitle, 
                        (isActive || isCompleted) ? styles.stepTitleActive : styles.stepTitleInactive
                      ]}>
                        {step.title}
                      </Typography>
                    </View>
                  );
                })}
              </View>
              <Typography style={styles.stepperSubtitle}>Register a new company on the platform.</Typography>
            </View>
          )}

          {/* Form and Preview Layout */}
          <View style={[
            styles.mainLayout, 
            { flexDirection: isLargeScreen ? 'row' : 'column' },
            pathname.includes('success') && styles.successLayout
          ]}>
            {/* Left Side: Form/Slot */}
            <View style={[
              styles.formSection, 
              { flex: isLargeScreen && !pathname.includes('success') ? 2 : 1, width: '100%' }
            ]}>
              <Slot />
            </View>

            {/* Right Side: Live Preview (Hide on Success) */}
            {!pathname.includes('success') && (
              <View style={[styles.previewSection, { 
                minWidth: isLargeScreen ? 350 : '100%',
                marginTop: isLargeScreen ? 0 : 24
              }]}>
                <Typography style={styles.previewTitle}>Live Preview</Typography>
                <LivePreviewCard />
              </View>
            )}
          </View>

        </ScrollView>
      </View>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    flexGrow: 1,
  },
  stepperContainer: {
    marginBottom: theme.spacing.xl,
  },
  stepCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
    marginBottom: 16,
  },
  stepperTrack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepItemWrapper: {
    flex: 1,
  },
  stepNodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepNodeActive: {
    backgroundColor: theme.colors.success,
  },
  stepNodeInactive: {
    backgroundColor: theme.colors.borderLight,
  },
  stepNodeInnerActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.surface,
  },
  stepNodeInnerInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.background,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginLeft: -4,
    marginRight: -4,
    zIndex: 1,
  },
  stepLineActive: {
    backgroundColor: theme.colors.success,
  },
  stepLineInactive: {
    backgroundColor: theme.colors.borderLight,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  stepTitleActive: {
    color: theme.colors.textPrimary,
  },
  stepTitleInactive: {
    color: theme.colors.textTertiary,
  },
  stepperSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  mainLayout: {
    gap: theme.spacing.xl,
    flex: 1,
  },
  successLayout: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    flex: 2,
    width: '100%',
  },
  previewSection: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    height: 'auto',
    alignSelf: 'stretch',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 16,
    textAlign: 'right',
  }
});
