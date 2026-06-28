import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../api/client';

export default function BarcodeBatchesScreen({ navigation }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const response = await apiClient.request('/api/v1/system/barcode-batches');
      setBatches(response.batches || []);
    } catch (error) {
      setBatches([]);
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
      <View style={styles.header}>
        <Text style={styles.title}>Barcode batches</Text>
        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate('CreateBarcodeBatch')}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </View>
      <FlatList
        data={batches}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('BarcodeBatchDetail', { batch: item })}
          >
            <Text style={styles.cardTitle}>{item.productName}</Text>
            <Text style={styles.cardMeta}>Reward: ₹{item.rewardAmount}</Text>
            <Text style={styles.cardMeta}>Quantity: {item.quantity}</Text>
            <Text style={styles.cardMeta}>Status: {item.status}</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No barcode batches found.</Text>}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#17202f',
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#17635a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  list: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dde4ee',
    padding: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#17202f',
    marginBottom: 6,
  },
  cardMeta: {
    color: '#536071',
    fontSize: 14,
  },
  separator: {
    height: 12,
  },
  emptyText: {
    color: '#536071',
    textAlign: 'center',
    marginTop: 28,
  },
});
