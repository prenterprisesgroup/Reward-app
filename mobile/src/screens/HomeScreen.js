import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

export default function HomeScreen({ navigation }) {
  const { user, signOut, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshProfile().catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await apiClient.request('/api/v1/auth/logout', { method: 'POST' });
    } catch (error) {
      // ignore logout API errors and continue clearing local state
    } finally {
      setLoading(false);
      signOut();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.kicker}>{user?.role || 'Worker'}</Text>
            <Text style={styles.title}>{user?.name || 'Reward wallet'}</Text>
          </View>
          <Pressable style={styles.ghostButton} onPress={handleLogout} disabled={loading}>
            <Text style={styles.ghostButtonText}>{loading ? 'Logging out...' : 'Logout'}</Text>
            <FontAwesome5 name="sign-out-alt" size={14} color="#17635a" style={styles.logoutIcon} />
          </Pressable>
        </View>

        {user?.role === 'WORKER' && (
          <View style={styles.balancePanel}>
            <View style={styles.balanceHeader}>
              <Text style={styles.panelLabel}>Wallet balance</Text>
              <FontAwesome5 name="wallet" size={20} color="#888888" />
            </View>
            <Text style={styles.balance}>₹{user?.walletBalance ?? 0}</Text>
            <Text style={styles.panelMeta}>{user?.phone}</Text>
          </View>
        )}

        <View style={styles.actionGrid}>
          {user?.role === 'SUPER_ADMIN' && (
            <>
              <Pressable style={styles.actionCard} onPress={() => navigation.navigate('CompaniesScreen')}>
                <Text style={styles.actionTitle}>Companies</Text>
                <Text style={styles.actionBody}>Create and manage companies.</Text>
              </Pressable>
            </>
          )}

          {user?.role === 'COMPANY_ADMIN' && (
            <>
              <Pressable style={styles.actionCard} onPress={() => navigation.navigate('BarcodeBatches')}>
                <Text style={styles.actionTitle}>Barcode batches</Text>
                <Text style={styles.actionBody}>Create and view barcode batches.</Text>
              </Pressable>
              <Pressable style={styles.actionCard} onPress={() => navigation.navigate('PaymentRequests')}>
                <Text style={styles.actionTitle}>Payment Requests</Text>
                <Text style={styles.actionBody}>Approve worker withdrawal requests.</Text>
              </Pressable>
              <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.actionTitle}>Profile</Text>
                <Text style={styles.actionBody}>Update contact details.</Text>
              </Pressable>
            </>
          )}

          {user?.role === 'WORKER' && (
            <>
              <Pressable style={styles.scanQRButton} onPress={() => navigation.navigate('Scan')}>
                <View style={styles.scanQRInner}>
                  <FontAwesome5 name="qrcode" size={32} color="#ffffff" />
                  <Text style={styles.scanQRText}>SCAN QR</Text>
                </View>
              </Pressable>
              <Text style={styles.scanQRDescription}>Scan a reward barcode and credit your wallet</Text>

              <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Wallet')}>
                <View style={styles.actionCardHeader}>
                  <FontAwesome5 name="wallet" size={24} color="#17635a" />
                  <Text style={styles.actionTitle}>Wallet</Text>
                </View>
                <Text style={styles.actionBody}>View balance and recent transactions.</Text>
              </Pressable>
              <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Withdraw')}>
                <View style={styles.actionCardHeader}>
                  <FontAwesome5 name="money-bill-wave" size={24} color="#17635a" />
                  <Text style={styles.actionTitle}>Withdraw</Text>
                </View>
                <Text style={styles.actionBody}>Request payout to your UPI account.</Text>
              </Pressable>
              <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Profile')}>
                <View style={styles.actionCardHeader}>
                  <FontAwesome5 name="user" size={24} color="#17635a" />
                  <Text style={styles.actionTitle}>Profile</Text>
                </View>
                <Text style={styles.actionBody}>Update UPI and contact details.</Text>
              </Pressable>
            </>
          )}

          {user?.role === 'COMPANY_STAFF' && (
            <>
              <Pressable style={styles.actionCard} onPress={() => navigation.navigate('BarcodeBatches')}>
                <Text style={styles.actionTitle}>Barcode batches</Text>
                <Text style={styles.actionBody}>Create and view barcode batches.</Text>
              </Pressable>
              <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.actionTitle}>Profile</Text>
                <Text style={styles.actionBody}>Update contact details.</Text>
              </Pressable>
            </>
          )}
        </View>
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
    gap: 20,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  kicker: {
    color: '#17635a',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#17202f',
    fontSize: 28,
    fontWeight: '700',
  },
  ghostButton: {
    borderColor: '#17635a',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ghostButtonText: {
    color: '#17635a',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutIcon: {
    marginLeft: 4,
  },
  balancePanel: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    gap: 6,
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelLabel: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balance: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '700',
  },
  panelMeta: {
    color: '#aaaaaa',
    fontSize: 14,
  },
  scanQRButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17635a',
    borderRadius: 100,
    height: 120,
    width: 120,
    alignSelf: 'center',
  },
  scanQRInner: {
    alignItems: 'center',
    gap: 8,
  },
  scanQRText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  scanQRDescription: {
    color: '#666666',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  actionGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    padding: 18,
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionTitle: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
  },
  actionBody: {
    color: '#666666',
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
