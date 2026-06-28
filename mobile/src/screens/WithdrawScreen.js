import { useState, useEffect } from 'react';
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
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

export default function WithdrawScreen() {
  const { user, refreshProfile } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [amount, setAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Load company balances from backend
  useEffect(() => {
    loadCompanyBalances();
  }, []);

  const loadCompanyBalances = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request('/api/v1/system/wallet/breakdown', {
        method: 'GET',
      });
      setCompanies(response.companies || []);
    } catch (error) {
      console.error('Error loading company balances:', error);
      Alert.alert('Error', 'Failed to load company balances');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedCompany) {
      Alert.alert('Error', 'Please select a company');
      return;
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 1) {
      Alert.alert('Validation', 'Enter a valid withdrawal amount.');
      return;
    }

    if (numericAmount > selectedCompany.balance) {
      Alert.alert('Error', `Cannot withdraw more than ₹${selectedCompany.balance} from this company`);
      return;
    }

    try {
      setWithdrawLoading(true);
      await apiClient.request('/api/v1/system/withdrawals', {
        method: 'POST',
        body: JSON.stringify({
          amount: numericAmount,
          upiId: user?.upiId,
          company: selectedCompany._id,
        }),
      });
      Alert.alert('Success', 'Withdrawal request submitted.');
      setAmount('');
      setSelectedCompany(null);
      await refreshProfile();
      // Reload balances
      await loadCompanyBalances();
    } catch (error) {
      Alert.alert('Withdrawal failed', error.message);
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#17635a" />
        </View>
      </SafeAreaView>
    );
  }

  if (companies.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.screen}>
          <Text style={styles.title}>Withdraw Earnings</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📱 Scan a barcode first</Text>
            <Text style={styles.emptySubtext}>You'll see company balances here after scanning</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton}>
            <FontAwesome5 name="arrow-left" size={20} color="#17635a" />
          </Pressable>
          <Text style={styles.title}>Withdraw Earnings</Text>
        </View>
        <Text style={styles.subtitle}>Select a company to withdraw from</Text>

        {/* Company Cards */}
        <View style={styles.companiesContainer}>
          {companies.map((company) => (
            <Pressable
              key={company._id}
              style={[
                styles.companyCard,
                selectedCompany?._id === company._id && styles.companyCardSelected,
              ]}
              onPress={() => setSelectedCompany(company)}
            >
              <View style={styles.companyCardContent}>
                <View style={styles.companyIconContainer}>
                  <FontAwesome5 name="building" size={24} color="#17635a" />
                </View>
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{company.name}</Text>
                  <Text style={styles.companyBalance}>₹{company.balance}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.selectIndicator,
                  selectedCompany?._id === company._id && styles.selectIndicatorSelected,
                ]}
              >
                {selectedCompany?._id === company._id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {selectedCompany && (
          <>
            {/* UPI Display */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Withdrawal Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>UPI ID</Text>
                <Text style={styles.infoValue}>{user?.upiId || 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Available Balance</Text>
                <Text style={[styles.infoValue, { color: '#17635a', fontWeight: '700' }]}>
                  ₹{selectedCompany.balance}
                </Text>
              </View>
            </View>

            {/* Amount Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
                placeholderTextColor="#a0aec0"
              />
              {amount && Number(amount) > selectedCompany.balance && (
                <Text style={styles.errorText}>
                  ⚠️ Cannot exceed ₹{selectedCompany.balance}
                </Text>
              )}
            </View>

            {/* Withdraw Button */}
            <Pressable
              style={[styles.button, withdrawLoading && styles.buttonDisabled]}
              onPress={handleWithdraw}
              disabled={withdrawLoading}
            >
              {withdrawLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Request Withdrawal</Text>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screen: {
    padding: 20,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 5,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#17202f',
  },
  subtitle: {
    fontSize: 14,
    color: '#536071',
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#17202f',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#536071',
  },

  // Company Cards
  companiesContainer: {
    gap: 12,
  },
  companyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e7f1',
  },
  companyCardSelected: {
    borderColor: '#17635a',
    backgroundColor: '#f0fffe',
  },
  companyCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0fffe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInfo: {
    flex: 1,
    gap: 4,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17202f',
  },
  companyBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#17635a',
  },
  selectIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#dde4ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectIndicatorSelected: {
    backgroundColor: '#17635a',
    borderColor: '#17635a',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Sections
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#536071',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7f1',
  },
  infoLabel: {
    fontSize: 13,
    color: '#536071',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#17202f',
  },

  // Input
  input: {
    backgroundColor: '#f9fbfd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dde4ee',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#17202f',
    minHeight: 48,
  },
  errorText: {
    fontSize: 12,
    color: '#e53e3e',
    marginTop: -6,
  },

  // Button
  button: {
    backgroundColor: '#17635a',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
