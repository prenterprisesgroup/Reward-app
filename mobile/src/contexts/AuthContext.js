import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('apiUrl');
      const savedToken = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.warn('Failed to load session', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const signIn = async ({ phone, password }) => {
    const response = await apiClient.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });

    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const registerWorker = async ({ name, phone, email, password, upiId }) => {
    const response = await apiClient.request('/api/v1/auth/register-worker', {
      method: 'POST',
      body: JSON.stringify({ name, phone, email, password, upiId }),
    });

    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    const response = await apiClient.request('/api/v1/auth/me');
    setUser(response.user);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, registerWorker, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
