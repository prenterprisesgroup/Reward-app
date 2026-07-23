import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenHeader } from '../../../../components/common/ScreenHeader';
import { InputField } from '../../../../components/forms/InputField';
import { Typography } from '../../../../components/common/Typography';
import { theme } from '../../../../constants/theme';
import { PrimaryButton } from '../../../../components/buttons/PrimaryButton';
import { useCompanyDetailsQuery, useUpdateCompanyMutation } from '../../../../features/companies/hooks/useCompanies';
import { createCompanySchema, CreateCompanyFormValues } from '../../../../features/companies/schemas/createCompany.schema';
import { Skeleton } from '../../../../components/common/ui/Skeleton';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';

export default function EditCompanyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { data, isLoading } = useCompanyDetailsQuery(id as string);
  const { mutate: updateCompany, isPending } = useUpdateCompanyMutation();

  const [imageUri, setImageUri] = useState<string | null>(null);

  const form = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    mode: 'onChange',
  });

  const { control, handleSubmit, formState: { errors, isDirty, isValid }, reset } = form;



  useEffect(() => {
    if (data?.company) {
      const c = data.company;
      reset({
        name: c.name || '',
        industry: c.industry || '',
        gstNumber: c.gstNumber || '',
        email: c.email || '',
        phone: c.phone || '',
        website: c.website || '',
        addressLine: c.address?.line1 || '',
        city: c.address?.city || '',
        state: c.address?.state || '',
        pincode: c.address?.pincode || '',
        country: c.address?.country || 'India',
        settlementMethod: c.settlementMethod === 'AUTOMATIC' ? 'UPI' : 'BANK',
        upiId: c.upiId || '',
        bankAccount: c.bankAccount?.accountNumber || '',
        ifscCode: c.bankAccount?.ifscCode || '',
        settlementContact: c.bankAccount?.accountHolderName || '',
      });
      if (c.logoUrl) {
        setImageUri(c.logoUrl);
      }
    }
  }, [data, reset]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // We manually mark as dirty because imageUri is not in react-hook-form state
      form.setValue('logo', result.assets[0].uri, { shouldDirty: true });
    }
  };

  const onSubmit = (values: CreateCompanyFormValues) => {
    if (!id) return;

    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('industry', values.industry);
    formData.append('gstNumber', values.gstNumber);
    formData.append('email', values.email);
    formData.append('phone', values.phone);
    if (values.website) formData.append('website', values.website);
    
    formData.append('address', JSON.stringify({
      line1: values.addressLine,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
      country: values.country,
    }));

    if (values.settlementMethod === 'UPI') {
      formData.append('upiId', values.upiId || '');
    } else {
      formData.append('bankAccount', JSON.stringify({
        accountNumber: values.bankAccount,
        ifscCode: values.ifscCode,
        accountHolderName: values.settlementContact,
      }));
    }

    if (imageUri && !imageUri.startsWith('http')) {
      const filename = imageUri.split('/').pop() || 'logo.jpg';
      const match = /\.([^.]+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('logo', { uri: imageUri, name: filename, type } as any);
    }

    updateCompany({ id, data: formData }, {
      onSuccess: () => {
        reset(); // Clear dirty state
        router.back();
      }
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Edit Company" showBack />
        <View style={styles.content}>
          <Skeleton width={100} height={100} borderRadius={50} style={{ alignSelf: 'center', marginBottom: 20 }} />
          <Skeleton height={50} style={{ marginBottom: 10 }} />
          <Skeleton height={50} style={{ marginBottom: 10 }} />
          <Skeleton height={50} style={{ marginBottom: 10 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Edit Company" showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.imagePickerContainer}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Feather name="image" size={32} color={theme.colors.textTertiary} />
                  <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>
                    Change Logo
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Typography variant="headingSm" weight="semiBold" style={styles.sectionTitle}>Basic Info</Typography>
            
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Company Name"
                  placeholder="e.g. Acme Corp"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="industry"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Industry"
                  placeholder="e.g. Manufacturing"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.industry?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="gstNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="GST Number"
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.gstNumber?.message}
                  autoCapitalize="characters"
                />
              )}
            />
          </View>

          <View style={styles.section}>
            <Typography variant="headingSm" weight="semiBold" style={styles.sectionTitle}>Contact</Typography>
            
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Email"
                  placeholder="admin@company.com"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Phone"
                  placeholder="9876543210"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                />
              )}
            />

            <Controller
              control={control}
              name="website"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Website (Optional)"
                  placeholder="https://company.com"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.website?.message}
                  autoCapitalize="none"
                />
              )}
            />
          </View>

          <View style={styles.section}>
            <Typography variant="headingSm" weight="semiBold" style={styles.sectionTitle}>Address</Typography>

            <Controller
              control={control}
              name="addressLine"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Address Line 1"
                  placeholder="Street address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.addressLine?.message}
                />
              )}
            />

            <View style={styles.row}>
              <View style={[styles.col, { marginRight: theme.spacing.sm }]}>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                      label="City"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.city?.message}
                    />
                  )}
                />
              </View>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="pincode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                      label="Pincode"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.pincode?.message}
                      keyboardType="number-pad"
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.col, { marginRight: theme.spacing.sm }]}>
                <Controller
                  control={control}
                  name="state"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                      label="State"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.state?.message}
                    />
                  )}
                />
              </View>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="country"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                      label="Country"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.country?.message}
                    />
                  )}
                />
              </View>
            </View>
          </View>

          <View style={[styles.section, { paddingBottom: 100 }]}>
            <Typography variant="headingSm" weight="semiBold" style={styles.sectionTitle}>Settlement Details</Typography>

            <Controller
              control={control}
              name="settlementMethod"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.row, { marginBottom: theme.spacing.md }]}>
                  <TouchableOpacity
                    style={[
                      styles.radio,
                      value === 'UPI' && styles.radioActive,
                      { marginRight: theme.spacing.sm }
                    ]}
                    onPress={() => onChange('UPI')}
                  >
                    <Typography 
                      weight={value === 'UPI' ? 'bold' : 'regular'}
                      color={value === 'UPI' ? 'primary' : 'textPrimary'}
                    >
                      UPI
                    </Typography>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.radio,
                      value === 'BANK' && styles.radioActive
                    ]}
                    onPress={() => onChange('BANK')}
                  >
                    <Typography 
                      weight={value === 'BANK' ? 'bold' : 'regular'}
                      color={value === 'BANK' ? 'primary' : 'textPrimary'}
                    >
                      Bank Transfer
                    </Typography>
                  </TouchableOpacity>
                </View>
              )}
            />

            <Controller
              control={control}
              name="settlementContact"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Account Holder Name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.settlementContact?.message}
                />
              )}
            />

            {form.watch('settlementMethod') === 'BANK' ? (
              <>
                <Controller
                  control={control}
                  name="bankAccount"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                      label="Bank Account Number"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.bankAccount?.message}
                      keyboardType="number-pad"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="ifscCode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                      label="IFSC Code"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.ifscCode?.message}
                      autoCapitalize="characters"
                    />
                  )}
                />
              </>
            ) : (
              <Controller
                control={control}
                name="upiId"
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField
                    label="UPI ID"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.upiId?.message}
                    autoCapitalize="none"
                  />
                )}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Save Changes" 
          onPress={handleSubmit(onSubmit)} 
          loading={isPending}
          disabled={!isDirty || isPending}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  radio: {
    flex: 1,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  radioActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  footer: {
    padding: theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});


