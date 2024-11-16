import { SendbirdCalls, SoundType } from "@sendbird/calls-react-native";
import { getSendbirdToken } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
//import RNVoipPushNotification from 'react-native-voip-push-notification';

export const authenticate = async () => {
  const userId = await AsyncStorage.getItem("USER_ID");
  let token = await AsyncStorage.getItem("SENDBIRD_TOKEN");
  if (!token) {
    await getSendbirdToken();
    token = await AsyncStorage.getItem("SENDBIRD_TOKEN");
  }

  if (!userId || !token) {
    throw new Error("Missing sendbird params");
  }

  try {
    const user = await SendbirdCalls.authenticate({
      userId: `${process.env.NODE_ENV}_${userId}`,
      accessToken: token,
    });
    return user;
  } catch (err) {
    //TODO: handle token expired error and rety with refreshed token. TEST THIS.
    await getSendbirdToken();
    token = await AsyncStorage.getItem("SENDBIRD_TOKEN");
    await SendbirdCalls.authenticate({ userId, accessToken: token });
  }
};

export const registerToken = async () => {
  if (Platform.OS === "android") {
    const token = await messaging().getToken();
    await Promise.all([SendbirdCalls.registerPushToken(token, true)]);
  }

  if (Platform.OS === "ios") {
    //TODO: Set for ios
    // RNVoipPushNotification.addEventListener("register", async (voipToken) => {
    //   await Promise.all([SendbirdCalls.ios_registerVoIPPushToken(voipToken, true)]);
    //   RNVoipPushNotification.removeEventListener("register");
    // });
    // RNVoipPushNotification.registerVoipToken();
  }
};
