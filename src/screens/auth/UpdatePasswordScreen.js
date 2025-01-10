import ButtonWithLoading from "@/components/ButtonWithLoading";
import Text from "@/components/Text";
import TextInput from "@/components/TextInput";
import apiClient from "@/utils/apiClient";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Keyboard, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
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

const UpdatePasswordScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "UpdatePasswordScreen",
      screen_class: "UpdatePasswordScreen",
    })
  }, [])

  const updatePassword = async () => {
    if (oldPassword.length < 6 || newPassword.length < 6) {
      Toast.show({ text1: "Password must have at least 6 characters", type: "error" });
      return;
    }
    if (oldPassword === newPassword) {
      Toast.show({ text1: "New password cannot same old password", type: "error" });
      return;
    }
    try {
      Keyboard.dismiss();
      setLoading(true);

      apiClient
        .post("auth/update-password", { current_password: oldPassword, new_password: newPassword })
        .then((res) => {
          console.log({ res });
          setLoading(false);
          if (res && res.data && res.data.success) {
            Toast.show({ text1: res.data.message, type: "success" });
            navigation.goBack();
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
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
          >
            <Image
              source={images.back_icon}
              style={{ width: 25, height: 25 }}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 20, color: "white", fontWeight: "bold" }}>Update Password</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: "white", marginTop: -40, paddingTop: 40 }}>
        <KeyboardAwareScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16, paddingTop: 24 }}
        >
          <View style={{ flex: 1, gap: 16 }}>
            <Text style={{ fontSize: 14, color: "#646464" }}>Your old password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={{
                  fontSize: 16,
                  color: "black",
                  fontWeight: "bold",
                  padding: 16,
                  width: "100%",
                  fontFamily: "Comfortaa-Bold",
                }}
                underlineColorAndroid="#000000"
                placeholder="Your old password"
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>

            <Text style={{ fontSize: 14, color: "#646464" }}>Your new password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={{
                  fontSize: 16,
                  color: "black",
                  fontWeight: "bold",
                  padding: 16,
                  width: "100%",
                  fontFamily: "Comfortaa-Bold",
                }}
                underlineColorAndroid="#000000"
                placeholder="Your new password"
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>

        <View style={{ width: "100%", paddingHorizontal: 16, marginBottom: insets.bottom + 20 }}>
          <ButtonWithLoading onPress={updatePassword} text="Update Password" loading={loading} />
        </View>
      </View>
    </View>
  );
};

export default UpdatePasswordScreen;
