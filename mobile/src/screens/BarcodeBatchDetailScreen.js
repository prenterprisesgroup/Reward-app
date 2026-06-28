import { useMemo } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

export default function BarcodeBatchDetailScreen({ route }) {
  const { batch } = route.params || {};

  const handleDownloadPDF = async () => {
    if (!batch?._id) {
      Alert.alert('Error', 'Batch ID is missing.');
      return;
    }

    try {
      Alert.alert('Download', 'Opening PDF download...');
      
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Authentication token is missing. Please log in again.');
        return;
      }

      // Use the same base URL as API client
      const apiUrl = 'http://10.99.49.12:5000';
      const pdfUrl = `${apiUrl}/api/v1/system/barcode-batches/${batch._id}/pdf`;
      
      // Use fetch with proper authorization header
      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // On mobile, we can try to open the URL in browser with token, or show instructions
      const urlWithToken = `${pdfUrl}?token=${token}`;
      const canOpen = await Linking.canOpenURL(urlWithToken);
      
      if (canOpen) {
        await Linking.openURL(urlWithToken);
      } else {
        Alert.alert(
          'Download Started',
          'The PDF is being downloaded. Check your downloads folder.'
        );
      }
    } catch (error) {
      console.error('PDF Download Error:', error);
      Alert.alert('Download failed', error.message || 'Unable to download PDF');
    }
  };

  const fields = useMemo(
    () => [
      { label: 'Product name', value: batch?.productName ?? '-' },
      { label: 'Reward amount', value: batch?.rewardAmount ? `₹${batch.rewardAmount}` : '-' },
      { label: 'Quantity', value: batch?.quantity ?? '-' },
      { label: 'Generated count', value: batch?.generatedCount ?? '-' },
      { label: 'Status', value: batch?.status ?? '-' },
      { label: 'Expires at', value: batch?.expiresAt ? new Date(batch.expiresAt).toLocaleDateString() : 'None' },
      { label: 'Batch ID', value: batch?._id ?? '-' },
    ],
    [batch]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.title}>Batch details</Text>
        <View style={styles.card}>
          {fields.map((item) => (
            <View key={item.label} style={styles.row}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          ))}
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleDownloadPDF}
        >
          <Text style={styles.buttonText}>📥 Download Barcodes PDF</Text>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dde4ee',
    padding: 18,
    gap: 14,
  },
  row: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#536071',
  },
  value: {
    fontSize: 16,
    color: '#17202f',
  },
  button: {
    backgroundColor: '#17635a',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonPressed: {
    backgroundColor: '#0f4a3f',
    opacity: 0.8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});
