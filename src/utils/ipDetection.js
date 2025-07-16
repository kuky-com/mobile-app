import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache configuration
const IP_CACHE_KEY = 'cached_user_ip';
const IP_CACHE_TIME_KEY = 'cached_user_ip_time';
const IP_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get the user's public IP address
 * @returns {Promise<string>} The user's public IP address
 */
export const getUserIP = async () => {
  try {
    // Use a free IP detection service
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      timeout: 5000,
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.ip;
    }
    
    // Fallback to another service
    const fallbackResponse = await fetch('https://ipapi.co/ip/', {
      method: 'GET',
      timeout: 5000,
    });
    
    if (fallbackResponse.ok) {
      const ip = await fallbackResponse.text();
      return ip.trim();
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to get user IP:', error);
    
    // Try one more fallback service
    try {
      const response = await fetch('https://httpbin.org/ip', {
        method: 'GET',
        timeout: 5000,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.origin;
      }
    } catch (fallbackError) {
      console.warn('All IP detection services failed:', fallbackError);
    }
    
    return null;
  }
};

/**
 * Get cached IP or fetch new one if cache expired
 * @returns {Promise<string>} The user's IP address
 */
export const getCachedUserIP = async () => {
  try {
    const cachedIP = await AsyncStorage.getItem(IP_CACHE_KEY);
    const cachedTime = await AsyncStorage.getItem(IP_CACHE_TIME_KEY);
    
    const now = Date.now();
    
    // Return cached IP if still valid
    if (cachedIP && cachedTime && (now - parseInt(cachedTime)) < IP_CACHE_DURATION) {
      return cachedIP;
    }
    
    // Fetch new IP and cache it
    const ip = await getUserIP();
    if (ip) {
      await AsyncStorage.setItem(IP_CACHE_KEY, ip);
      await AsyncStorage.setItem(IP_CACHE_TIME_KEY, now.toString());
    }
    
    return ip || cachedIP; // Return new IP or old cached IP if new fetch failed
  } catch (error) {
    console.warn('Failed to get cached IP:', error);
    return await getUserIP(); // Fallback to direct fetch
  }
};

/**
 * Get network information including IP
 * @returns {Promise<Object>} Network information object
 */
export const getNetworkInfo = async () => {
  const ip = await getCachedUserIP();
  
  return {
    ip,
    platform: Platform.OS,
    userAgent: Platform.select({
      ios: `iOS/${Platform.Version}`,
      android: `Android/${Platform.Version}`,
      default: 'unknown'
    }),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Add IP address to request headers if available
 * @param {Object} headers - Existing headers object
 * @returns {Promise<Object>} Headers with IP information added
 */
export const addIPHeaders = async (headers = {}) => {
  try {
    const networkInfo = await getNetworkInfo();
    
    if (networkInfo.ip) {
      headers['X-Client-IP'] = networkInfo.ip;
    }
    
    headers['X-Client-Platform'] = networkInfo.platform;
    headers['X-Client-User-Agent'] = networkInfo.userAgent;
    headers['X-Client-Timestamp'] = networkInfo.timestamp;
    
    return headers;
  } catch (error) {
    console.warn('Failed to add IP headers:', error);
    return headers;
  }
};

/**
 * Clear cached IP (useful for testing or when network changes)
 */
export const clearIPCache = async () => {
  try {
    await AsyncStorage.removeItem(IP_CACHE_KEY);
    await AsyncStorage.removeItem(IP_CACHE_TIME_KEY);
  } catch (error) {
    console.warn('Failed to clear IP cache:', error);
  }
};
