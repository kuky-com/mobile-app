import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'

const apiClient = axios.create({
  baseURL: 'http://192.168.1.5:8000/api',
  timeout: 10000,                
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('ACCESS_TOKEN')

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
);

export default apiClient;
