import Text from "@/components/Text";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { Image, ImageBackground } from "expo-image";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, TextBase, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import analytics from '@react-native-firebase/analytics'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "#725ED4",
    padding: 16,
  },
});

const ProfileRejectScreen = ({ navigation, route }) => {
  const { message } = route && route.params ? route.params : { message: "Your profile has been rejected." };
  const insets = useSafeAreaInsets();

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "ProfileRejectScreen",
      screen_class: "ProfileRejectScreen",
    })
  }, [])

  useEffect(() => {
    AsyncStorage.setItem("LAST_PROFILE_STATUS_CHECK", dayjs().format());
  }, []);

  const onContinue = () => {
    NavigationService.reset("Dashboard");
  };

  const onOpenProfile = () => {
    NavigationService.resetRaw([
      {
        name: "Dashboard",
        state: {
          index: 2,
          routes: [{ name: "ExploreScreen" }, { name: "MatchesScreen" }, { name: "ProfileScreen" }],
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 32 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>Oops!</Text>
        <Image
          style={{ width: 70, height: 70, tintColor: "white" }}
          contentFit="contain"
          source={images.logo_icon}
        />
        <Text
          style={{
            lineHeight: 24,
            fontSize: 16,
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
          }}
        >
          {message || "Your profile has been rejected."}
        </Text>
        <Text
          style={{
            lineHeight: 24,
            fontSize: 16,
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
          }}
        >
          We encourage you to review this and reapply if you’d like. Thank you for your
          understanding!
        </Text>
      </View>
      <TouchableOpacity
        onPress={onContinue}
        style={{
          width: "100%",
          height: 60,
          borderRadius: 30,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#333333",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Start Exploring</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onOpenProfile}
        style={{
          marginBottom: insets.bottom + 16,
          width: "100%",
          height: 40,
          borderRadius: 30,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "700", color: "white" }}>View My Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileRejectScreen;
