import ButtonWithLoading from "@/components/ButtonWithLoading";
import Text from "@/components/Text";
import colors from "@/utils/colors";
import constants from "@/utils/constants";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { getUnit } from "@/utils/utils";
import dayjs from "dayjs";
import { Image, ImageBackground } from "expo-image";
import React, { useEffect, useState } from "react";
import Swiper from 'react-native-swiper';

import {
  Alert,
  DeviceEventEmitter,
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Purchases from "react-native-purchases";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import analytics, { settings } from '@react-native-firebase/analytics'
import apiClient from "../../utils/apiClient";
import { useAtomValue } from "jotai";
import { userAtom } from "../../actions/global";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#725ED4",
    gap: 16,
    paddingHorizontal: 16
  },
   slide: {
    backgroundColor: '#725ED4',
    borderRadius: 14,
    padding: 20,
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
  },
planHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
},
title: {
  fontSize: 20,
  color: '#fff',
  fontWeight: 'bold',
  marginBottom: 8,
},
price: {
  fontSize: 14,
  color: '#fff',
},
  bullet: {
    color: '#fff',
    fontSize: 15,
  },
  disabledBullet: {
    color: '#ccc',
    fontSize: 14,
  },
  premiumBtn: {
    backgroundColor: '#E8FF58',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 16,
    width: '100%',
  },
  premiumBtnText: {
    color: '#4B3FA3',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancel: {
    textAlign: 'center',
    fontSize: 12,
    color: '#ccc',
    width: '100%',
    marginTop: 4,
  },
  freeBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
  },
  freeBtnText: {
    color: '#ccc',
    fontWeight: 'bold',
  },
});

const productListDefault = Platform.select({
  ios: ["com.kuky.ios.1month", "com.kuky.ios.6month", "com.kuky.ios.12month"],
  android: ["com.kuky.android.1month", "com.kuky.android.6month", "com.kuky.android.12month"],
});

const planFeatures = [
  { key: '1', label: 'Unlimited connections', isPremium: true, isFree: false },
  { key: '2', label: 'Unlimited calls', isPremium: true, isFree: false },
  { key: '3', label: 'Smart daily matchmaking', isPremium: true, isFree: false },
  { key: '4', label: 'Sentiment-based matching', isPremium: true, isFree: false },
  { key: '5', label: 'Manual matchmaking', isPremium: false, isFree: true },
  { key: '6', label: 'Up to 3 connections', isPremium: false, isFree: true },
  { key: '7', label: '5 calls per week', isPremium: false, isFree: true },
];

const PremiumScreen = ({ navigation, route }) => {
  const { conversation } = route && route.params ? route.params : {};
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [planIndex, setPlanIndex] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [customerInfo, setCustomerInfo] = useState();
  const [freeTitle, setTitle] = useState('')

  useEffect(() => {
    analytics().logScreenView({
      screen_name: 'PremiumScreen',
      screen_class: 'PremiumScreen'
    })
  }, []);

  useEffect(() => {
    const loadSubscriptions = async () => {
      const res = await apiClient.post(`users/iapProducts`, { platform: Platform.OS });

      let productList = productListDefault;
      console.log({ res: JSON.stringify(res) });
      if (res && res.data && res.data.data) {
        productList = res.data.data.products;
        setTitle(res.data.data.title)
      } else {
        setTitle('Includes 1 Month free trial')
      }

      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);

      setLoading(true);
      try {
        const products = await Purchases.getProducts(productList);

        setLoading(false);

        products.sort((a, b) => a.price - b.price);
        if (products && products.length > 0) {
          setPlanIndex(0);
        }
        console.log({ products: JSON.stringify(products) });
        setSubscriptions(products);
      } catch (error) {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  const onContinue = async () => {
    NavigationService.navigate("PremiumRequestScreen");
  };

  const openTerms = () => {
    Linking.openURL("https://www.kuky.com/terms-and-conditions");
  };

  const openPolicy = () => {
    Linking.openURL("https://www.kuky.com/privacy-policy");
  };

  const cancelSubscription = () => { };

  return (
    <ImageBackground style={[styles.container, { paddingBottom: insets.bottom, paddingTop: insets.top + 32 }]} source={images.subscription_bg} contentFit="cover">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          right: 16,
          top: insets.top + 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={images.close_icon}
          style={{ width: getUnit(15), height: getUnit(15), tintColor: "#725ED4" }}
        />
      </TouchableOpacity>
      <ScrollView style={{ flex: 1, width: "100%" }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            width: Platform.isPad ? 600 : '100%',
            gap: 8,
            alignSelf: 'center'
          }}
        >
          {/* <Text style={{ color: '#E8FF58', width: '100%', fontSize: 15, fontWeight: 'bold' }}>123{'Upgrade to Premium'}</Text> */}
          <Text style={{ color: "#E8FF58", width: '100%', fontSize: getUnit(24), lineHeight: getUnit(32), fontWeight: "400" }}>
            {"Unlock More with Kuky Premium"}
          </Text>

          <Text style={{ color: '#ffffff', width: '100%', fontSize: 15, lineHeight: getUnit(22), fontWeight: 'bold' }}>{'Compare plans and find what fits your connection style best.'}</Text> 

          <View
            style={{
              flex: 1,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <View
              style={{
                width: "100%",
                marginTop: getUnit(36),
              }}
            >
                    {/* <Text
                      style={{
                        fontSize: getUnit(18),
                        fontWeight: "400",
                        lineHeight: 24,
                        color: "white",
                        flex: 1
                      }}
                    >{`Premi `}
                    </Text> */}
              <Swiper
  loop={false}
  dotColor="#aaa"
  activeDotColor="#E8FF58"
  showsPagination={true}
  paginationStyle={{ bottom: 10 }}
  style={{ height: 500 }}
>
  {/* Slide Premium */}
  <View style={styles.slide}>
  <View style={styles.planHeader}>
    <Text style={styles.title}>Premium Plan</Text>
    <Text style={styles.price}>$7 / per month</Text>
  </View>
    {[
      'Unlimited connections',
      'Unlimited calls',
      'Smart daily matchmaking',
      'Sentiment-based matching',
      'Weekly mentor check-ins & moderator support',
    ].map((item, idx) => (
      <Text key={idx} style={styles.bullet}>
        <Image
          source={images.tick_icon}
          resizeMode="contain"
          style={{ width: getUnit(15), height: getUnit(15), tintColor: "#ffffff" }}
        /> {item}</Text>
    ))}
    <TouchableOpacity style={styles.premiumBtn} onPress={onContinue} disabled={loading}>
      <Text style={styles.premiumBtnText}>Go Premium</Text>
    </TouchableOpacity>
    <Text style={styles.cancel}>Cancel anytime.</Text>
  </View>

  {/* Slide Free */}
                <View style={styles.slide}>
                  
    <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          right: 16,
          top: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={images.close_icon}
          style={{ width: getUnit(15), height: getUnit(15), tintColor: "#ffffff" }}
        />
      </TouchableOpacity>
    <Text style={styles.title}>Free Plan</Text>
    {[
      'Up to 3 connections',
      '5 calls per week',
      'Manual matchmaking',
    ].map((item, idx) => (
      <Text key={idx} style={styles.bullet}>
        <Image
          source={images.tick_icon}
          resizeMode="contain"
          style={{ width: getUnit(15), height: getUnit(15), tintColor: "#ffffff" }}
        /> {item}</Text>
    ))}
    {[
      'No sentiment-based matching',
      'No moderator or mentor support',
    ].map((item, idx) => (
      <Text key={idx} style={styles.disabledBullet}><Image
          source={images.close_icon}
          resizeMode="contain"
          style={{ width: getUnit(15), height: getUnit(15), tintColor: "#ffffff" }}
        /> {item}</Text>
    ))}
    <TouchableOpacity style={styles.freeBtn}>
      <Text style={styles.freeBtnText}>Continue with Free Plan</Text>
    </TouchableOpacity>
  </View>
</Swiper>
            </View>
          </View>
        </View>
      </ScrollView>

      
      <Text
        style={{
          fontSize: 11,
          lineHeight: 18,
          marginTop: 5,
          fontWeight: "500",
          color: "#eeeeee",
          textAlign: "center",
          width: Platform.isPad ? 600 : '100%'
        }}
      >
        {`By subscribing, you agree to our `}
        <Text
          onPress={openPolicy}
          style={{ textDecorationLine: "underline", fontWeight: "bold" }}
        >{`Privacy Policy`}</Text>
        {` and `}
        <Text
          onPress={openTerms}
          style={{ textDecorationLine: "underline", fontWeight: "bold" }}
        >{`Terms of Use`}</Text>
        {`. Subscriptions auto-renew until cancelled, as described in the Terms. You can cancel the subscription anytime.`}
      </Text>
    </ImageBackground>
  );
};


export default PremiumScreen;
