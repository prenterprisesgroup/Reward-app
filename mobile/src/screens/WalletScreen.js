import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import apiClient from '../api/client';

export default function WalletScreen() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const data = await apiClient.request('/api/v1/system/wallet');
      setWallet(data);
    } catch (error) {
      setWallet({ walletBalance: 0, transactions: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator size="large" color="#17635a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.panel}>
        <Text style={styles.panelLabel}>Wallet balance</Text>
        <Text style={styles.panelAmount}>₹{wallet?.walletBalance ?? 0}</Text>
      </View>
      <Text style={styles.sectionTitle}>Recent transactions</Text>
      <FlatList
        data={wallet?.transactions || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <Text style={styles.transactionType}>{item.type}</Text>
            <Text style={styles.transactionAmount}>₹{item.amount}</Text>
            <Text style={styles.transactionDate}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    padding: 20,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dde4ee',
    padding: 18,
    marginBottom: 18,
  },
  panelLabel: {
    color: '#536071',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  panelAmount: {
    marginTop: 12,
    fontSize: 32,
    fontWeight: '900',
    color: '#17202f',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#17202f',
    marginBottom: 12,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dde4ee',
    padding: 14,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#17202f',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#17635a',
    marginTop: 4,
  },
  transactionDate: {
    color: '#536071',
    marginTop: 6,
    fontSize: 12,
  },
  separator: {
    height: 12,
  },
  emptyText: {
    color: '#536071',
    textAlign: 'center',
    marginTop: 28,
  },
  list: {
    paddingBottom: 30,
  },
});
