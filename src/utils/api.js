import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";

export async function getSendbirdToken() {
  try {
    const data = await apiClient.get("auth/sendbird-token");
    console.log(data);
    AsyncStorage.setItem("SENDBIRD_TOKEN", data.data.data.sendbirdToken);
  } catch (err) {
    return null;
  }
}
