import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../components/common/Typography';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { InputField } from '../../components/forms/InputField';
import { ArrowLeft, Camera, User, Phone, Mail, Shield } from 'lucide-react-native';
import { useRouter, useNavigation } from 'expo-router';
import { theme } from '../../constants/theme';
import { useUserQuery } from '../../hooks/useUserQuery';
import { useUpdateProfileMutation, useUploadProfileImageMutation } from '../../hooks/useUpdateProfileMutation';
import * as ImagePicker from 'expo-image-picker';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Card } from '../../components/cards/Card';
import { useQueryClient } from '@tanstack/react-query';

export default function EditProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useUserQuery();
  const updateProfile = useUpdateProfileMutation();
  const uploadImage = useUploadProfileImageMutation();
  const { toastConfig, showToast, hideToast } = useToast();
  const queryClient = useQueryClient();

  const user = data?.user;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  // Initialize data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setPhotoUri(user.profilePhotoUrl || null);
    }
  }, [user]);

  const isDirty = useMemo(() => {
    if (!user) return false;
    return (
      name !== (user.name || '') ||
      phone !== (user.phone || '') ||
      email !== (user.email || '')
    );
  }, [name, phone, email, user]);

  // Handle unsaved changes warning
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isDirty || updateProfile.isSuccess) {
        return;
      }
      
      e.preventDefault();
      setPendingAction(e.data.action);
      setShowExitModal(true);
    });

    return unsubscribe;
  }, [navigation, isDirty, updateProfile.isSuccess]);

  const handleDiscard = () => {
    setShowExitModal(false);
    if (pendingAction) {
      navigation.dispatch(pendingAction);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      showToast('Permission required to access photos', 'warning');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'profile-photo.jpg',
      } as any);

      uploadImage.mutate(formData, {
        onSuccess: () => {
          showToast('Profile photo updated', 'success');
          queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (error: any) => {
          showToast(error.response?.data?.message || 'Failed to upload profile photo', 'error');
          setPhotoUri(user?.profilePhotoUrl || null);
        }
      });
    }
  };

  const validate = () => {
    if (!name.trim()) return 'Name cannot be empty';
    if (!/^\d{10}$/.test(phone)) return 'Phone number must be exactly 10 digits';
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const handleSave = () => {
    const errorMsg = validate();
    if (errorMsg) {
      showToast(errorMsg, 'error');
      return;
    }

    updateProfile.mutate({ name, phone, email }, {
      onSuccess: () => {
        showToast('Profile updated successfully', 'success');
        queryClient.invalidateQueries({ queryKey: ['user'] });
        setTimeout(() => {
          router.back();
        }, 1500);
      },
      onError: (error: any) => {
        showToast(error.response?.data?.message || 'Failed to update profile', 'error');
      }
    });
  };

  const getInitials = useCallback((nameStr: string) => {
    if (!nameStr) return '';
    return nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }, []);

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
          <Typography style={styles.title}>Edit Profile</Typography>
          <View style={{ width: 44 }} />
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            
            <Card style={styles.heroCard}>
              <View style={styles.heroContent}>
                <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} style={styles.avatarContainer}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Typography style={styles.avatarFallbackText}>{getInitials(user?.name || '')}</Typography>
                    </View>
                  )}
                  
                  {uploadImage.isPending && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="small" color="#FFF" />
                    </View>
                  )}
                  
                  <View style={styles.cameraBtn}>
                    <Camera size={14} color="#FFF" />
                  </View>
                </TouchableOpacity>
                <View style={styles.heroInfo}>
                  <Typography style={styles.heroName} numberOfLines={1}>{user?.name || 'Worker'}</Typography>
                  <View style={styles.badgesRow}>
                    <View style={styles.workerIdBadge}>
                      <Typography style={styles.workerIdText}>Worker ID: WR-10248</Typography> 
                    </View>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <Shield size={12} color={theme.colors.primary} />
                    <Typography style={styles.verifiedText}>Verified</Typography>
                  </View>
                </View>
              </View>
            </Card>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Typography style={styles.label}>Full Name</Typography>
                <InputField
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  leftIcon={<User size={20} color={theme.colors.textSecondary} />}
                />
              </View>

              <View style={styles.inputGroup}>
                <Typography style={styles.label}>Phone Number</Typography>
                <InputField
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter 10-digit phone number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  leftIcon={<Phone size={20} color={theme.colors.textSecondary} />}
                />
              </View>

              <View style={styles.inputGroup}>
                <Typography style={styles.label}>Email Address (Optional)</Typography>
                <InputField
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Mail size={20} color={theme.colors.textSecondary} />}
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.cancelBtn, (updateProfile.isPending || uploadImage.isPending) && { opacity: 0.5 }]} 
            disabled={updateProfile.isPending || uploadImage.isPending}
          >
            <Typography style={styles.cancelBtnText}>Cancel</Typography>
          </TouchableOpacity>
          <PrimaryButton 
            title="Save Changes" 
            onPress={handleSave} 
            style={styles.saveBtn} 
            loading={updateProfile.isPending}
            disabled={uploadImage.isPending || !isDirty}
          />
        </View>
      </KeyboardAvoidingView>
      
      <ConfirmationModal
        visible={showExitModal}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to discard them and leave?"
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
  
  heroCard: { padding: 20, marginBottom: 32, overflow: 'hidden', backgroundColor: '#FFF', borderRadius: 24, ...theme.shadows.sm },
  heroContent: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 20 },
  avatarImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.surface },
  avatarFallback: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  avatarFallbackText: { fontSize: 28, fontWeight: '700', color: theme.colors.primary },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  badgesRow: { flexDirection: 'row', marginBottom: 6 },
  workerIdBadge: { backgroundColor: '#F1F3F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  workerIdText: { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  verifiedText: { fontSize: 11, fontWeight: '600', color: theme.colors.primary, marginLeft: 4 },

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
