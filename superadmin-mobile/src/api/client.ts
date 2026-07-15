import axios from 'axios';

// Hardcoded for local network testing to bypass Expo .env cache
const BASE_URL = 'http://10.154.208.12:5000';

console.log('API Client BASE_URL:', BASE_URL);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
