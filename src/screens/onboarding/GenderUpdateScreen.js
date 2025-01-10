import Text from "@/components/Text";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ImagePicker from "react-native-image-crop-picker";
import { StatusBar } from "expo-status-bar";
import dayjs from "dayjs";
import Toast from "react-native-toast-message";
import axios from "axios";
import { capitalize, getAuthenScreen } from "@/utils/utils";
import DoubleSwitch from "@/components/DoubleSwitch";
import SwitchWithText from "@/components/SwitchWithText";
import apiClient from "@/utils/apiClient";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import analytics from '@react-native-firebase/analytics'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 24,
  },
  itemContainer: {
    backgroundColor: "#ECECEC",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    elevation: 1,
    shadowColor: "#000000",
    flexDirection: "row",
    paddingHorizontal: 22,
  },
  closeButton: {
    width: 30,
    height: 30,
    backgroundColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    position: "absolute",
    top: 8,
    right: 8,
  },
});

const GenderUpdateScreen = ({ navigation, route }) => {
  // const { onboarding } = route.params
  const insets = useSafeAreaInsets();
  const [gender, setGender] = useState(null);
  const [isPublic, setPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "GenderUpdateScreen",
      screen_class: "GenderUpdateScreen",
    });
  }, [])

  const onContinue = () => {
    try {
      setLoading(true);
      apiClient
        .post("users/update", { publicGender: isPublic, gender })
        .then((res) => {
          setLoading(false);
          if (res && res.data && res.data.success) {
            // NavigationService.reset('PronounsUpdateScreen')
            NavigationService.reset(getAuthenScreen(res.data.data));
            // Toast.show({ text1: res.data.message, type: 'success' })
          } else {
            Toast.show({ text1: res.data.message, type: "error" });
          }
        })
        .catch((error) => {
          setLoading(false);
          console.log({ error });
          Toast.show({ text1: error, type: "error" });
        });
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}
    >
      <StatusBar translucent style="dark" />
      <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : "100%", alignSelf: "center" }}>
        <Image
          source={images.logo_with_text}
          style={{ width: 120, height: 40, marginBottom: 32 }}
          contentFit="contain"
        />
        <Text
          style={{ fontSize: 24, fontWeight: "bold", color: "black" }}
        >{`What’s your gender?`}</Text>
        <Text
          style={{ fontSize: 16, fontWeight: "500", color: "black", lineHeight: 22 }}
        >{`Choose which best describes you.You can also add more about your gender if you would like.`}</Text>
        <View
          style={{
            flex: 1,
            width: "100%",
            paddingVertical: 32,
            gap: 16,
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          {["Male", "Female", "Non Binary"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setGender(item)}
              style={styles.itemContainer}
            >
              <Text style={{ flex: 1, fontSize: 16, fontWeight: "bold", color: "#333333" }}>
                {item}
              </Text>
              <Image
                source={gender === item ? images.checked_icon : images.uncheck_icon}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />
            </TouchableOpacity>
          ))}
          <SwitchWithText enable={isPublic} setEnable={setPublic} />
        </View>
      </View>

      <ButtonWithLoading
        text="Continue"
        onPress={onContinue}
        disabled={gender === null}
        loading={loading}
      />
    </View>
  );
};

export default GenderUpdateScreen;
