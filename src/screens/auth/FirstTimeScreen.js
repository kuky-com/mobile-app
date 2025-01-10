import { pushTokenAtom, tokenAtom, userAtom } from "@/actions/global";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import Text from "@/components/Text";
import apiClient from "@/utils/apiClient";
import colors from "@/utils/colors";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { getAuthenScreen } from "@/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image, ImageBackground } from "expo-image";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import { registerToken } from "../../utils/sendbird";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import analytics from '@react-native-firebase/analytics'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
});

const FirstTimeScreen = ({ navigation }) => {
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(tokenAtom);
  const pushToken = useAtomValue(pushTokenAtom);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const insets = useSafeAreaInsets()

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "FirstTimeScreen",
      screen_class: "FirstTimeScreen",
    })
  }, [])

  const openGetStart = () => {
    NavigationService.reset("LetDiscoverScreen");
  };

  const getRoute = async () => {
    const token = await AsyncStorage.getItem("ACCESS_TOKEN");
    const deviceId = await AsyncStorage.getItem("DEVICE_ID");

    if (token && deviceId) {
      apiClient("users/user-info")
        .then((res) => {
          console.log({ userInfo111: res.data.data });
          if (res && res.data && res.data.success) {
            setUser(res.data.data);
            setToken(token);

            NavigationService.reset(getAuthenScreen(res.data.data));

            if (pushToken) {
              registerToken();
              apiClient
                .post("users/update-token", { session_token: pushToken })
                .then((res) => {
                  console.log({ res });
                })
                .catch((error) => {
                  console.log({ error });
                });
            }
          } else {
            openGetStart();
          }
        })
        .catch((error) => {
          openGetStart();
          console.log({ error });
        });
    } else {
      openGetStart();
    }
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top + 16, paddingBottom: insets.bottom + 8}]}>
      <Image
        contentFit="contain"
        source={images.logo_text}
        style={{ height: 80, width: 150, tintColor: "black" }}
      />
      <Text style={{ fontSize: 20, fontWeight: "700", color: "#6C6C6C" }}>Better Together</Text>
      <View style={{ flex: 1, alignItems: "center", justifyContent: 'center' }}>
        <ImageBackground contentFit="contain"
          source={images.splash_bg}
          style={{
            width: Math.min(Dimensions.get("screen").width - 32, 600),
            height: Math.min(Dimensions.get("screen").width - 32, 600),
            alignItems: 'center', justifyContent: 'center'
          }}>
          <Image
            contentFit="contain"
            source={images.logo_icon}
            style={{
              width: 50,
              height: 50,
              tintColor: '#6C6C6C'
            }}
          />
        </ImageBackground>
      </View>
      <Text
        style={{ fontSize: 16, fontWeight: "500", textAlign: "center", color: "#4C4C4C" }}
      >{`Connect with people who`}</Text>
      <Text
        style={{ fontSize: 20, fontWeight: "500", textAlign: "center", color: "#4C4C4C" }}
      >{`Understand You!`}</Text>
      {!isFirstTime && <ActivityIndicator size="large" color={"white"} />}
      {isFirstTime && <ButtonWithLoading text="Let’s get started" onPress={getRoute} />}
    </View>
  );
};

export default FirstTimeScreen;
