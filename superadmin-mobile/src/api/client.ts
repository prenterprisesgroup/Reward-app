import axios from 'axios';

// Fallback to local network IP for testing
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.154.208.12:5000';

console.log('API Client BASE_URL:', BASE_URL);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});
