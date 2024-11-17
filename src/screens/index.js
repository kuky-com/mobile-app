import React, { useEffect, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Tabbar from "@/components/Tabbar";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import ExploreScreen from "./interest/ExploreScreen";
import MatchesScreen from "./match/MatchesScreen";
import ProfileScreen from "./profile/ProfileScreen";
import SplashScreen from "./auth/SplashScreen";
import GetStartScreen from "./auth/GetStartScreen";
import SignUpEmailScreen from "./auth/SignUpEmailScreen";
import SignUpScreen from "./auth/SignUpScreen";
import SignInScreen from "./auth/SignInScreen";
import MessageScreen from "./chat/MessageScreen";
import BlockedUsersScreen from "./profile/BlockedUsersScreen";
import ConnectProfileScreen from "./interest/ConnectProfileScreen";
import EmailVerificationScreen from "./auth/EmailVerificationScreen";
import UpdateProfileScreen from "./auth/UpdateProfileScreen";
import UpdatePasswordScreen from "./auth/UpdatePasswordScreen";
import AvatarUpdateScreen from "./onboarding/AvatarUpdateScreen";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import VerificationSuccessScreen from "./auth/VerificationSuccessScreen";
import PremiumRequestScreen from "./chat/PremiumRequestScreen";
import InterestSelectScreen from "./interest/InterestSelectScreen";
import DislikeSelectScreen from "./interest/DislikeSelectScreen";
import GetMatchScreen from "./match/GetMatchScreen";
import BirthdayUpdateScreen from "./onboarding/BirthdayUpdateScreen";
import GenderUpdateScreen from "./onboarding/GenderUpdateScreen";
import LocationUpdateScreen from "./onboarding/LocationUpdateScreen";
import OnboardingCompleteScreen from "./onboarding/OnboardingCompleteScreen";
import ProfileTagScreen from "./onboarding/ProfileTagScreen";
import PronounsUpdateScreen from "./onboarding/PronounsUpdateScreen";
import ReviewProfileScreen from "./onboarding/ReviewProfileScreen";
import SettingScreen from "./profile/SettingScreen";
import { deviceIdAtom, pushTokenAtom, userAtom } from "@/actions/global";
import DeviceInfo from "react-native-device-info";
import NavigationService, { navigationRef } from "@/utils/NavigationService";
import { useRoute } from "@react-navigation/native";
import PurposeUpdateScreen from "./onboarding/PurposeUpdateScreen";
import messaging from "@react-native-firebase/messaging";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import apiClient from "@/utils/apiClient";
import NameUpdateScreen from "./onboarding/NameUpdateScreen";
import NotificationListScreen from "./notification/NotificationListScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DislikeUpdateScreen from "./profile/DislikeUpdateScreen";
import InterestUpdateScreen from "./profile/InterestUpdateScreen";
import PurposeProfileScreen from "./profile/PurposeProfileScreen";
import { Alert, AppState, Platform } from "react-native";
import Purchases from "react-native-purchases";
import AvatarProfileScreen from "./profile/AvatarProfileScreen";
import * as Linking from "expo-linking";
import NotificationSettingScreen from "./profile/NotificationSettingScreen";
import InAppReview from "react-native-in-app-review";
import MySubscriptionScreen from "./profile/MySubscriptionScreen";
import ReviewMatchScreen from "./match/ReviewMatchScreen";
import OnboardingVideoScreen from "./onboarding/OnboardingVideoScreen";
import FirstTimeScreen from "./auth/FirstTimeScreen";
import ProfileApprovedScreen from "./profile/ProfileApprovedScreen";
import ProfileRejectScreen from "./profile/ProfileRejectScreen";
import { useAlert } from "@/components/AlertProvider";
import { useAppUpdateAlert } from "@/components/AppUpdateAlert";
import dayjs from "dayjs";
import OnboardingVideoTutorialScreen from "./onboarding/OnboardingVideoTutorialScreen";
import VideoProcessingScreen from "./onboarding/VideoProcessingScreen";
import VideoUpdateScreen from "./profile/VideoUpdateScreen";
import { ReviewsScreen } from "./interest/ReviewsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: "#00000000" }}
      screenOptions={{ tabBarShowLabel: false, headerShown: false, lazy: false }}
      tabBar={(props) => <Tabbar {...props} />}
      initialRouteName="ExploreScreen"
    >
      <Tab.Screen name="ExploreScreen" component={ExploreScreen} />
      <Tab.Screen name="MatchesScreen" component={MatchesScreen} />
      <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppStack = ({ navgation }) => {
  const setDeviceId = useSetAtom(deviceIdAtom);
  const setPushToken = useSetAtom(pushTokenAtom);
  const [currentUser, setUser] = useAtom(userAtom);
  const url = Linking.useURL();
  const urlHandleRef = useRef(null);
  const showUpdateAlert = useAppUpdateAlert();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (currentUser && currentUser?.email) {
      Purchases.logIn(currentUser?.email)
        .then(() => {})
        .catch(() => {});
    } else {
      Purchases.logOut()
        .then(() => {})
        .catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (currentUser && currentUser.profile_action_date) {
        try {
          const lastCheckTime = await AsyncStorage.getItem("LAST_PROFILE_STATUS_CHECK");
          if (
            !(lastCheckTime && dayjs(lastCheckTime).isAfter(dayjs(currentUser.profile_action_date)))
          ) {
            if (currentUser.profile_approved === "approved") {
              NavigationService.push("ProfileApprovedScreen");
            } else if (currentUser.profile_approved === "rejected") {
              NavigationService.push("ProfileRejectScreen", {
                message: `Unfortunately, your account couldn’t be approved at this time due to the following reason: ${currentUser.profile_rejected_reason}`,
              });
            }
          }
          await AsyncStorage.setItem("LAST_PROFILE_STATUS_CHECK", dayjs().format());
        } catch (error) {}
      }
    };

    checkProfileStatus();
  }, [currentUser]);

  const loadProfile = async () => {
    const token = await AsyncStorage.getItem("ACCESS_TOKEN");
    const deviceId = await AsyncStorage.getItem("DEVICE_ID");

    if (token && deviceId) {
      apiClient("users/user-info")
        .then((res) => {
          console.log({ userInfo111: res.data.data });
          if (res && res.data && res.data.success) {
            console.log({ userInfo: res.data.data });
            setUser(res.data.data);
          }
        })
        .catch((error) => {
          console.log({ error });
        });
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current &&
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        loadProfile();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const getVersion = () => {
      apiClient
        .get("/users/latest-version")
        .then((res) => {
          console.log({ res });
          if (res && res.data && res.data.success && res.data.data) {
            let version = null;
            if (Platform.OS === "android") {
              version = res.data.data.version_android;
            } else {
              version = res.data.data.version_ios;
            }

            const appVersion = DeviceInfo.getVersion();

            if (appVersion < version) {
              if (res.data.data.is_required) {
                showUpdateAlert(
                  `Version ${version}`,
                  res.data.data.description,
                  res.data.data.is_required,
                  [
                    {
                      text: "Update Now",
                      onPress: () => {
                        Linking.openURL(
                          Platform.select({
                            ios: "itms-apps://apps.apple.com/id/app/kuky/id6711341485",
                            android:
                              "https://play.google.com/store/apps/details?id=com.kuky.android",
                          }),
                        );
                      },
                    },
                  ],
                );
              } else {
                if (Math.random() < 0.2) {
                  showUpdateAlert(
                    `Version ${version}`,
                    res.data.data.description,
                    res.data.data.is_required,
                    [
                      {
                        text: "Update Now",
                        onPress: () => {
                          Linking.openURL(
                            Platform.select({
                              ios: "itms-apps://apps.apple.com/id/app/kuky/id6711341485",
                              android:
                                "https://play.google.com/store/apps/details?id=com.kuky.android",
                            }),
                          );
                        },
                      },
                    ],
                    [
                      {
                        text: "Later",
                      },
                    ],
                  );
                }
              }
            }
          }
        })
        .catch((error) => {
          console.log({ error });
        });
    };

    setTimeout(() => {
      getVersion();
    }, 5000);
  }, []);

  useEffect(() => {
    try {
      setTimeout(() => {
        AsyncStorage.getItem("APP_START_COUNTER")
          .then((value) => {
            let counter = 0;
            if (value) {
              counter = parseInt(value);
            }

            counter += 1;

            AsyncStorage.setItem("APP_START_COUNTER", counter.toString());

            // console.log({counter, isReviewAvailable: InAppReview.isAvailable()})
            if (counter % 10 === 0) {
              InAppReview.RequestInAppReview()
                .then((hasFlowFinishedSuccessfully) => {
                  console.log("InAppReview in android", hasFlowFinishedSuccessfully);

                  console.log(
                    "InAppReview in ios has launched successfully",
                    hasFlowFinishedSuccessfully,
                  );

                  if (hasFlowFinishedSuccessfully) {
                  }
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          })
          .catch((error) => {});
      }, 2000);
    } catch (error) {}
  }, []);

  useEffect(() => {
    const configPurchase = () => {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

      if (Platform.OS === "ios") {
        Purchases.configure({ apiKey: "appl_YPuGMuhbpRNDXSjKjIzybDLxtgd" });
      } else if (Platform.OS === "android") {
        Purchases.configure({ apiKey: "goog_aaeHeyOlZGrvhyQsCZOaHQkfvqb" });
      }
    };

    configPurchase();
  }, []);

  useEffect(() => {
    try {
      // console.log({deepLink: event})
      // const { url } = event;
      if (url && currentUser) {
        if (urlHandleRef && urlHandleRef.current) {
          clearTimeout(urlHandleRef.current);
          urlHandleRef.current = null;
        }

        urlHandleRef.current = setTimeout(async () => {
          const route = Linking.parse(url);
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
        }, 1000);
      }
    } catch (error) {}

    // const listener = Linking.addEventListener('url', handleDeepLink);

    // return () => {
    //     listener.remove()
    // };
  }, [url, currentUser]);

  useEffect(() => {
    if (Platform.OS === "ios") {
      PushNotificationIOS.requestPermissions()
        .then((data) => {
          console.log({ data });
        })
        .catch((error) => {
          console.log({ error });
        });
    }
  }, []);

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      try {
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        console.log({ pushToken: token });
        setPushToken(token);
        AsyncStorage.getItem("ACCESS_TOKEN", (error, result) => {
          if (result) {
            apiClient
              .post("users/update-token", { session_token: token })
              .then((res) => {
                console.log({ res });
              })
              .catch((error) => {
                console.log({ error });
              });
          }
        });
      } catch (error) {}
    }
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      //   Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      if (remoteMessage) {
        if (remoteMessage.data && remoteMessage.data.data) {
          try {
            const notiData = JSON.parse(remoteMessage.data.data);
            console.log({ removeNotifcate: notiData });

            if (notiData.type === "profile_approved") {
              NavigationService.push("ProfileApprovedScreen");
            } else if (notiData.type === "profile_rejected") {
              NavigationService.push("ProfileRejectScreen", {
                message: remoteMessage.notification.body,
              });
            }
          } catch (error) {}
        }
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage) {
        if (remoteMessage.data && remoteMessage.data.data) {
          try {
            const notiData = JSON.parse(remoteMessage.data.data);
            if (navigationRef.current.getCurrentRoute().name === "SplashScreen") {
              setTimeout(() => {
                if (notiData.type === "message") {
                  if (notiData.match && notiData.match.conversation_id) {
                    NavigationService.resetRaw([
                      { name: "Dashboard" },
                      { name: "MessageScreen", params: { conversation: notiData.match } },
                    ]);
                  } else {
                    NavigationService.resetRaw([{ name: "Dashboard" }, { name: "MatchesScreen" }]);
                  }
                } else if (notiData.type === "profile_approved") {
                  NavigationService.push("ProfileApprovedScreen");
                } else if (notiData.type === "profile_rejected") {
                  NavigationService.push("ProfileRejectScreen", {
                    message: remoteMessage.notification.body,
                  });
                } else if (notiData.type === "new_suggestions" && notiData.suggest) {
                  NavigationService.push("ConnectProfileScreen", {
                    profile: { id: notiData.suggest?.id },
                  });
                } else {
                  // NavigationService.resetRaw([
                  //     { name: 'Dashboard' },
                  //     { name: 'NotificationScreen' }
                  // ])
                }
              }, 1200);
            } else {
              if (notiData.type === "message") {
                if (notiData.match && notiData.match.conversation_id) {
                  NavigationService.resetRaw([
                    { name: "Dashboard" },
                    { name: "MessageScreen", params: { conversation: notiData.match } },
                  ]);
                } else {
                  NavigationService.resetRaw([{ name: "Dashboard" }, { name: "MatchesScreen" }]);
                }
              } else if (notiData.type === "profile_approved") {
                NavigationService.push("ProfileApprovedScreen");
              } else if (notiData.type === "profile_rejected") {
                NavigationService.push("ProfileRejectScreen", {
                  message: remoteMessage.notification.body,
                });
              } else if (notiData.type === "new_suggestions" && notiData.suggest) {
                NavigationService.push("ConnectProfileScreen", {
                  profile: { id: notiData.suggest?.id },
                });
              } else {
                // NavigationService.resetRaw([
                //     { name: 'Dashboard' },
                //     { name: 'NotificationScreen' }
                // ])
              }
            }
          } catch (error) {
            console.log({ error });
          }
        }
      }
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          if (remoteMessage.data && remoteMessage.data.data) {
            try {
              const notiData = JSON.parse(remoteMessage.data.data);
              if (navigationRef.current.getCurrentRoute().name === "SplashScreen") {
                setTimeout(() => {
                  if (notiData.type === "message") {
                    if (notiData.match && notiData.match.conversation_id) {
                      NavigationService.resetRaw([
                        { name: "Dashboard" },
                        { name: "MessageScreen", params: { conversation: notiData.match } },
                      ]);
                    } else {
                      NavigationService.resetRaw([
                        { name: "Dashboard" },
                        { name: "NotificationScreen" },
                      ]);
                    }
                  } else if (notiData.type === "profile_approved") {
                    NavigationService.push("ProfileApprovedScreen");
                  } else if (notiData.type === "profile_rejected") {
                    NavigationService.push("ProfileRejectScreen", {
                      message: remoteMessage.notification.body,
                    });
                  } else if (notiData.type === "new_suggestions" && notiData.suggest) {
                    NavigationService.push("ConnectProfileScreen", {
                      profile: { id: notiData.suggest?.id },
                    });
                  } else {
                    NavigationService.resetRaw([
                      { name: "Dashboard" },
                      { name: "NotificationScreen" },
                    ]);
                  }
                }, 1200);
              } else {
                if (notiData.type === "message") {
                  if (notiData.match && notiData.match.conversation_id) {
                    NavigationService.resetRaw([
                      { name: "Dashboard" },
                      { name: "MessageScreen", params: { conversation: notiData.match } },
                    ]);
                  } else {
                    NavigationService.resetRaw([
                      { name: "Dashboard" },
                      { name: "NotificationScreen" },
                    ]);
                  }
                } else if (notiData.type === "profile_approved") {
                  NavigationService.push("ProfileApprovedScreen");
                } else if (notiData.type === "profile_rejected") {
                  NavigationService.push("ProfileRejectScreen", {
                    message: remoteMessage.notification.body,
                  });
                } else if (notiData.type === "new_suggestions" && notiData.suggest) {
                  NavigationService.push("ConnectProfileScreen", {
                    profile: { id: notiData.suggest?.id },
                  });
                } else {
                  NavigationService.resetRaw([
                    { name: "Dashboard" },
                    { name: "NotificationScreen" },
                  ]);
                }
              }
            } catch (error) {
              console.log({ error });
            }
          }
        }
      });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const getDeviceId = async () => {
      const deviceId = await DeviceInfo.getUniqueId();
      setDeviceId(deviceId);
      AsyncStorage.setItem("DEVICE_ID", deviceId)
        .then(() => {})
        .catch(() => {});
    };

    getDeviceId();

    requestUserPermission();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="SplashScreen">
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="GetStartScreen" component={GetStartScreen} />
      <Stack.Screen name="SignUpEmailScreen" component={SignUpEmailScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="SignInScreen" component={SignInScreen} />
      <Stack.Screen name="EmailVerificationScreen" component={EmailVerificationScreen} />
      <Stack.Screen name="MessageScreen" component={MessageScreen} />
      <Stack.Screen name="BlockedUsersScreen" component={BlockedUsersScreen} />
      <Stack.Screen name="Dashboard" component={TabNavigator} />
      <Stack.Screen name="ConnectProfileScreen" component={ConnectProfileScreen} />
      <Stack.Screen name="ReviewsScreen" component={ReviewsScreen} />
      <Stack.Screen name="UpdateProfileScreen" component={UpdateProfileScreen} />
      <Stack.Screen name="UpdatePasswordScreen" component={UpdatePasswordScreen} />
      <Stack.Screen
        name="OnboardingVideoTutorialScreen"
        component={OnboardingVideoTutorialScreen}
      />
      <Stack.Screen name="OnboardingVideoScreen" component={OnboardingVideoScreen} />
      <Stack.Screen name="AvatarUpdateScreen" component={AvatarUpdateScreen} />
      <Stack.Screen name="VerificationSuccessScreen" component={VerificationSuccessScreen} />
      <Stack.Screen
        name="PremiumRequestScreen"
        component={PremiumRequestScreen}
        options={{ ...TransitionPresets.ModalSlideFromBottomIOS }}
      />
      <Stack.Screen name="InterestSelectScreen" component={InterestSelectScreen} />
      <Stack.Screen name="DislikeSelectScreen" component={DislikeSelectScreen} />
      <Stack.Screen name="GetMatchScreen" component={GetMatchScreen} />
      <Stack.Screen name="BirthdayUpdateScreen" component={BirthdayUpdateScreen} />
      <Stack.Screen name="GenderUpdateScreen" component={GenderUpdateScreen} />
      <Stack.Screen name="LocationUpdateScreen" component={LocationUpdateScreen} />
      <Stack.Screen name="OnboardingCompleteScreen" component={OnboardingCompleteScreen} />
      <Stack.Screen name="ProfileTagScreen" component={ProfileTagScreen} />
      <Stack.Screen name="PronounsUpdateScreen" component={PronounsUpdateScreen} />
      <Stack.Screen name="ReviewProfileScreen" component={ReviewProfileScreen} />
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="PurposeUpdateScreen" component={PurposeUpdateScreen} />
      <Stack.Screen name="NameUpdateScreen" component={NameUpdateScreen} />
      <Stack.Screen name="NotificationListScreen" component={NotificationListScreen} />
      <Stack.Screen name="DislikeUpdateScreen" component={DislikeUpdateScreen} />
      <Stack.Screen name="InterestUpdateScreen" component={InterestUpdateScreen} />
      <Stack.Screen name="PurposeProfileScreen" component={PurposeProfileScreen} />
      <Stack.Screen name="AvatarProfileScreen" component={AvatarProfileScreen} />
      <Stack.Screen name="NotificationSettingScreen" component={NotificationSettingScreen} />
      <Stack.Screen name="MySubscriptionScreen" component={MySubscriptionScreen} />
      <Stack.Screen name="ReviewMatchScreen" component={ReviewMatchScreen} />
      <Stack.Screen name="FirstTimeScreen" component={FirstTimeScreen} />
      <Stack.Screen name="ProfileApprovedScreen" component={ProfileApprovedScreen} />
      <Stack.Screen name="ProfileRejectScreen" component={ProfileRejectScreen} />
      <Stack.Screen name="VideoProcessingScreen" component={VideoProcessingScreen} />
      <Stack.Screen name="VideoUpdateScreen" component={VideoUpdateScreen} />
    </Stack.Navigator>
  );
};

export default AppStack;
