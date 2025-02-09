import Text from "@/components/Text";
import colors from "@/utils/colors";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { deviceIdAtom, pushTokenAtom, tokenAtom, userAtom } from "@/actions/global";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/utils/apiClient";
import { getAuthenScreen } from "@/utils/utils";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import { FontAwesome5 } from "@expo/vector-icons";
import TextInput from "@/components/TextInput";
import { authenticate } from "../../utils/sendbird";
import analytics from '@react-native-firebase/analytics'
import { OneSignal } from "react-native-onesignal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F3",
    paddingHorizontal: 24
  },
});

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setToken = useSetAtom(tokenAtom);
  const setUser = useSetAtom(userAtom);
  const deviceId = useAtomValue(deviceIdAtom);
  const pushToken = useAtomValue(pushTokenAtom);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const insets = useSafeAreaInsets()
  const passwordInputRef = useRef(null)

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "SignInScreen",
      screen_class: "SignInScreen",
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
      apiClient
        .post("users/update-token", { session_token: pushToken })
        .then((res) => {
          console.log({ res });
        })
        .catch((error) => {
          console.log({ error });
        });
    }
  };

  const onGoogle = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log({ response })
      if (response && response.data && response.data.idToken) {
        apiClient
          .post("auth/google", {
            token: response.data.idToken,
            device_id: deviceId,
            platform: Platform.OS,
          })
          .then((res) => {
            setLoading(false);
            console.log({ res })
            if (res && res.data && res.data.success) {
              setUser(res.data.data.user);
              setToken(res.data.data.token);
              AsyncStorage.setItem("ACCESS_TOKEN", res.data.data.token);
              AsyncStorage.setItem("USER_ID", res.data.data.user.id.toString());
              AsyncStorage.setItem("SENDBIRD_TOKEN", res.data.data.sendbirdToken);
              authenticate();
              setTimeout(() => {
                checkPushToken();
              }, 200);

              OneSignal.Notifications.requestPermission(true);
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
    if (loading) return;
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      if (!appleAuthRequestResponse.identityToken) {
        Toast.show({ text1: "Error", text2: "Unable to login", type: "error" });
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
              AsyncStorage.setItem("USER_ID", res.data.data.user.id.toString());
              AsyncStorage.setItem("SENDBIRD_TOKEN", res.data.data.sendbirdToken);
              authenticate();
              setTimeout(() => {
                checkPushToken();
              }, 200);

              OneSignal.Notifications.requestPermission(true);
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

  const onSignIn = () => {
    if (email.length === 0 || password.length === 0) {
      Toast.show({ text1: "Please enter your email and password", type: "error" });
      return;
    }
    if (loading) return;
    setLoading(true);
    apiClient
      .post("auth/login", { email, password, device_id: deviceId, platform: Platform.OS })
      .then(async (res) => {
        // console.log({ res })
        setLoading(false);
        if (res && res.data && res.data.success) {
          const currentUser = res.data.data.user;
          setUser(currentUser);
          setToken(res.data.data.token);
          await AsyncStorage.setItem("ACCESS_TOKEN", res.data.data.token);
          await AsyncStorage.setItem("SENDBIRD_TOKEN", res.data.data.sendbirdToken);
          await AsyncStorage.setItem("USER_ID", res.data.data.user.id.toString());
          authenticate();
          // Toast.show({ text1: res.data.message, type: 'success' })
          setTimeout(() => {
            checkPushToken();
          }, 200);

          OneSignal.Notifications.requestPermission(true);
          NavigationService.reset(getAuthenScreen(currentUser));
        } else {
          Toast.show({ text1: res.data.message, type: "error" });
          if (res.data.message === "Email not verified") {
            apiClient
              .post("auth/resend-verification", { email: email })
              .then((res) => { })
              .catch((error) => {
                console.log({ error });
              });

            NavigationService.reset("EmailVerificationScreen", { email });
          }
        }
      })
      .catch((error) => {
        console.log({ error });
        Toast.show({ text1: error, type: "error" });

        setLoading(false);
      });
  };

  const onSignUp = () => {
    NavigationService.reset("SignUpEmailScreen");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 8, gap: 16, alignItems: 'center' }]}>
      <StatusBar translucent style="dark" />
      <KeyboardAwareScrollView
        style={{ width: "100%", flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignItems: "center",
            width: Platform.isPad ? 600 : "100%",
            alignSelf: "center",
            flex: 1,
            gap: 20,
          }}
        >
          <View style={{ width: '100%', gap: 10 }}>
            <Image source={images.logo_icon} style={{ width: 40, height: 40 }} contentFit="contain" />
            <Text style={{ fontSize: 24, color: "#333333", fontWeight: "600" }}>
              Welcome back!
            </Text>
          </View>

          <View style={{ width: '100%' }}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000000', lineHeight: 30 }}>Email address</Text>
            <View
              style={{
                width: "100%",
                paddingHorizontal: 16,
                height: 50,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: "#726E70",
                justifyContent: 'center',
              }}
            >
              <TextInput
                placeholder="Email address"
                placeholderTextColor="#AAAAAA"
                underlineColorAndroid="#00000000"
                style={{ fontSize: 16, lineHeight: 20, color: "black", fontWeight: "500" }}
                clearButtonMode="always"
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase())}
                keyboardType="email-address"
                onEndEditing={() => passwordInputRef.current.focus()}
              />
            </View>
          </View>
          <View style={{ width: '100%' }}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000000', lineHeight: 30 }}>Your password</Text>
            <View
              style={{
                width: "100%",
                paddingHorizontal: 16,
                height: 50,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: "#726E70",
                flexDirection: 'row', alignItems: 'center'
              }}
            >
              <TextInput
                ref={passwordInputRef}
                placeholder="Password"
                placeholderTextColor="#AAAAAA"
                underlineColorAndroid="#00000000"
                style={{ fontSize: 16, lineHeight: 20, color: "black", fontWeight: "500", flex: 1 }}
                clearButtonMode="always"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onEndEditing={onSignIn}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((old) => !old)}
                style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}
              >
                <FontAwesome5
                  name={!showPassword ? "eye" : "eye-slash"}
                  size={20}
                  color={!showPassword ? "black" : "#777777"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ButtonWithLoading text={"Sign in"} onPress={onSignIn} loading={loading} />

          {/* <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              flexDirection: "row",
            }}
          >
            {Platform.OS === "ios" && (
              <TouchableOpacity
                onPress={onApple}
                style={{
                  height: 54,
                  borderRadius: 25,
                  alignItems: "center",
                  justifyContent: "center",
                  width: 80,
                  backgroundColor: "#333333",
                }}
              >
                <Image
                  source={images.apple_icon}
                  style={{ width: 20, height: 20, tintColor: 'white' }}
                  contentFit="contain"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onGoogle}
              style={{
                height: 54,
                borderRadius: 25,
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                backgroundColor: "#333333",
              }}
            >
              <Image
                source={images.google_icon}
                style={{ width: 20, height: 20, tintColor: 'white' }}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View> */}


        </View>
      </KeyboardAwareScrollView>

      <View style={{ width: "100%", flexDirection: "row", alignItems: "center", gap: 5 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: "#726E70" }} />
        <Text style={{ fontSize: 18, color: "#726E70", fontWeight: "bold" }}>or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#726E70" }} />
      </View>

      <ButtonWithLoading text={"Connect with Apple"} onPress={onApple} loading={loading} />

      <ButtonWithLoading text={"Connect with Google"} onPress={onGoogle} loading={loading} />

      <TouchableOpacity onPress={onSignUp} style={{ padding: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#333333" }}>
          {`Are you new ? `}
          <Text style={{ color: "#5E30C1" }}>Sign up here</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignInScreen;
