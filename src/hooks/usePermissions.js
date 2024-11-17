import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Permissions, { PERMISSIONS } from "react-native-permissions";

const nativePermissionGranted = (stats, limitedCallback) => {
  return Object.values(stats).every((result) => {
    if (result === "granted") {
      return true;
    }
    if (result === "limited") {
      limitedCallback?.();
      return true;
    }
    return false;
  });
};

export const CALL_PERMISSIONS = Platform.select({
  android: [
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  ],
  ios: [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE],
  default: [],
});

export const usePermissions = (perms) => {
  const [state, setState] = (useState < "pending") | "granted" | ("rejected" > "pending");
  useEffect(() => {
    const checkAndRequest = async () => {
      if (Platform.OS === "android") {
        await Permissions.requestNotifications(["alert"]);
      }

      const checkResult = await Permissions.checkMultiple(perms);
      const alreadyGranted = nativePermissionGranted(checkResult);
      if (alreadyGranted) {
        return setState("granted");
      }

      const requestResult = await Permissions.requestMultiple(perms);
      const isGranted = nativePermissionGranted(requestResult);
      setState(isGranted ? "granted" : "rejected");
    };

    checkAndRequest();
  }, []);

  return state;
};
