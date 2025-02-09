import Text from "@/components/Text";
import images from "@/utils/images";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import NavigationService from "@/utils/NavigationService";
import { StatusBar } from "expo-status-bar";
import apiClient from "@/utils/apiClient";
import { useAtomValue, useSetAtom } from "jotai";
import { deviceIdAtom, pushTokenAtom, tokenAtom, userAtom } from "@/actions/global";
import { getAuthenScreen } from "@/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingView from "@/components/LoadingView";
import { authenticate, registerToken } from "../../utils/sendbird";
import { FontAwesome5 } from "@expo/vector-icons";
import colors from "../../utils/colors";
import analytics from '@react-native-firebase/analytics'
import { getBuildNumber, getVersion } from "react-native-device-info";
import { NODE_ENV } from "../../utils/apiClient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#725ED4",
  },
  shadow: {
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    elevation: 1,
    shadowColor: '#000000',
  }
});

const SignUpScreen = ({ navigation }) => {
  const deviceId = useAtomValue(deviceIdAtom);
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(tokenAtom);
  const pushToken = useAtomValue(pushTokenAtom);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "SignUpScreen",
      screen_class: "SignUpScreen",
    })
  }, [])

  useEffect(() => {
    GoogleSignin.configure({
      scopes: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/plus.me",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      iosClientId: "412387490825-am138on43a9aarl0kt0oj9096v2akl1s.apps.googleusercontent.com",
      webClientId: "412387490825-jgoa1hmhhcojmik0qkcc3dnc089sfb6s.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    if (Platform.OS === "ios") {
      return appleAuth.onCredentialRevoked(async () => {
        console.warn("If this function executes, User Credentials have been Revoked");
      });
    }
  }, []);

  const checkPushToken = () => {
    if (pushToken) {
      registerToken();
      apiClient
        .post("users/update-token", { session_token: pushToken })
        .then((res) => { })
        .catch((error) => {
          console.log({ error });
        });
    }
  };

  const onGoogle = async () => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log({ response });
      if (response && response.data && response.data.idToken) {
        apiClient
          .post("auth/google", {
            token: response.data.idToken,
            device_id: deviceId,
            platform: Platform.OS,
          })
          .then((res) => {
            console.log({ res: res.data });
            setLoading(false);
            if (res && res.data && res.data.success) {
              setUser(res.data.data.user);
              setToken(res.data.data.token);
              AsyncStorage.setItem("ACCESS_TOKEN", res.data.data.token);
              AsyncStorage.setItem("SENDBIRD_TOKEN", res.data.data.sendbirdToken);
              AsyncStorage.setItem("USER_ID", res.data.data.user.id.toString());
              authenticate();
              setTimeout(() => {
                checkPushToken();
              }, 200);
              NavigationService.reset(getAuthenScreen(res.data.data.user));
            } else {
              Toast.show({ text1: res?.data?.message, type: "error" });
            }
          })
          .catch((error) => {
            console.log({ error });
            setLoading(false);
            Toast.show({ text1: error, type: "error" });
          });
      } else {
        // sign in was cancelled by user
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const onApple = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      if (!appleAuthRequestResponse.identityToken) {
        Toast.show({ text1: "Error", text2: "Cannot login", type: "error" });
        return;
      }

      let full_name = undefined;
      if (
        appleAuthRequestResponse.fullName &&
        appleAuthRequestResponse.fullName?.givenName &&
        appleAuthRequestResponse.fullName?.familyName
      ) {
        full_name = `${appleAuthRequestResponse.fullName?.givenName} ${appleAuthRequestResponse.fullName?.familyName}`;
      }

      setLoading(true);

      apiClient
        .post("auth/apple", {
          full_name,
          token: appleAuthRequestResponse.identityToken,
          device_id: deviceId,
          platform: Platform.OS,
        })
        .then((res) => {
          setLoading(false);
          if (res && res.data && res.data.success) {
            if (res.data.data) {
              setUser(res.data.data.user);
              setToken(res.data.data.token);
              AsyncStorage.setItem("ACCESS_TOKEN", res.data.data.token);
              AsyncStorage.setItem("SENDBIRD_TOKEN", res.data.data.sendbirdToken);
              AsyncStorage.setItem("USER_ID", res.data.data.user.id.toString());
              authenticate();
              setTimeout(() => {
                checkPushToken();
              }, 200);
              NavigationService.reset(getAuthenScreen(res.data.data.user));
            } else {
              Alert.alert("Error", res.data.message);
            }
          } else {
            Toast.show({ text1: res?.data?.message, type: "error" });
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

  const onSignUp = () => {
    NavigationService.reset("SignUpEmailScreen");
  };

  const onSignIn = () => {
    NavigationService.reset("SignInScreen");
  };

  const openTerm = () => {
    Linking.openURL("https://www.kuky.com/terms-and-service");
  };

  const openPolicy = () => {
    Linking.openURL("https://www.kuky.com/privacy-policy");
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent style="light" />
      <View
        style={{
          padding: 28,
          gap: 20,
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: insets.bottom + 8,
          paddingTop: insets.top + 8,
          flex: 1
        }}
      >
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end' }}>
          <TouchableOpacity onPress={onSignIn} style={{ height: 30, borderRadius: 15, backgroundColor: '#C9DACC', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: "bold", color: '#333333' }}>
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', width: '100%', gap: 16 }}>
          <Image source={images.logo_icon} style={{ width: 30, height: 30, tintColor: 'white' }} contentFit="contain" />
          <Image source={images.logo_text} style={{ width: 100, height: 30, tintColor: 'white' }} contentFit="contain" />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff' }}>Better Together</Text>

        </View>

        <TouchableOpacity
          onPress={onSignUp}
          style={{
            width: Platform.isPad ? 600 : "100%",
            alignSelf: "center",
            height: 50,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#333333",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>
            Use my Email address
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onApple}
          style={{
            width: Platform.isPad ? 600 : "100%",
            alignSelf: "center",
            height: 50,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#333333",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>
            Connect with Apple
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onGoogle}
          style={{
            width: Platform.isPad ? 600 : "100%",
            alignSelf: "center",
            height: 50,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#333333",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>
            Connect with Google
          </Text>
        </TouchableOpacity>

        <View style={{ width: '100%', height: 1, backgroundColor: '#726E7030' }} />
        <Text style={{ color: '#ffffff', fontSize: 12, textAlign: "center", fontWeight: "500", lineHeight: 17 }}>
          {`By tapping Sign Up / Login, you agree to our `}
          <Text onPress={openTerm} style={{ textDecorationLine: "underline", fontWeight: "bold" }}>Terms</Text>
          {` .\nLearn how we process your data in our  `}
          <Text
            onPress={openPolicy}
            style={{ textDecorationLine: "underline", fontWeight: "bold" }}
          >
            Privacy Policy
          </Text>
          {` and `}
          <Text
            onPress={openPolicy}
            style={{ textDecorationLine: "underline", fontWeight: "bold" }}
          >
            Cookies Policy
          </Text>
          {`.`}
        </Text>

        <Text
          style={{
            fontSize: 10,
            color: "#eeeeee",
            fontWeight: "bold",
            width: "100%",
            textAlign: "center",
          }}
        >
          {`Version ${getVersion()} - ${NODE_ENV.toUpperCase()} - Build ${getBuildNumber()} - ${Platform.OS.toUpperCase()} - © 2024 Kuky`}
        </Text>
      </View>

      {loading && <LoadingView />}
    </View>
  );
};

export default SignUpScreen;
