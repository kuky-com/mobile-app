import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'

const apiClient = axios.create({
  // baseURL: 'http://192.168.1.18:8000/api',
  baseURL: 'https://api.kuky.com/api',
  timeout: 20000,                
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('ACCESS_TOKEN')
    console.log({token})
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
