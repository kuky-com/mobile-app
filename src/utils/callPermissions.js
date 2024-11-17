import Permissions, { PERMISSIONS } from "react-native-permissions";
import { Platform } from "react-native";

const CALL_PERMISSIONS = Platform.select({
  android: [
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  ],
  ios: [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE],
  default: [],
});

export const askCallPermissions = () => {
  return Permissions.requestMultiple(CALL_PERMISSIONS);
};
