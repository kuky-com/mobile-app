import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavigationService from './NavigationService'
import Toast from "react-native-toast-message";
import { addIPHeaders } from './ipDetection';

const apiClient = axios.create({
  // baseURL: 'http://192.168.1.168:8000/api',
  // baseURL: "http://192.168.165.237:8000/api",
  // baseURL: 'https://dev.api.kuky.com/api',
  baseURL: 'https://api.kuky.com/api',
  timeout: 40000,
});

// export const NODE_ENV = 'development'
export const NODE_ENV = 'production'

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("ACCESS_TOKEN");
    const deviceId = await AsyncStorage.getItem("DEVICE_ID");
    console.log({ token, deviceId });
    
    // Add authentication headers
    if (token && deviceId) {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["Device-Id"] = `${deviceId}`;
    }

    // Add IP and network information headers
    try {
      config.headers = await addIPHeaders(config.headers);
    } catch (error) {
      console.warn('Failed to add IP headers to request:', error);
    }

    return config;
  },
  (error) => {
    console.log({ error });
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      try {
        Toast.show({ text1: 'Your session has been expired!', type: 'error' });
        const currentRoute = NavigationService.getCurrentRoute();
        if (currentRoute !== 'SignInScreen') {
          NavigationService.reset('SignInScreen');
        }
      } catch (error) {

      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
