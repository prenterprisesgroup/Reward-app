import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  AsyncStorage,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { FontAwesome5 } from '@expo/vector-icons';
import apiClient from '../api/client';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  backButton: {
    padding: 12,
  },
  cameraHeaderText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  flashButton: {
    alignItems: 'center',
    gap: 4,
  },
  flashText: {
    color: '#ffffff',
    fontSize: 12,
  },
  instructionContainer: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },
  instructionText: {
    color: '#00FF00',
    fontSize: 14,
    fontWeight: '600',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginVertical: 30,
    overflow: 'hidden',
  },
  scanLine: {
    height: 2,
    backgroundColor: '#00FF00',
    width: '100%',
    position: 'absolute',
  },
  scanningStatus: {
    alignItems: 'center',
    marginVertical: 20,
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanningText: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: '600',
  },
  holdSteadyText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
  },
  cameraFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  manualEntryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  infoText: {
    color: '#1565C0',
    fontSize: 13,
  },
});

export default function ScanScreen() {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastRedeemed, setLastRedeemed] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const lastScannedRef = useRef(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (useCamera) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [useCamera, scanLineAnim]);

  const handleBarCodeScanned = async ({ data }) => {
    // Prevent duplicate scans within 1.5 seconds
    const now = Date.now();
    if (lastScannedRef.current && now - lastScannedRef.current < 1500) {
      return;
    }
    lastScannedRef.current = now;

    setScannedBarcode(data);
    await redeemBarcode(data);
  };

  const handleRedeemBarcode = async () => {
    if (!barcodeInput.trim()) {
      Alert.alert('Error', 'Please enter a barcode number');
      return;
    }
    await redeemBarcode(barcodeInput.trim());
  };

  const redeemBarcode = async (barcode) => {
    try {
      setLoading(true);
      const response = await apiClient.request(
        `/api/v1/system/scan`,
        { 
          method: 'POST',
          body: JSON.stringify({ code: barcode })
        }
      );

      console.log('Barcode response:', response);
      const rewardAmount = response.barcode?.rewardAmount || 0;
      const companyId = response.barcode?.company?._id;
      const companyName = response.barcode?.company?.name;
      console.log('Reward amount from barcode:', rewardAmount);
      console.log('Company from barcode:', companyId, companyName);
      
      // Save company info for withdrawal (store as JSON array of companies)
      if (companyId && companyName) {
        try {
          const existingStr = await AsyncStorage.getItem('scannedCompanies');
          let companies = existingStr ? JSON.parse(existingStr) : [];
          
          // Check if company already exists, if not add it
          const companyExists = companies.some(c => c._id === companyId);
          if (!companyExists) {
            companies.push({ _id: companyId, name: companyName });
            await AsyncStorage.setItem('scannedCompanies', JSON.stringify(companies));
          }
        } catch (error) {
          console.error('Error saving company:', error);
        }
      }
      
      setLastRedeemed(`₹${rewardAmount}`);
      Alert.alert('✅ Success', `Barcode redeemed!\n\nReward: ₹${rewardAmount}`, [
        {
          text: 'OK',
          onPress: () => {
            setBarcodeInput('');
            setScannedBarcode('');
          },
        },
      ]);
    } catch (error) {
      console.error('Barcode error:', error);
      Alert.alert('❌ Error', error.message || 'Failed to redeem barcode');
    } finally {
      setLoading(false);
    }
  };

  // Camera Scanner View
  if (useCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={loading ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
        <View style={styles.cameraOverlay}>
          {/* Header */}
          <View style={styles.cameraHeader}>
            <Pressable style={styles.backButton} onPress={() => setUseCamera(false)}>
              <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
            </Pressable>
            <Text style={styles.cameraHeaderText}>Scan Barcode</Text>
            <Pressable style={styles.flashButton}>
              <FontAwesome5 name="bolt" size={20} color="#ffffff" />
              <Text style={styles.flashText}>Flash</Text>
            </Pressable>
          </View>

          {/* Instruction */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Align barcode within the frame</Text>
          </View>

          {/* Scanner Frame */}
          <View style={styles.scannerFrame}>
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: scanLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 200],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* Scanning Status */}
          <View style={styles.scanningStatus}>
            <View style={styles.scanningIndicator}>
              <ActivityIndicator size="small" color="#00FF00" />
              <Text style={styles.scanningText}>Scanning...</Text>
            </View>
            <Text style={styles.holdSteadyText}>Hold steady for best results</Text>
          </View>

          {/* Manual Entry Button */}
          <View style={styles.cameraFooter}>
            <Pressable style={styles.manualEntryButton} onPress={() => setUseCamera(false)}>
              <FontAwesome5 name="keyboard" size={20} color="#ffffff" />
              <Text style={styles.manualEntryText}>Enter barcode manually</Text>
              <FontAwesome5 name="arrow-right" size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Manual Input View
  return (
    <SafeAreaView style={[styles.container, { justifyContent: 'center', paddingHorizontal: 20 }]}>
      <Text style={styles.title}>📱 Scan Barcode</Text>
      <Text style={styles.subtitle}>Enter barcode number to redeem your reward</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Tip: You can manually enter the barcode number from your product packaging or receipt.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Barcode Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 123456789012"
          value={barcodeInput}
          onChangeText={setBarcodeInput}
          editable={!loading}
          keyboardType="number-pad"
          placeholderTextColor="#999"
        />

        <Pressable
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleRedeemBarcode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>💰 Redeem Barcode</Text>
          )}
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: '#34C759' }]}
          onPress={() => setUseCamera(true)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>📷 Use Camera Scanner</Text>
        </Pressable>

        {lastRedeemed && (
          <Text style={styles.successText}>Last reward: {lastRedeemed}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
