import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

export default function CreateBarcodeBatchScreen({ navigation }) {
  const { user } = useAuth();
  const [productName, setProductName] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user can create barcode batches
  const isCompanyUser = user?.role === 'COMPANY_ADMIN' || user?.role === 'COMPANY_STAFF';

  const handleCreate = async () => {
    if (!isCompanyUser) {
      Alert.alert('Permission Denied', 'Only company admins and staff can create barcode batches.');
      return;
    }

    if (!productName.trim() || !rewardAmount.trim() || !quantity.trim()) {
      Alert.alert('Validation', 'Please fill in product, reward, and quantity.');
      return;
    }

    const payload = {
      productName: productName.trim(),
      rewardAmount: Number(rewardAmount),
      quantity: Number(quantity),
    };

    if (expiresAt.trim()) {
      payload.expiresAt = expiresAt.trim();
    }

    try {
      setLoading(true);
      await apiClient.request('/api/v1/system/barcode-batches', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      Alert.alert('Success', 'Barcode batch created successfully.');
      navigation.navigate('BarcodeBatches');
    } catch (error) {
      Alert.alert('Create failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isCompanyUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.screen}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>🚫</Text>
            <Text style={styles.errorTitle}>Permission Denied</Text>
            <Text style={styles.errorMessage}>
              Only company admins and staff members can create barcode batches.
            </Text>
            <Text style={styles.userRole}>Your role: {user?.role}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.title}>Create Barcode Batch</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Product name</Text>
          <TextInput
            style={styles.input}
            value={productName}
            onChangeText={setProductName}
            placeholder="Enter product name"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Reward amount</Text>
          <TextInput
            style={styles.input}
            value={rewardAmount}
            onChangeText={setRewardAmount}
            placeholder="Enter reward amount"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Enter quantity"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Expires at</Text>
          <TextInput
            style={styles.input}
            value={expiresAt}
            onChangeText={setExpiresAt}
            placeholder="YYYY-MM-DD (optional)"
          />
        </View>
        <Pressable style={styles.button} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Create batch</Text>}
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
    fontSize: 28,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorIcon: {
    fontSize: 64,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#17202f',
  },
  errorMessage: {
    fontSize: 16,
    color: '#536071',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 12,
  },
});
