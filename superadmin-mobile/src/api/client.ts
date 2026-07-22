import axios from 'axios';
import { Platform } from 'react-native';

// Bypassing .env cache. 
// Web uses localhost. Mobile uses LAN IP.
const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://10.130.66.135:5000';

console.log('API Client BASE_URL:', BASE_URL);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});
