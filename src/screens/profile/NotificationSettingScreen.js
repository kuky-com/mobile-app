import { userAtom } from "@/actions/global";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import Text from "@/components/Text";
import apiClient from "@/utils/apiClient";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { Image } from "expo-image";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import analytics from '@react-native-firebase/analytics'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F3",
  },
  inputContainer: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    elevation: 1,
    shadowColor: "#000000",
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
  },
});

const NotificationSettingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentUser, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useState(false);
  const [notificationEnable, setNotificationEnable] = useState(currentUser?.notificationEnable);
  const [emailNotificationEnable, setEmailNotificationEnable] = useState(
    currentUser?.emailNotificationEnable,
  );
  const [subscribeEmail, setSubscribeEmail] = useState(currentUser?.subscribeEmail);

  useEffect(() => {
    analytics().logScreenView({
      screen_name: 'NotificationSettingScreen',
      screen_class: 'NotificationSettingScreen',
    })
  }, [])

  const updateProfile = async () => {
    try {
      setLoading(true);
      console.log({ notificationEnable, subscribeEmail, emailNotificationEnable });
      apiClient
        .post("users/update", { notificationEnable, subscribeEmail, emailNotificationEnable })
        .then((res) => {
          setLoading(false);
          if (res && res.data && res.data.success) {
            setUser(res.data.data);
            Toast.show({ text1: res.data.message, type: "success" });
          } else {
            Toast.show({ text1: res.data.message, type: "error" });
          }
        })
        .catch((error) => {
          console.log({ error });
          setLoading(false);
          Toast.show({ text1: error, type: "error" });
        });
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          zIndex: 2,
          gap: 8,
          borderBottomLeftRadius: 45,
          borderBottomRightRadius: 45,
          backgroundColor: "#725ED4",
          paddingHorizontal: 16,
          paddingBottom: 24,
          paddingTop: insets.top + 16,
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
        >
          <Image source={images.back_icon} style={{ width: 25, height: 25 }} contentFit="contain" />
        </TouchableOpacity>
        <Text
          style={{
            lineHeight: 25,
            fontSize: 20,
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Notification Settings
        </Text>
        <View
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
        ></View>
      </View>
      <View style={{ flex: 1, backgroundColor: "white", marginTop: -40, paddingTop: 40 }}>
        <View style={{ flex: 1, padding: 16 }}>
          <View
            style={{
              paddingVertical: 16,
              borderBottomColor: "#eee",
              borderBottomWidth: 1,
              gap: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, color: "#646464", flex: 1, fontWeight: "bold" }}>
              Allow push notification
            </Text>
            <Switch
              value={notificationEnable}
              onValueChange={() => setNotificationEnable((old) => !old)}
            />
          </View>
          <View
            style={{
              paddingVertical: 16,
              borderBottomColor: "#eee",
              borderBottomWidth: 1,
              gap: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, color: "#646464", flex: 1, fontWeight: "bold" }}>
              Allow email notification
            </Text>
            <Switch
              value={emailNotificationEnable}
              onValueChange={() => setEmailNotificationEnable((old) => !old)}
            />
          </View>
          <View
            style={{
              paddingVertical: 16,
              borderBottomColor: "#eee",
              borderBottomWidth: 1,
              gap: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 16, color: "#646464", flex: 1, fontWeight: "bold" }}
            >{`Subscribe Kuky's news`}</Text>
            <Switch value={subscribeEmail} onValueChange={() => setSubscribeEmail((old) => !old)} />
          </View>
        </View>

        <View style={{ width: "100%", paddingHorizontal: 16, marginBottom: insets.bottom + 20 }}>
          <ButtonWithLoading text="Save" onPress={updateProfile} loading={loading} />
        </View>
      </View>
    </View>
  );
};

export default NotificationSettingScreen;
