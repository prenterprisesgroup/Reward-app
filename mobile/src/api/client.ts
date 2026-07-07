import axios from 'axios';

// Hardcoded for local network testing to bypass Expo .env cache
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.115.184.12:5000';

console.log('[API] baseURL:', BASE_URL);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
