import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
  DeviceEventEmitter,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import images from "@/utils/images";
import colors from "@/utils/colors";
import { Image } from "expo-image";
import { useAtom, useAtomValue } from "jotai";
import { notiCounterAtom, totalMessageUnreadAtom, userAtom } from "@/actions/global";
import firebase from "@react-native-firebase/messaging";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import constants from "@/utils/constants";
import apiClient from "@/utils/apiClient";
import AvatarImage from "./AvatarImage";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavigationService, { navigationRef } from "../utils/NavigationService";
import { OneSignal } from "react-native-onesignal";

const ONESIGNAL_APP_ID = "c3fb597e-e318-4eab-9d90-cd43b9491bc1";

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("screen").width - 32,
    height: 68,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    borderRadius: 34,
    // borderWidth: 1,
    // borderColor: "#D9D9D9",
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 1,
    shadowColor: "#000000",
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    flex: 1,
    gap: 6,
  },
  buttonIcon: {
    width: 28,
    height: 28,
  },
});

const Tabbar = ({ navigation, state }) => {
  const currentUser = useAtomValue(userAtom);
  const insets = useSafeAreaInsets();
  const currentIndex = state.index;
  const totalUnreadRaw = useAtomValue(totalMessageUnreadAtom);
  const [notiCounter, setNotiCounter] = useAtom(notiCounterAtom);
  const url = Linking.useURL();
  const urlHandleRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get("window").width);

  Dimensions.addEventListener('change', ({ window: { width, height } }) => {
    setWindowWidth(width)
  });

  const openTab = (tabIndex) => {
    const { routes } = state;
    navigation.jumpTo(routes[tabIndex].name);
    updateLastActive()
  };

  const updateLastActive = () => {
    apiClient.get('users/update-last-active')
      .then((data) => {
        console.log({ data })
      })
      .catch((error) => {
        console.log(({ error }))
      })
  }

  useEffect(() => {
    OneSignal.Notifications.requestPermission(true);
  }, []);

  useEffect(() => {
    const eventListener = DeviceEventEmitter.addListener(
      constants.REFRESH_NOTIFICATION_COUNTER,
      () => {
        apiClient
          .get("notifications/count-unseen")
          .then((res) => {
            if (res && res.data && res.data.success) {
              setNotiCounter(res.data.data);
            } else {
              setNotiCounter(0);
            }
          })
          .catch((error) => {
            console.log({ error });
            setNotiCounter(0);
          });
      },
    );

    return () => {
      eventListener.remove();
    };
  }, []);

  useEffect(() => {
    try {
      if (Platform.OS === "ios") {
        PushNotificationIOS.setApplicationIconBadgeNumber(totalUnreadRaw + notiCounter);
      }
    } catch (error) { }
  }, [totalUnreadRaw, notiCounter]);

  useEffect(() => {
    try {
      if (url && currentUser) {

        if (urlHandleRef && urlHandleRef.current) {
          clearTimeout(urlHandleRef.current);
          urlHandleRef.current = null;
        }

        urlHandleRef.current = setTimeout(async () => {
          const route = Linking.parse(url);

          if (route.scheme === 'https') {
            if (route?.path && route?.path.includes("profile")) {
              const profile_id = route?.path.split('/')[1];

              const token = await AsyncStorage.getItem("ACCESS_TOKEN");
              if (token) {
                if (navigationRef.current.getCurrentRoute().name === "ConnectProfileScreen") {
                  NavigationService.replace("ConnectProfileScreen", { profile: { id: profile_id } });
                } else {
                  NavigationService.push("ConnectProfileScreen", { profile: { id: profile_id } });
                }
              }
            }
            if (route?.path && route?.hostname.includes("conversation")) {
              const conversation_id = route?.path.split('/')[1];
              const token = await AsyncStorage.getItem("ACCESS_TOKEN");
              if (token) {
                if (navigationRef.current.getCurrentRoute().name === "ConnectProfileScreen") {
                  NavigationService.replace("MessageScreen", {
                    conversation: { conversation_id: conversation_id },
                  });
                } else {
                  NavigationService.push("MessageScreen", {
                    conversation: { conversation_id: conversation_id },
                  });
                }
              }
            }
          } else {
            if (route?.hostname === "profile") {
              const profile_id = route?.path;

              const token = await AsyncStorage.getItem("ACCESS_TOKEN");
              if (token) {
                if (navigationRef.current.getCurrentRoute().name === "ConnectProfileScreen") {
                  NavigationService.replace("ConnectProfileScreen", { profile: { id: profile_id } });
                } else {
                  NavigationService.push("ConnectProfileScreen", { profile: { id: profile_id } });
                }
              }
            }
            if (route?.hostname === "conversation") {
              const conversation_id = route?.path;
              const token = await AsyncStorage.getItem("ACCESS_TOKEN");
              if (token) {
                if (navigationRef.current.getCurrentRoute().name === "ConnectProfileScreen") {
                  NavigationService.replace("MessageScreen", {
                    conversation: { conversation_id: conversation_id },
                  });
                } else {
                  NavigationService.push("MessageScreen", {
                    conversation: { conversation_id: conversation_id },
                  });
                }
              }
            }
          }
        }, 1000);
      }
    } catch (error) { }
  }, [url]);

  return (
    <View
      style={[
        styles.container,
        { width: windowWidth - 32, bottom: insets.bottom + Platform.select({ ios: 0, android: 16 }) },
      ]}
    >
      <TouchableWithoutFeedback onPress={() => openTab(0)}>
        <View style={[styles.buttonContainer]}>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Image
              style={[
                styles.buttonIcon,
                { tintColor: currentIndex === 0 ? colors.mainColor : "#707070" },
              ]}
              source={images.logo_icon}
              contentFit="contain"
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: currentIndex === 0 ? colors.mainColor : "#707070",
              }}
            >
              Explore
            </Text>

            {notiCounter > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: 6,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.mainColor,
                }}
              >
                <Text style={{ fontSize: 8, fontWeight: "500", color: "white" }}>
                  {notiCounter > 99 ? "..." : notiCounter}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={() => openTab(1)}>
        <View style={[styles.buttonContainer]}>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Image
              style={[
                styles.buttonIcon,
                { tintColor: currentIndex === 1 ? colors.mainColor : "#707070" },
              ]}
              source={images.matches_icon}
              contentFit="contain"
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: currentIndex === 1 ? colors.mainColor : "#707070",
              }}
            >
              Matches
            </Text>

            {totalUnreadRaw > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: 6,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.mainColor,
                }}
              >
                <Text style={{ fontSize: 8, fontWeight: "500", color: "white" }}>
                  {totalUnreadRaw > 99 ? "..." : totalUnreadRaw}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={() => openTab(2)}>
        <View style={[styles.buttonContainer]}>
          {/* <Image style={[styles.buttonIcon, { borderRadius: 14 }]} source={currentUser?.avatar ? { uri: currentUser?.avatar } : images.logo_icon} /> */}
          <AvatarImage
            avatar={currentUser?.avatar}
            full_name={currentUser?.full_name}
            style={[
              styles.buttonIcon,
              { borderRadius: 14 },
              currentIndex === 2 ? { borderWidth: 2, borderColor: colors.mainColor } : {},
            ]}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: currentIndex === 2 ? colors.mainColor : "#707070",
            }}
          >
            Profile
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default Tabbar;
