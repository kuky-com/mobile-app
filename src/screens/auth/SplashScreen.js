import { pushTokenAtom, tokenAtom, userAtom } from "@/actions/global";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import Text from "@/components/Text";
import apiClient from "@/utils/apiClient";
import colors from "@/utils/colors";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { getAuthenScreen } from "@/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";
import { authenticate, registerToken } from "../../utils/sendbird";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "white",
  },
});

const SplashScreen = ({ navigation }) => {
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(tokenAtom);
  const pushToken = useAtomValue(pushTokenAtom);
  const [alreadyLoad, setAlreadyLoad] = useState(true);

  const openGetStart = () => {
    NavigationService.reset("GetStartScreen");
  };

  const getRoute = async () => {
    const token = await AsyncStorage.getItem("ACCESS_TOKEN");
    const deviceId = await AsyncStorage.getItem("DEVICE_ID");

    authenticate();

    if (token && deviceId) {
      apiClient("users/user-info")
        .then((res) => {
          console.log({ userInfo111: res.data.data });
          if (res && res.data && res.data.success) {
            console.log({ userInfo: res.data.data });
            setUser(res.data.data);
            setToken(token);

            setTimeout(() => {
              NavigationService.reset(getAuthenScreen(res.data.data));
            }, 3000);

            console.log({ pushToken });
            if (pushToken) {
              registerToken();
              apiClient
                .post("users/update-token", { session_token: pushToken })
                .then((res) => {})
                .catch((error) => {
                  console.log({ error });
                });
            }
          } else {
            setTimeout(() => {
              openGetStart();
            }, 3000);
          }
        })
        .catch((error) => {
          setTimeout(() => {
            openGetStart();
          }, 3000);
          console.log({ error });
        });
    } else {
      setTimeout(() => {
        openGetStart();
      }, 4000);
    }
  };

  useEffect(() => {
    const getFirstTime = async () => {
      const alreadyLoad = await AsyncStorage.getItem("ALREADY_LOADED");
      AsyncStorage.setItem("ALREADY_LOADED", "loaded");
      if (alreadyLoad === "loaded") {
        getRoute();
      } else {
        setTimeout(() => {
          NavigationService.reset("FirstTimeScreen");
        }, 4000);
      }
    };

    getFirstTime();
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        autoPlay
        style={{
          width: Dimensions.get("screen").width,
          height: Dimensions.get("screen").height,
          backgroundColor: "white",
        }}
        source={require("../../assets/animations/splash.json")}
      />
    </View>
  );
};

export default SplashScreen;
