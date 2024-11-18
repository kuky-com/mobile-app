import "./global.css";
import { StatusBar } from "expo-status-bar";
import { Dimensions, StyleSheet, View } from "react-native";
import { useFonts } from "expo-font";
import Text from "@/components/Text";
import MainApp from "@/screens";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import images from "@/utils/images";
import { Image } from "expo-image";
import { isReadyRef, navigationRef } from "@/utils/NavigationService";
import { Provider } from "jotai";
import { storeAtom } from "@/actions/global";
import "./sheets";
import { SheetProvider } from "react-native-actions-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Suspense, useEffect } from "react";
import dayjs from "dayjs";
import * as Linking from "expo-linking";
import Smartlook from "react-native-smartlook-analytics";
import { AEMReporterIOS, AppEventsLogger, Settings } from "react-native-fbsdk-next";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { AlertProvider } from "@/components/AlertProvider";
import { AppUpdateAlertProvider } from "@/components/AppUpdateAlert";
import { Amplify } from "aws-amplify";
import amplifyconfig from "./src/amplifyconfiguration.json";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
Amplify.configure(amplifyconfig);

Smartlook.instance.preferences.setProjectKey("6bebfbc50c0aedc486a2766bc51c24d0d2b4a13f");
Smartlook.instance.start();

const prefix = Linking.createURL("/");

import relativeTime from "dayjs/plugin/relativeTime"
import customParseFormat from "dayjs/plugin/customParseFormat"
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

const queryClient = new QueryClient();

{
  /* <BaseToast
      {...props}
      style={{ padding: 0, margin: 0, backgroundColor: '#725ED4', width: Dimensions.get('screen').width, height: Dimensions.get('screen').height, alignItems: 'center' }}
      contentContainerStyle={{ padding: 0, margin: 0, backgroundColor: '#725ED4', width: Dimensions.get('screen').width, height: Dimensions.get('screen').height, alignItems: 'center' }}
      text1Style={{
        fontSize: 15,
        fontWeight: '400'
      }}
    /> */
}
const toastConfig = {
  sent: ({ text1, props, text2 }) => (
    <View
      style={{
        flex: 1,
        padding: 16,
        margin: 0,
        gap: 32,
        backgroundColor: "#725ED4",
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StatusBar backgroundColor="#725ED4" />
      <Image source={images.sent_icon} style={{ width: 120, height: 120 }} contentFit="contain" />
      <Text
        style={{
          fontSize: 20,
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {text1}
      </Text>
      <Text
        style={{
          fontSize: 18,
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {text2}
      </Text>
    </View>
  ),
  deny: ({ text1, props, text2 }) => (
    <View
      style={{
        flex: 1,
        padding: 16,
        margin: 0,
        gap: 32,
        backgroundColor: "#725ED4",
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image source={images.deny_icon} style={{ width: 120, height: 120 }} contentFit="contain" />
    </View>
  ),
  review_sent: ({ text1, props, text2 }) => (
    <View
      style={{
        flex: 1,
        padding: 16,
        margin: 0,
        gap: 32,
        backgroundColor: "#000000aa",
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StatusBar backgroundColor="#725ED4" />
      <View
        style={{
          backgroundColor: "#725ED4",
          width: "100%",
          gap: 20,
          paddingHorizontal: 16,
          paddingVertical: 48,
          borderRadius: 16,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Thank you for your feedback!
        </Text>
        <Text
          style={{
            fontSize: 16,
            lineHeight: 18,
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >{`Your review has been submitted.\nYour input helps us build a supportive and positive community.`}</Text>
      </View>
    </View>
  ),
};

export default function App() {
  useEffect(() => {
    Settings.initializeSDK();
    Settings.setAutoLogAppEventsEnabled(true);
    Settings.setAdvertiserTrackingEnabled(true);
    Settings.setAdvertiserIDCollectionEnabled(true);

    const loadAppEvent = async () => {
      const { status } = await requestTrackingPermissionsAsync();
      Settings.setAppID("1051248213166532");

      if (status === "granted") {
        await Settings.setAdvertiserTrackingEnabled(true);
      }

      AppEventsLogger.logEvent("start_app_event");
      AEMReporterIOS.logAEMEvent("start_app_event", 1);
      console.log("log start event");
    };

    loadAppEvent();
  }, []);

  const linking = {
    prefixes: [prefix, "http://kuky.com", "kuky://kuky.com"],
  };

  const [loaded, error] = useFonts({
    "Comfortaa-Light": require("./src/assets/fonts/Comfortaa-Light.ttf"),
    "Comfortaa-Regular": require("./src/assets/fonts/Comfortaa-Regular.ttf"),
    "Comfortaa-Medium": require("./src/assets/fonts/Comfortaa-Medium.ttf"),
    "Comfortaa-SemiBold": require("./src/assets/fonts/Comfortaa-SemiBold.ttf"),
    "Comfortaa-Bold": require("./src/assets/fonts/Comfortaa-Bold.ttf"),
  });

  return (
    <SafeAreaProvider>
      <SheetProvider>
        <AppUpdateAlertProvider>
          <AlertProvider>
            <NavigationContainer
              ref={navigationRef}
              linking={linking}
              onReady={() => {
                isReadyRef.current = true;
              }}
            >
              <StatusBar translucent style="dark" />
              <Suspense>
                <QueryClientProvider client={queryClient}>
                  <Provider store={storeAtom}>
                    <MainApp />
                  </Provider>
                </QueryClientProvider>
              </Suspense>
              <Toast config={toastConfig} />
            </NavigationContainer>
          </AlertProvider>
        </AppUpdateAlertProvider>
      </SheetProvider>
    </SafeAreaProvider>
  );
}
