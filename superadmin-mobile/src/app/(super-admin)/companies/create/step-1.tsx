import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, Image, Platform, ToastAndroid } from 'react-native';
import { useRouter } from 'expo-router';
import { useFormContext, Controller } from 'react-hook-form';
import { Typography } from '../../../../components/common/Typography';
import { theme } from '../../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { CreateCompanyFormValues } from '../../../../features/companies/schemas/createCompany.schema';
import { useWizardStore } from '../../../../features/companies/store/useWizardStore';
import * as ImagePicker from 'expo-image-picker';

export default function Step1CompanyInfo() {
  const router = useRouter();
  const { control, trigger, setValue, watch } = useFormContext<CreateCompanyFormValues>();
  const { nextStep, markStepComplete } = useWizardStore();
  const logoUri = watch('logo');

  const handleNext = async () => {
    // Validate Step 1 fields
    const isValid = await trigger(['name', 'industry', 'gstNumber', 'email', 'phone', 'website']);
    if (isValid) {
      markStepComplete(1);
      nextStep();
      router.push('/companies/create/step-2');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      
      // Validation Rule: Max 5MB
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert('File too large', 'Please select an image smaller than 5MB.');
        return;
      }
      
      // Validation Rule: JPEG, PNG, WebP (Expo Image Picker doesn't always provide mimeType on iOS, but we can check extension)
      const uri = asset.uri.toLowerCase();
      if (!uri.endsWith('.jpg') && !uri.endsWith('.jpeg') && !uri.endsWith('.png') && !uri.endsWith('.webp')) {
        Alert.alert('Unsupported format', 'Please select a JPEG, PNG, or WebP image.');
        return;
      }

      setValue('logo', asset.uri);
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Company logo selected successfully', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Company logo selected successfully');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Typography variant="title" style={styles.sectionTitle} accessibilityRole="header">Company Information</Typography>

      {/* Logo Upload */}
      <View style={styles.logoUploadContainer}>
        <TouchableOpacity 
          style={styles.logoUploadBtn} 
          onPress={pickImage}
          accessibilityRole="button"
          accessibilityLabel="Upload Company Logo"
          accessibilityHint="Selects an image from your device gallery to use as the company logo"
        >
          <Feather name="upload-cloud" size={24} color={theme.colors.success} />
          <Typography style={styles.logoUploadText}>Upload Company Logo</Typography>
          <Typography style={styles.logoUploadSubtext}>Tap to upload</Typography>
          <Typography style={styles.logoUploadSubtext}>PNG, JPG up to 5MB</Typography>
        </TouchableOpacity>
        
        {logoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: logoUri }} style={styles.previewImage} />
            <TouchableOpacity onPress={() => setValue('logo', '')}>
              <Typography style={styles.removeText}>Remove Logo</Typography>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputGroup}>
            <Typography style={styles.label}>Company Name *</Typography>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Enter company name"
              value={value}
              onChangeText={onChange}
              accessibilityLabel="Company Name"
              accessibilityHint="Required. Enter the name of the company."
              accessibilityState={{ invalid: !!error }}
            />
            {error && <Typography style={styles.errorText} accessibilityLiveRegion="polite">{error.message}</Typography>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="industry"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputGroup}>
            <Typography style={styles.label}>Industry *</Typography>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="e.g. Construction, Manufacturing"
              value={value}
              onChangeText={onChange}
              accessibilityLabel="Industry"
              accessibilityHint="Required. Enter the industry type."
              accessibilityState={{ invalid: !!error }}
            />
            {error && <Typography style={styles.errorText} accessibilityLiveRegion="polite">{error.message}</Typography>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="gstNumber"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputGroup}>
            <Typography style={styles.label}>GST Number *</Typography>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Enter GST number"
              value={value}
              onChangeText={onChange}
              autoCapitalize="characters"
              accessibilityLabel="GST Number"
              accessibilityHint="Required. Enter a valid 15-character GST number."
              accessibilityState={{ invalid: !!error }}
            />
            {error && <Typography style={styles.errorText} accessibilityLiveRegion="polite">{error.message}</Typography>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputGroup}>
            <Typography style={styles.label}>Company Email *</Typography>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Enter company email"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Company Email"
              accessibilityHint="Required. Enter a valid email address."
              accessibilityState={{ invalid: !!error }}
            />
            {error && <Typography style={styles.errorText} accessibilityLiveRegion="polite">{error.message}</Typography>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputGroup}>
            <Typography style={styles.label}>Phone Number *</Typography>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Enter phone number"
              value={value}
              onChangeText={onChange}
              keyboardType="phone-pad"
              accessibilityLabel="Phone Number"
              accessibilityHint="Required. Enter a valid phone number."
              accessibilityState={{ invalid: !!error }}
            />
            {error && <Typography style={styles.errorText} accessibilityLiveRegion="polite">{error.message}</Typography>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="website"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputGroup}>
            <Typography style={styles.label}>Website (Optional)</Typography>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Enter website URL"
              value={value}
              onChangeText={onChange}
              keyboardType="url"
              autoCapitalize="none"
              accessibilityLabel="Website URL"
              accessibilityHint="Optional. Enter the company website URL."
              accessibilityState={{ invalid: !!error }}
            />
            {error && <Typography style={styles.errorText} accessibilityLiveRegion="polite">{error.message}</Typography>}
          </View>
        )}
      />

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.cancelBtn} 
          onPress={() => router.replace('/companies')}
          accessibilityRole="button"
          accessibilityLabel="Cancel onboarding"
        >
          <Typography style={styles.cancelBtnText}>Cancel</Typography>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.continueBtn} 
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel="Continue to next step"
        >
          <Typography style={styles.continueBtnText}>Continue</Typography>
          <Feather name="arrow-right" size={16} color={theme.colors.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 24,
  },
  logoUploadContainer: {
    marginBottom: 24,
  },
  logoUploadBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.success,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.successBackground,
  },
  logoUploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  logoUploadSubtext: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  previewContainer: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.md,
    marginBottom: 8,
  },
  removeText: {
    color: theme.colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: 10,
    color: theme.colors.error,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.radius.md,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
    marginRight: 8,
  }
});
