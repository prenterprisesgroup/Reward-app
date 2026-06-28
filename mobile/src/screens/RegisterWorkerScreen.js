import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterWorkerScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerWorker } = useAuth();

  const handleRegister = async () => {
    try {
      setLoading(true);
      await registerWorker({ name, phone, email, password, upiId });
    } catch (error) {
      Alert.alert('Registration failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView contentContainerStyle={styles.screen}>
          <View style={styles.header}>
            <Text style={styles.title}>Worker Signup</Text>
            <Text style={styles.subtitle}>Create your worker account to access the rewards app.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="9999999999"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="email@example.com"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>UPI ID</Text>
              <TextInput style={styles.input} value={upiId} onChangeText={setUpiId} autoCapitalize="none" placeholder="example@upi" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
              />
            </View>

            <Pressable style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign up</Text>
              )}
            </Pressable>

            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Back to login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  keyboard: {
    flex: 1,
  },
  screen: {
    flexGrow: 1,
    padding: 20,
    gap: 18,
  },
  header: {
    paddingTop: 18,
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#17202f',
  },
  subtitle: {
    fontSize: 16,
    color: '#536071',
  },
  form: {
    backgroundColor: '#ffffff',
    borderColor: '#dde4ee',
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c3748',
  },
  input: {
    backgroundColor: '#f9fbfd',
    borderColor: '#d6deea',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 50,
    fontSize: 16,
    color: '#17202f',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#17635a',
    borderRadius: 8,
    minHeight: 50,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  linkText: {
    marginTop: 12,
    color: '#17635a',
    textAlign: 'center',
    fontWeight: '700',
  },
});
