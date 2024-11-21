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

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("screen").width - 32,
    height: 68,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    backgroundColor: "white",
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 0,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    flex: 1,
    gap: 3,
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

  const openTab = (tabIndex) => {
    const { routes } = state;
    navigation.jumpTo(routes[tabIndex].name);
  };

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
    } catch (error) {}
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

          if(route.scheme === 'https') {
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
    } catch (error) {}
  }, [url]);

  return (
    <View
      style={[
        styles.container,
        { bottom: insets.bottom + Platform.select({ ios: 0, android: 16 }) },
      ]}
    >
      <TouchableWithoutFeedback onPress={() => openTab(0)}>
        <View style={[styles.buttonContainer]}>
          <View style={{ alignItems: "center" }}>
            <Image
              style={[
                styles.buttonIcon,
                { tintColor: currentIndex === 0 ? colors.mainColor : "#949494" },
              ]}
              source={images.logo_icon}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: currentIndex === 0 ? colors.mainColor : "#949494",
              }}
            >
              Explore
            </Text>

            {notiCounter > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#FF8B8B",
                }}
              >
                <Text style={{ fontSize: 8, fontWeight: "bold", color: "white" }}>
                  {notiCounter > 99 ? "..." : notiCounter}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={() => openTab(1)}>
        <View style={[styles.buttonContainer]}>
          <View style={{ alignItems: "center" }}>
            <Image
              style={[
                styles.buttonIcon,
                { tintColor: currentIndex === 1 ? colors.mainColor : "#949494" },
              ]}
              source={images.matches_icon}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: currentIndex === 1 ? colors.mainColor : "#949494",
              }}
            >
              Matches
            </Text>

            {totalUnreadRaw > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#FF8B8B",
                }}
              >
                <Text style={{ fontSize: 8, fontWeight: "bold", color: "white" }}>
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
              fontSize: 10,
              fontWeight: "700",
              color: currentIndex === 2 ? colors.mainColor : "#949494",
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
