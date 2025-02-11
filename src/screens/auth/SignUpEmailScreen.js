import Text from "@/components/Text";
import colors from "@/utils/colors";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import apiClient from "@/utils/apiClient";
import { useAtomValue, useSetAtom } from "jotai";
import { deviceIdAtom, pushTokenAtom, tokenAtom, userAtom } from "@/actions/global";
import { getAuthenScreen } from "@/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import { FontAwesome5 } from "@expo/vector-icons";
import TextInput from "@/components/TextInput";
import { authenticate, registerToken } from "../../utils/sendbird";
import analytics from '@react-native-firebase/analytics'
import { OneSignal } from "react-native-onesignal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ref } from "@react-native-firebase/storage";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F3",
    paddingHorizontal: 16
  },
});

const SignUpEmailScreen = ({ navigation }) => {
  const deviceId = useAtomValue(deviceIdAtom);
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(tokenAtom);
  const pushToken = useAtomValue(pushTokenAtom);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets()

  const lastNameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const [mode, setMode] = useState("name");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [referralCode, setReferralCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "SignUpEmailScreen",
      screen_class: "SignUpEmailScreen",
    })
  }, [])

  const checkPushToken = () => {
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

  const onContinue = () => {
    if (lastName.length === 0 || firstName.length === 0) {
      Toast.show({ text1: "Please enter your name!", type: "error" });
      return;
    }

    setMode('email')
  }

  const onSignUp = () => {
    if (email.length === 0 || confirmPassword.length === 0 || password.length === 0) {
      Toast.show({ text1: "Please enter your information!", type: "error" });
      return;
    }
    if (confirmPassword !== password) {
      Toast.show({ text1: "Your password and confirm password are not match!", type: "error" });
      return;
    }
    setLoading(true);

    apiClient
      .post("auth/register", { full_name: `${firstName} ${lastName}`, email, password })
      .then((res) => {
        setLoading(false);
        console.log({ res: res.data })
        if (res && res.data && res.data.success) {
          navigation.navigate("EmailVerificationScreen", { email: email });
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
  };

  const openSignIn = () => {
    NavigationService.reset("SignInScreen");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
      <StatusBar translucent style="dark" />
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end' }}>
        <TouchableOpacity onPress={openSignIn} style={{ justifyContent: 'center', backgroundColor: '#725ED4', height: 30, borderRadius: 15, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: "bold", color: "#F1F1F3" }}>Sign in</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAwareScrollView
        style={{ width: "100%", flex: 1, }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignItems: "center",
            width: Platform.isPad ? 600 : "100%",
            alignSelf: "center",
            flex: 1,
            gap: 16,
          }}
        >
          <View style={{ width: '100%', gap: 10 }}>
            <Image source={images.logo_icon} style={{ width: 40, height: 40 }} contentFit="contain" />
            <Text style={{ fontSize: 24, color: "#333333", fontWeight: "600" }}>
              Create an account
            </Text>
          </View>
          {
            mode === 'name' &&
            <View style={{ width: '100%', flex: 1, gap: 16 }}>
              <View style={{ width: '100%' }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000000', lineHeight: 30 }}>First name</Text>
                <View
                  style={{
                    width: "100%",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: "#726E70",
                  }}
                >
                  <TextInput
                    placeholder="First name"
                    placeholderTextColor="#AAAAAA"
                    underlineColorAndroid="#00000000"
                    style={{ fontSize: 16, lineHeight: 20, color: "black", fontWeight: "500" }}
                    clearButtonMode="always"
                    value={firstName}
                    onChangeText={setFirstName}
                    onEndEditing={() => lastNameInputRef.current.focus()}
                    autoFocus
                  />
                </View>
              </View>

              <View style={{ width: '100%' }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000000', lineHeight: 30 }}>Last name</Text>
                <View
                  style={{
                    width: "100%",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: "#726E70",
                  }}
                >
                  <TextInput
                    ref={lastNameInputRef}
                    placeholder="Last name"
                    placeholderTextColor="#AAAAAA"
                    underlineColorAndroid="#00000000"
                    style={{ fontSize: 16, lineHeight: 20, color: "black", fontWeight: "500" }}
                    clearButtonMode="always"
                    value={lastName}
                    onChangeText={setLastName}
                    onEndEditing={onContinue}
                  />
                </View>
              </View>
            </View>
          }
          {
            mode === 'email' &&
            <View style={{ width: '100%', flex: 1, gap: 16 }}>
              <View style={{ width: '100%' }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000000', lineHeight: 30 }}>Email address</Text>
                <View
                  style={{
                    width: "100%",
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: "#726E70",
                  }}
                >
                  <TextInput
                    ref={emailInputRef}
                    placeholder="Email address"
                    placeholderTextColor="#AAAAAA"
                    underlineColorAndroid="#00000000"
                    style={{ fontSize: 16, lineHeight: 20, color: "black", fontWeight: "500" }}
                    clearButtonMode="always"
                    value={email}
                    onChangeText={(text) => setEmail(text.toLowerCase())}
                    keyboardType="email-address"
                    onEndEditing={() => passwordInputRef.current.focus()}
                    autoFocus
                  />
                </View>
              </View>
              <View style={{ width: '100%' }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000000', lineHeight: 30 }}>Create a password</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: "#726E70",
                  }}
                >
                  <TextInput
                    ref={passwordInputRef}
                    placeholder="Create a password"
                    placeholderTextColor="#AAAAAA"
                    underlineColorAndroid="#00000000"
                    style={{ fontSize: 16, lineHeight: 20, color: "black", fontWeight: "500", flex: 1 }}
                    clearButtonMode="always"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onEndEditing={() => confirmPasswordInputRef.current.focus()}
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
                <Text style={{color: '#7A7A7A', fontSize: 10, fontWeight: '600', lineHeight: 18, marginTop: 5}}>At least 8 characters, including a number or symbol.</Text>
              </View>

              <View style={{ width: '100%' }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000000', lineHeight: 30 }}>Confirm password</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: "#726E70",
                  }}
                >
                  <TextInput
                    ref={confirmPasswordInputRef}
                    placeholder="Confirm password"
                    placeholderTextColor="#AAAAAA"
                    underlineColorAndroid="#00000000"
                    style={{ fontSize: 16, lineHeight: 20, color: "black", fontWeight: "500", flex: 1 }}
                    clearButtonMode="always"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
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

              {/* <View style={{ width: '100%' }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000000', lineHeight: 30 }}>Enter your referral code <Text style={{ color: '#949494' }}>(optional)</Text></Text>
                <View
                  style={{
                    width: "100%",
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: "#726E70",
                  }}
                >
                  <TextInput
                    placeholder="Referral code"
                    placeholderTextColor="#AAAAAA"
                    underlineColorAndroid="#00000000"
                    style={{ fontSize: 16, lineHeight: 20, color: "black", fontWeight: "500" }}
                    clearButtonMode="always"
                    value={referralCode}
                    onChangeText={(text) => setReferralCode(text.toLowerCase())}
                  />
                </View>
              </View> */}
            </View>
          }
        </View>
      </KeyboardAwareScrollView>

      {
        mode === 'name' &&
        <ButtonWithLoading text={"Continue"} onPress={onContinue} loading={loading} />
      }

      {
        mode === 'email' &&
        <ButtonWithLoading text={"Create an account"} onPress={onSignUp} loading={loading} />
      }
    </View>
  );
};

export default SignUpEmailScreen;
