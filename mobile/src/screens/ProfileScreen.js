import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

export default function ProfileScreen() {
  const { user, refreshProfile } = useAuth();
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUpiId(user?.upiId || '');
  }, [user]);

  const handleUpdate = async () => {
    if (!upiId.trim()) {
      Alert.alert('Validation', 'Please enter a valid UPI ID.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.request('/api/v1/system/wallet/upi', {
        method: 'PATCH',
        body: JSON.stringify({ upiId: upiId.trim() }),
      });
      Alert.alert('Success', 'UPI ID updated successfully.');
      await refreshProfile();
    } catch (error) {
      Alert.alert('Update failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name || '-'}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{user?.phone || '-'}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || 'Not set'}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>UPI ID</Text>
          <TextInput
            style={styles.input}
            value={upiId}
            onChangeText={setUpiId}
            autoCapitalize="none"
            placeholder="example@upi"
          />
        </View>

        <Pressable style={styles.button} onPress={handleUpdate} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Save UPI</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  screen: {
    padding: 20,
    gap: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#17202f',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#536071',
  },
  value: {
    fontSize: 16,
    color: '#17202f',
    paddingVertical: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dde4ee',
    paddingHorizontal: 12,
    minHeight: 50,
    fontSize: 16,
    color: '#17202f',
  },
  button: {
    backgroundColor: '#17635a',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});
