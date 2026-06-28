import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CompanyDetailScreen({ route, navigation }) {
  const { company } = route.params || {};

  const handleCreateAdmin = () => {
    console.log('Company object:', company);
    console.log('Company ID:', company?.id);
    
    if (!company) {
      Alert.alert('Error', 'Company data is missing.');
      return;
    }

    if (!company.id) {
      Alert.alert('Error', 'Company ID is missing.');
      return;
    }

    console.log('Navigating to CreateCompanyAdmin with companyId:', company.id);
    navigation.navigate('CreateCompanyAdmin', { companyId: company.id });
  };

  const fields = useMemo(
    () => [
      { label: 'Company ID', value: company?.id ?? '-' },
      { label: 'Name', value: company?.name ?? '-' },
      { label: 'Email', value: company?.email ?? '-' },
      { label: 'Phone', value: company?.phone ?? '-' },
      { label: 'Status', value: company?.status ?? '-' },
      { label: 'Created', value: company?.createdAt ? new Date(company.createdAt).toLocaleDateString() : '-' },
    ],
    [company]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.title}>Company details</Text>
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
          onPress={handleCreateAdmin}
        >
          <Text style={styles.buttonText}>Create admin for this company</Text>
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
    marginTop: 16,
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
