import { tokenAtom, userAtom } from "@/actions/global";
import { useAppUpdateAlert } from "@/components/AppUpdateAlert";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import Text from "@/components/Text";
import apiClient from "@/utils/apiClient";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SendbirdCalls } from "@sendbird/calls-react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useSetAtom } from "jotai";
import React, { useState } from "react";
import { Linking, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { getBuildNumber, getVersion } from "react-native-device-info";
import Purchases from "react-native-purchases";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    elevation: 1,
    shadowColor: "#000000",
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
  },
});

const SettingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const setToken = useSetAtom(tokenAtom);
  const setUser = useSetAtom(userAtom);
  const [loading, setLoading] = useState(false);
  const showUpdateAlert = useAppUpdateAlert();

  const onSupport = () => {
    Linking.openURL("https://www.kuky.com/");
  };

  const onPrivacy = () => {
    Linking.openURL("https://www.kuky.com/privacy-policy");
  };

  const onTerm = () => {
    Linking.openURL("https://www.kuky.com/terms-and-conditions");
  };

  const onLogout = async () => {
    setLoading(true);
    Purchases.logOut()
      .then(() => {})
      .catch(() => {});

    apiClient
      .get("auth/logout")
      .then(async (res) => {
        setLoading(false);

        await AsyncStorage.removeItem("ACCESS_TOKEN");
        await AsyncStorage.removeItem("SENDBIRD_TOKEN");
        await AsyncStorage.removeItem("USER_ID");
        if (SendbirdCalls.currentUser) {
          SendbirdCalls.deauthenticate();
        }
        setToken(null);
        setUser(null);
        NavigationService.reset("GetStartScreen");
        console.log({ res });
      })
      .catch(async (error) => {
        setLoading(false);

        await AsyncStorage.removeItem("ACCESS_TOKEN");
        await AsyncStorage.removeItem("SENDBIRD_TOKEN");
        await AsyncStorage.removeItem("USER_ID");
        if (SendbirdCalls.currentUser) {
          SendbirdCalls.deauthenticate();
        }
        setToken(null);
        setUser(null);
        NavigationService.reset("GetStartScreen");
        console.log({ error });
      });
  };

  const openInterest = () => {
    navigation.navigate("InterestUpdateScreen", { onboarding: false });
  };

  const openBlocked = () => {
    navigation.navigate("BlockedUsersScreen");
  };

  const mySubscription = () => {
    navigation.navigate("MySubscriptionScreen");
  };

  const onDeleteAccount = async (reason) => {
    await SheetManager.show("confirm-action-sheets", {
      payload: {
        onCancel: () => {},
        onConfirm: async () => {
          const options = [
            { text: "I met someone", color: "#333333" },
            { text: "I need a break", color: "#333333" },
            { text: "Other", color: "#333333" },
            { text: "Cancel", style: "cancel" },
          ];

          await SheetManager.show("cmd-action-sheets", {
            payload: {
              actions: options,
              header: "DELETE ACCOUNT",
              title: "Are you sure you want to delete your account?",
              onPress(index) {
                if (index < options.length - 1) {
                  setLoading(true);
                  apiClient
                    .post("users/delete-account", { reason: options[index].text })
                    .then(async (res) => {
                      setLoading(false);
                      if (res && res.data && res.data.success) {
                        Toast.show({ text1: res.data.message, type: "success" });
                        await AsyncStorage.removeItem("ACCESS_TOKEN");
                        await AsyncStorage.removeItem("SENDBIRD_TOKEN");
                        await AsyncStorage.removeItem("USER_ID");
                        if (SendbirdCalls.currentUser) {
                          SendbirdCalls.deauthenticate();
                        }
                        setToken(null);
                        setUser(null);
                        NavigationService.reset("GetStartScreen");
                      } else {
                        Toast.show({
                          text1: res?.data?.message ?? "Block action failed!",
                          type: "error",
                        });
                      }
                    })
                    .catch((error) => {
                      setLoading(false);
                      Toast.show({ text1: error, type: "error" });
                    });
                }
              },
            },
          });
        },
        cancelText: "Cancel",
        confirmText: "Delete Account",
        header: "DELETE ACCOUNT",
        title: `Are you sure you want to delete your account?`,
        message: `Deleting your account means you will no longer have access to your profile, matches, messages or account permanently.`,
      },
    });
  };

  const deactiveAccount = async () => {
    await SheetManager.show("confirm-action-sheets", {
      payload: {
        onCancel: () => {},
        onConfirm: async () => {
          const options = [
            { text: "I met someone", color: "#333333" },
            { text: "I need a break", color: "#333333" },
            { text: "Other", color: "#333333" },
            { text: "Cancel", style: "cancel" },
          ];

          await SheetManager.show("cmd-action-sheets", {
            payload: {
              actions: options,
              header: "DEACTIVATE ACCOUNT",
              title: "Why do you want to deactivate your account?",
              onPress(index) {
                if (index < options.length - 1) {
                  setLoading(true);
                  apiClient
                    .post("users/deactive-account", { reason: options[index].text })
                    .then(async (res) => {
                      setLoading(false);
                      if (res && res.data && res.data.success) {
                        Toast.show({ text1: res.data.message, type: "success" });
                        await AsyncStorage.removeItem("ACCESS_TOKEN");
                        await AsyncStorage.removeItem("SENDBIRD_TOKEN");
                        await AsyncStorage.removeItem("USER_ID");
                        if (SendbirdCalls.currentUser) {
                          SendbirdCalls.deauthenticate();
                        }
                        setToken(null);
                        setUser(null);
                        NavigationService.reset("GetStartScreen");
                      } else {
                        Toast.show({
                          text1: res?.data?.message ?? "Block action failed!",
                          type: "error",
                        });
                      }
                    })
                    .catch((error) => {
                      setLoading(false);
                      Toast.show({ text1: error, type: "error" });
                    });
                }
              },
            },
          });
        },
        cancelText: "Cancel",
        confirmText: "Deactivate my account",
        header: "DEACTIVATE ACCOUNT",
        title: `Are you sure you want to deactivate your account?`,
        message: `Deactivating your account means that your account will be hidden and not shown to other users. To activate your account, sign in. `,
      },
    });
  };

  const editProfile = () => {
    navigation.navigate("UpdateProfileScreen");
  };

  const openNotification = () => {
    navigation.navigate("NotificationSettingScreen");
  };

  const getVersionInfo = () => {
    apiClient
      .post(
        "/users/version-info",
        Platform.select({
          ios: { version_ios: getVersion() },
          android: { version_android: getVersion() },
        }),
      )
      .then((res) => {
        console.log({ res });
        if (res && res.data && res.data.success && res.data.data) {
          showUpdateAlert(`Version ${getVersion()}`, res.data.data.description, false, [
            {
              text: "Ok",
            },
          ]);
        }
      })
      .catch((error) => {
        console.log({ error });
      });
  };

  const onConnectWithUs = () => {
    navigation.push('ConnectUsScreen')
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent style="dark" />
      <View
        style={{
          gap: 12,
          borderBottomLeftRadius: 45,
          borderBottomRightRadius: 45,
          backgroundColor: "#725ED4",
          paddingHorizontal: 16,
          paddingBottom: 24,
          paddingTop: insets.top + 32,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={images.setting_icon}
          style={{ width: 22, height: 22 }}
          contentFit="contain"
        />
        <Text style={{ fontSize: 18, color: "white", fontWeight: "bold" }}>{"Setting"}</Text>
      </View>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          width: 35,
          height: 35,
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: insets.top + 8,
          left: 16,
        }}
      >
        <Image source={images.back_icon} style={{ width: 25, height: 25 }} contentFit="contain" />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16, paddingTop: 24 }}
        >
          <View style={{ flex: 1, gap: 16, marginBottom: insets.bottom + 120 }}>
            {/* <TouchableOpacity style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>My Subscription</Text>
                            <Image source={images.next_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity> */}
            <TouchableOpacity onPress={mySubscription} style={[styles.buttonContainer]}>
              <Text style={{ color: "#333333", fontSize: 16, fontWeight: "bold", flex: 1 }}>
                My Subscription
              </Text>
              <Image
                source={images.next_icon}
                style={{ width: 18, height: 18 }}
                contentFit="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={editProfile} style={[styles.buttonContainer]}>
              <Text style={{ color: "#333333", fontSize: 16, fontWeight: "bold", flex: 1 }}>
                Account Information
              </Text>
              <Image
                source={images.next_icon}
                style={{ width: 18, height: 18 }}
                contentFit="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={openNotification} style={[styles.buttonContainer]}>
              <Text style={{ color: "#333333", fontSize: 16, fontWeight: "bold", flex: 1 }}>
                Notification settings
              </Text>
              <Image
                source={images.next_icon}
                style={{ width: 18, height: 18 }}
                contentFit="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={openBlocked} style={[styles.buttonContainer]}>
              <Text style={{ color: "#333333", fontSize: 16, fontWeight: "bold", flex: 1 }}>
                Blocked List
              </Text>
              <Image
                source={images.next_icon}
                style={{ width: 18, height: 18 }}
                contentFit="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onSupport} style={[styles.buttonContainer]}>
              <Text style={{ color: "#333333", fontSize: 16, fontWeight: "bold", flex: 1 }}>
                Support
              </Text>
              <Image
                source={images.next_icon}
                style={{ width: 18, height: 18 }}
                contentFit="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onPrivacy} style={[styles.buttonContainer]}>
              <Text style={{ color: "#333333", fontSize: 16, fontWeight: "bold", flex: 1 }}>
                Privacy Policy
              </Text>
              <Image
                source={images.next_icon}
                style={{ width: 18, height: 18 }}
                contentFit="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onTerm} style={[styles.buttonContainer]}>
              <Text style={{ color: "#333333", fontSize: 16, fontWeight: "bold", flex: 1 }}>
                Terms of use
              </Text>
              <Image
                source={images.next_icon}
                style={{ width: 18, height: 18 }}
                contentFit="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={onConnectWithUs} style={[styles.buttonContainer]}>
              <Text style={{ color: "#333333", fontSize: 16, fontWeight: "bold", flex: 1 }}>
                Connect with Us
              </Text>
              <Image
                source={images.next_icon}
                style={{ width: 18, height: 18 }}
                contentFit="contain"
              />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 13,
                color: "#aaaaaa",
                fontWeight: "bold",
                width: "100%",
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {`Version: ${getVersion()} (Build ${getBuildNumber()})\n`}
              <Text
                style={{ color: "#5E30C1", textDecorationLine: "underline" }}
                onPress={getVersionInfo}
              >{`What's new?`}</Text>
            </Text>

            <ButtonWithLoading text="Logout" onPress={onLogout} loading={loading} />

            <ButtonWithLoading
              text="Deactivate my account"
              onPress={deactiveAccount}
              loading={loading}
              style={{ marginTop: 32 }}
            />
            <TouchableOpacity
              onPress={onDeleteAccount}
              style={{ padding: 8, width: "100%", alignItems: "center" }}
            >
              <Text style={{ color: "#333333", fontSize: 16, fontWeight: "bold" }}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default SettingScreen;
