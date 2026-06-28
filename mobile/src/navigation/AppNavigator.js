import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterWorkerScreen from '../screens/RegisterWorkerScreen';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import PaymentRequestsScreen from '../screens/PaymentRequestsScreen';
import CreateBarcodeBatchScreen from '../screens/CreateBarcodeBatchScreen';
import BarcodeBatchesScreen from '../screens/BarcodeBatchesScreen';
import BarcodeBatchDetailScreen from '../screens/BarcodeBatchDetailScreen';
import CreateCompanyScreen from '../screens/CreateCompanyScreen';
import CompaniesScreen from '../screens/CompaniesScreen';
import CompanyDetailScreen from '../screens/CompanyDetailScreen';
import CreateCompanyAdminScreen from '../screens/CreateCompanyAdminScreen';
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Scan" component={ScanScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="Withdraw" component={WithdrawScreen} />
            <Stack.Screen name="PaymentRequests" component={PaymentRequestsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="CreateBarcodeBatch" component={CreateBarcodeBatchScreen} />
            <Stack.Screen name="BarcodeBatches" component={BarcodeBatchesScreen} />
            <Stack.Screen name="BarcodeBatchDetail" component={BarcodeBatchDetailScreen} />
            <Stack.Screen name="CreateCompany" component={CreateCompanyScreen} />
            <Stack.Screen name="CompaniesScreen" component={CompaniesScreen} />
            <Stack.Screen name="CompanyDetail" component={CompanyDetailScreen} />
            <Stack.Screen name="CreateCompanyAdmin" component={CreateCompanyAdminScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterWorkerScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
