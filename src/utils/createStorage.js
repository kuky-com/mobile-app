import AsyncStorage from "@react-native-async-storage/async-storage";

export const createStorage = (key, stringify = true) => ({
  async get() {
    const item = await AsyncStorage.getItem(key);
    if (item) {
      if (stringify) {
        return JSON.parse(item);
      } else {
        return item;
      }
    } else {
      return null;
    }
  },
  update(val) {
    if (val) {
      const item = stringify ? JSON.stringify(val) : val;
      return AsyncStorage.setItem(key, item);
    } else {
      return AsyncStorage.removeItem(key);
    }
  },
});
