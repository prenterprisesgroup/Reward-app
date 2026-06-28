import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your computer's local IP address
// Find it by running: ipconfig (look for IPv4 Address)
// const DEFAULT_API_URL = 'http://10.99.49.12:5000/api/v1';
const DEFAULT_API_URL = 'http://10.99.49.12:5000';  // Your IP: 10.99.49.12

async function getToken() {
  return AsyncStorage.getItem('token');
}

async function request(path, options = {}) {
  const apiUrl = DEFAULT_API_URL;
  const token = await getToken();

  try {
    console.log("API URL:", `${apiUrl}${path}`);
    const response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      } ,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.log("FETCH ERROR:", error);
    throw error;
  }
}

export default {
  request,
};
