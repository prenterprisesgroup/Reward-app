import axios from 'axios';

// Use live backend for release builds, allow env override for local development
const BASE_URL = (__DEV__ && process.env.EXPO_PUBLIC_API_URL)
  ? process.env.EXPO_PUBLIC_API_URL
  : 'https://reward-app-ck2z.onrender.com';

console.log('[API] baseURL:', BASE_URL);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});
