import { userAtom } from "@/actions/global";
import { useAlert } from "@/components/AlertProvider";
import AvatarImage from "@/components/AvatarImage";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import Text from "@/components/Text";
import TextInput from "@/components/TextInput";
import apiClient from "@/utils/apiClient";
import colors from "@/utils/colors";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import axios from "axios";
import { Image, ImageBackground } from "expo-image";
import { useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import analytics from '@react-native-firebase/analytics'
import * as Location from 'expo-location';
import { FontAwesome6 } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import { StatusBar } from "expo-status-bar";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 16
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeButton: {
    marginTop: 50,
    marginLeft: 20,
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
  },
});

const ReferralUpdateScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [referral, setReferral] = useState("");

  const [openQrScanner, setopenQrScanner] = useState(false);

  useEffect(() => {
    analytics().logScreenView({
      screen_name: 'ReferralUpdateScreen',
      screen_class: 'ReferralUpdateScreen',
    });
  }, [])

  const onContinue = async () => {
    if (referral && referral.length > 0) {
      try {
        const resR = await apiClient.post('users/use-referral', { referral_code: referral })
        console.log({ resR })

        console.log({resR})

        if(resR.data.success){
          NavigationService.reset("BirthdayUpdateScreen");
        } else {
          if(resR.data.message) {
            Toast.show({ text1: resR.data.message, type: 'error' })
          } else {
            Toast.show({ text1: 'Invalid referral code', type: 'error' })
          }
        }
      } catch (error) {
        console.log({ error })
        Toast.show({ text1: 'Invalid referral code', type: 'error' })
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 8 }]}>
      <StatusBar translucent style='dark' />
      <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
        <Image source={images.logo_icon} style={{ width: 40, height: 40, marginBottom: 8 }} contentFit='contain' />
        <Text style={{ fontSize: 24, lineHeight: 40, maxWidth: '80%', fontWeight: 'bold', color: 'black' }}>{`Let’s complete your profile!`}</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: 'black' }}>Enter your referral code <Text style={{ color: '#949494' }}>(optional)</Text></Text>
        <KeyboardAwareScrollView>
          <View
            style={{
              width: "100%",
              height: 53,
              borderRadius: 20,
              backgroundColor: "white",
              alignItems: "center",
              flexDirection: "row",
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontFamily: "Comfortaa-Bold",
                fontSize: 14,
                color: "black",
                fontWeight: "bold",
                paddingVertical: 5,
                paddingHorizontal: 8,
              }}
              underlineColorAndroid={"#00000000"}
              value={referral}
              onChangeText={setReferral}
              placeholder="Rererral code"
              placeholderTextColor="#777777"
            />

            <TouchableOpacity style={{ height: 30, width: 30, alignItems: 'center', justifyContent: 'center' }} onPress={() => setopenQrScanner(true)}>
              <FontAwesome6 name='qrcode' size={20} color='black' />
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
        <ButtonWithLoading
          text='Continue'
          onPress={onContinue}
          disabled={referral.length < 3}
        />
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', padding: 8 }}
            onPress={() => NavigationService.reset('BirthdayUpdateScreen')}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333333' }}>Continue without referral</Text>
          </TouchableOpacity>
        </View>
        {
          openQrScanner && (
            <CameraView
              style={StyleSheet.absoluteFill}
              onBarcodeScanned={(data) => {
                setopenQrScanner(false)
                setReferral(data)
              }}
              barcodeScannerSettings={{
                barcodeTypes: ['qr']
              }}
            >
              <View style={styles.overlay}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setopenQrScanner(false)}
                >
                  <FontAwesome6 name='xmark' size={20} color='white' />
                </TouchableOpacity>
              </View>
            </CameraView>
          )
        }
      </View>
    </View>
  );
};

export default ReferralUpdateScreen;
