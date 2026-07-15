import axios from 'axios';

// Use live backend by default, fallback to local for development
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://reward-app-ck2z.onrender.com';

console.log('[API] baseURL:', BASE_URL);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});
