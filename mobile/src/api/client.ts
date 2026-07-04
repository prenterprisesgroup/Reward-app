import axios from 'axios';

// Hardcoded for local network testing to bypass Expo .env cache
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.63.130.135:5000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
