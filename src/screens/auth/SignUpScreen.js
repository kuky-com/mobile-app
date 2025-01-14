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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eeeeee",
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
      <View style={{ flex: 1 }}>
        <Image source={images.sign_up_bg} style={{ width: "100%", height: "100%" }} />
      </View>
      <View
        style={{
          marginTop: -30,
          backgroundColor: "white",
          borderRadius: 25,
          overflow: "hidden",
          padding: 28,
          gap: 20,
          alignItems: "center",
          paddingBottom: 48,
        }}
      >
        <View style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center', width: '100%', gap: 32 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333333' }}>Welcome to Kuky</Text>
          <TouchableOpacity
            onPress={onSignUp}
            style={{
              width: Platform.isPad ? 600 : "100%",
              alignSelf: "center",
              height: 60,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#333333",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>
              Sign up
            </Text>
          </TouchableOpacity>
          {/* <View
          style={{ alignItems: "center", justifyContent: "center", gap: 16, flexDirection: "row" }}
        >
          {Platform.OS === "ios" && (
            <TouchableOpacity
              onPress={onApple}
              disabled={!accepted}
              style={[{
                height: 54,
                borderRadius: 25,
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                backgroundColor: "#EEEEEE",
              }, styles.shadow]}
            >
              <Image
                source={images.apple_icon}
                style={{ width: 20, height: 20, tintColor: accepted ? "#333333" : '#999999' }}
                contentFit="contain"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onGoogle}
            disabled={!accepted}
            style={[{
              height: 54,
              borderRadius: 25,
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              backgroundColor: "#EEEEEE",
            }, styles.shadow]}
          >
            <Image
              source={images.google_icon}
              style={{ width: 20, height: 20, tintColor: accepted ? "#333333" : '#999999' }}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={{ alignSelf: "center", width: Platform.isPad ? 600 : "100%", flexDirection: 'row', alignItems: 'flex-start', gap: 4, paddingHorizontal: 8 }}>
          <TouchableOpacity onPress={() => setAccepted(old => !old)} style={{ width: 20, height: 20, marginTop: 3 }}>
            <FontAwesome5 name={accepted ? 'check-square' : 'square'} solid={accepted} size={20} color={colors.mainColor} />
          </TouchableOpacity>
          <Text onPress={() => setAccepted(old => !old)} style={{ flex: 1, fontSize: 14, fontWeight: 'bold', color: 'black', lineHeight: 25 }}>{`I acknowledge that Kuky is not a substitute for professional mental health services or advice. I understand that Kuky's content is for informational and supportive purposes only.`}</Text>
        </View> */}

          <Text onPress={onSignIn} style={{ textDecorationLine: 'underline', fontSize: 20, fontWeight: "bold", color: colors.mainColor }}>
            Sign in
          </Text>
        </View>

        <View style={{ width: '100%', height: 1, backgroundColor: '#726E7030' }} />
        <Text style={{ color: '#666666', fontSize: 12, textAlign: "center", fontWeight: "500", lineHeight: 17 }}>
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
            fontSize: 9,
            color: "#aaaaaa",
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
