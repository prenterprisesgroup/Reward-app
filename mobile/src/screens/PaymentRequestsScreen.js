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
  Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

const openPaymentApp = (upiId, amount, name) => {
  // UPI Deep Link Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&tn=NOTE
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=Withdrawal%20Reward`;
  
  Linking.canOpenURL(upiLink)
    .then((supported) => {
      if (supported) {
        Linking.openURL(upiLink);
      } else {
        Alert.alert('Error', 'No UPI app found on this device');
      }
    })
    .catch((err) => {
      console.error('Error opening UPI app:', err);
      Alert.alert('Error', 'Failed to open payment app');
    });
};

export default function PaymentRequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPaymentRequests();
  }, []);

  const loadPaymentRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request('/api/v1/system/withdrawals', {
        method: 'GET',
      });
      setRequests(response.withdrawals || []);
    } catch (error) {
      console.error('Error loading payment requests:', error);
      Alert.alert('Error', 'Failed to load payment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPaymentRequests();
    setRefreshing(false);
  };

  const handlePay = (request) => {
    openPaymentApp(request.upiId, request.amount, user?.name || 'Company Admin');
  };

  const handleApprove = async (requestId) => {
    try {
      await apiClient.request(`/api/v1/system/withdrawals/${requestId}/approve`, {
        method: 'POST',
      });
      Alert.alert('Success', 'Payment approved');
      loadPaymentRequests();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to approve payment');
    }
  };

  const handleMarkPaid = async (requestId) => {
    try {
      await apiClient.request(`/api/v1/system/withdrawals/${requestId}/mark-paid`, {
        method: 'POST',
      });
      Alert.alert('Success', 'Marked as paid');
      loadPaymentRequests();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to mark as paid');
    }
  };

  const handleCopyUPI = async (upiId) => {
    await Clipboard.setStringAsync(upiId);
    Alert.alert('Copied', 'UPI ID copied to clipboard');
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

  if (requests.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.screen}>
          <Text style={styles.title}>Payment Requests</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📋 No pending requests</Text>
            <Text style={styles.emptySubtext}>Workers will request withdrawals here</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.screen}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        <Text style={styles.title}>Payment Requests</Text>
        <Text style={styles.subtitle}>Pending worker withdrawals</Text>

        <View style={styles.requestsList}>
          {requests.map((request) => (
            <View key={request._id} style={styles.requestCard}>
              {/* Header: Worker Name & Status Badge */}
              <View style={styles.cardHeader}>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>{request.worker?.name || 'Unknown'}</Text>
                  <Text style={styles.workerPhone}>{request.worker?.phone}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    request.status === 'PENDING' && styles.statusPending,
                    request.status === 'APPROVED' && styles.statusApproved,
                    request.status === 'PAID' && styles.statusPaid,
                  ]}
                >
                  <Text style={styles.statusText}>{request.status}</Text>
                </View>
              </View>

              {/* Amount & UPI */}
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailValue}>₹{request.amount}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>UPI ID</Text>
                  <Pressable onPress={() => handleCopyUPI(request.upiId)}>
                    <View style={styles.upiContainer}>
                      <Text style={styles.detailValue}>{request.upiId}</Text>
                      <Text style={styles.copyIcon}>📋</Text>
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Request Date */}
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>
                  Requested: {new Date(request.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {request.status === 'PENDING' && (
                  <>
                    <Pressable
                      style={[styles.button, styles.approveButton]}
                      onPress={() => handleApprove(request._id)}
                    >
                      <Text style={styles.approveButtonText}>✓ Approve</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.button, styles.rejectButton]}
                      onPress={() => Alert.alert('Reject', 'Feature coming soon')}
                    >
                      <Text style={styles.rejectButtonText}>✕ Reject</Text>
                    </Pressable>
                  </>
                )}

                {request.status === 'APPROVED' && (
                  <>
                    <Pressable
                      style={[styles.button, styles.payButton]}
                      onPress={() => handlePay(request)}
                    >
                      <Text style={styles.payButtonText}>💳 Open Payment App</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.button, styles.paidButton]}
                      onPress={() => handleMarkPaid(request._id)}
                    >
                      <Text style={styles.paidButtonText}>Mark Paid</Text>
                    </Pressable>
                  </>
                )}

                {request.status === 'PAID' && (
                  <View style={styles.paidStatus}>
                    <Text style={styles.paidStatusText}>✓ Payment Completed</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screen: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#17202f',
    marginBottom: 5,
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

  // Request List
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e7f1',
    gap: 12,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  workerInfo: {
    flex: 1,
    gap: 2,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17202f',
  },
  workerPhone: {
    fontSize: 12,
    color: '#536071',
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusApproved: {
    backgroundColor: '#dbeafe',
  },
  statusPaid: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#17202f',
  },

  // Details Row
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#f9fbfd',
    padding: 10,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#536071',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#17202f',
  },
  upiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyIcon: {
    fontSize: 14,
  },

  // Date Row
  dateRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e7f1',
  },
  dateLabel: {
    fontSize: 12,
    color: '#536071',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  approveButton: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  approveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16a34a',
  },

  rejectButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  rejectButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
  },

  payButton: {
    backgroundColor: '#17635a',
    flex: 1.2,
  },
  payButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  paidButton: {
    backgroundColor: '#e0e7f1',
  },
  paidButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c3748',
  },

  paidStatus: {
    backgroundColor: '#dcfce7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  paidStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16a34a',
  },
});
