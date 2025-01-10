import Text from "@/components/Text";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
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
    backgroundColor: "#725ED4",
    padding: 16,
    gap: 24,
  },
});

const OnboardingCompleteScreen = ({ navigation }) => {
  const [animation, setAnimation] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "OnboardingCompleteScreen",
      screen_class: "OnboardingCompleteScreen",
    });
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setAnimation(false);
    }, 5000);
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
      {animation && (
        <View style={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
          <LottieView
            style={{
              width: Dimensions.get("screen").width,
              height: Dimensions.get("screen").width,
            }}
            autoPlay
            source={require("../../assets/animations/complete.json")}
            resizeMode="cover"
          />
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
            Your profile is all set up.
          </Text>
        </View>
      )}
      {!animation && (
        <>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 32 }}>
            <Image
              style={{ width: 70, height: 70, tintColor: "white" }}
              contentFit="contain"
              source={images.logo_icon}
            />
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
              Thanks for joining Kuky!{" "}
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
              Your account is under review and will be approved soon.{" "}
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
              In the meantime, feel free to explore and discover other users!
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
        </>
      )}
    </View>
  );
};

export default OnboardingCompleteScreen;
