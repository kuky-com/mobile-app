import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const apiClient = axios.create({
  // baseURL: 'http://192.168.1.168:8000/api',
  // // baseURL: "http://192.168.165.237:8000/api",
  // baseURL: 'https://api.kuky.com/api',
  baseURL: 'https://dev.api.kuky.com/api',
  timeout: 20000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("ACCESS_TOKEN");
    const deviceId = await AsyncStorage.getItem("DEVICE_ID");
    console.log({ token, deviceId });
    if (token && deviceId) {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["Device-Id"] = `${deviceId}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
