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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#725ED4",
    gap: 16,
    paddingHorizontal: 16
  },
});

const productList = Platform.select({
  ios: ["com.kuky.ios.1month", "com.kuky.ios.6month", "com.kuky.ios.12month"],
  android: ["com.kuky.android.1month", "com.kuky.android.6month", "com.kuky.android.12month"],
});

const PremiumRequestScreen = ({ navigation, route }) => {
  const { conversation } = route && route.params ? route.params : {};
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [planIndex, setPlanIndex] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [customerInfo, setCustomerInfo] = useState();

  useEffect(() => {
    const loadSubscriptions = async () => {
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
    if (planIndex >= 0) {
      try {
        setLoading(true);
        const product = subscriptions[planIndex];
        console.log({ planIndex });

        const result = await Purchases.purchaseStoreProduct(product);
        console.log("pass here");
        setLoading(false);

        const { customerInfo } = result;

        // console.log({ response: JSON.stringify(result) })

        if (
          customerInfo &&
          customerInfo.entitlements &&
          customerInfo.entitlements.active &&
          customerInfo.entitlements.active["pro"]
        ) {
          if (conversation) {
            NavigationService.replace("MessageScreen", { conversation });
          }
          DeviceEventEmitter.emit(constants.REFRESH_PROFILE);
        } else {
          // Toast.show({ text1: 'Fail to purchase subscription!', type: 'error' })
          Alert.alert("Error", "Fail to purchase subscription!");
        }
      } catch (error) {
        console.log({ error });
        setLoading(false);
        if (error && error.message) {
          // Toast.show({ text1: error.message, type: 'error' })
          Alert.alert("Error", error.message);
        } else {
          Alert.alert("Error", "Fail to purchase subscription!");
          // Toast.show({ text1: 'Fail to purchase subscription!', type: 'error' })
        }
      }
    }
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
          <Text style={{ color: '#E8FF58', width: '100%', fontSize: 15, fontWeight: 'bold' }}>{'Upgrade to Premium'}</Text>
          <Text style={{ color: "white", width: '100%', fontSize: getUnit(24), lineHeight: getUnit(32), fontWeight: "400" }}>
            {"Build more connections and enjoy unlimited interactions"}
          </Text>

          <View
            style={{
              flex: 1,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <View style={{ gap: 8, marginVertical: getUnit(16) }}>
              {
                ['Unlimited matching!', 'Unlock messaging!', 'Cancel anytime!'].map((item) => {
                  return (
                    <View key={item} style={{ width: '100%', flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Image
                        style={{ width: getUnit(20), height: getUnit(20) }}
                        source={images.premium_list_icon}
                        contentFit="contain"
                      />
                      <Text
                        style={{
                          color: "#E8FF58",
                          fontSize: getUnit(20),
                          fontWeight: "500",
                          lineHeight: getUnit(30),
                          flex: 1
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  )
                })
              }
            </View>
            <View
              style={{
                width: "100%",
                gap: getUnit(10),
                alignItems: "center",
              }}
            >
              {subscriptions.map((item, index) => {
                const hasOff =
                  item.description.split(" - ").length === 2
                    ? item.description.split(" - ")[1]
                    : undefined;
                let title = item.title;
                if (item.title.split(" ").length >= 2) {
                  title = `${item.title.split(" ")[0]} ${item.title.split(" ")[1]}`;
                }

                return (
                  <TouchableOpacity
                    key={`product-${item.identifier}`}
                    onPress={() => setPlanIndex(index)}
                    style={{
                      borderRadius: getUnit(10),
                      gap: getUnit(12),
                      paddingHorizontal: getUnit(16),
                      height: getUnit(70),
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#725ED4",
                      flexDirection: "row",
                      width: Platform.isPad ? 600 : '100%'
                    }}
                  >
                    <Image
                      style={{ width: getUnit(25), height: getUnit(25) }}
                      source={planIndex === index ? images.selected_plan : images.unselect_plan}
                      contentFit="contain"
                    />
                    <Text
                      style={{
                        fontSize: getUnit(18),
                        fontWeight: "400",
                        lineHeight: 24,
                        color: "white",
                        flex: 1
                      }}
                    >{`${title} `}
                      <Text
                        style={{
                          fontWeight: 'bold'
                        }}
                      >
                        {item.priceString}
                      </Text>
                    </Text>


                    {hasOff && (
                      <View style={{ height: 40, borderRadius: 20, alignItems: 'center', width: getUnit(80), justifyContent: 'center', backgroundColor: '#E8FF58' }}>
                        <Text style={{ fontSize: getUnit(12), fontWeight: 'bold', color: "black" }}>
                          {hasOff}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {customerInfo &&
            customerInfo.latestExpirationDate &&
            dayjs().isBefore(dayjs(customerInfo.latestExpirationDate)) && (
              <Text
                style={{ color: "white", fontSize: 15, fontWeight: "bold" }}
              >{`Expired at: ${dayjs(customerInfo.latestExpirationDate).format("HH:mm DD MMM YYYY")}`}</Text>
            )}

        </View>
      </ScrollView>

<Text style={{fontSize: 15, color: 'white', width: '100%', textAlign: "center"}}>Includes 7 Days Free Trial</Text>
      {customerInfo &&
        customerInfo.latestExpirationDate &&
        dayjs().isBefore(dayjs(customerInfo.latestExpirationDate)) ? (
        <ButtonWithLoading
          text={loading ? "Processing..." : `Subscribe Now`}
          loading={loading}
          onPress={onContinue}
          disabled={planIndex === null}
          textStyle={{ color: colors.mainColor, fontWeight: 'bold' }}
          style={{ backgroundColor: '#E8FF58' }}
        />
      ) : (
        <ButtonWithLoading
          text={loading ? "Processing..." : "Subscribe Now"}
          loading={loading}
          onPress={onContinue}
          disabled={planIndex === null}
          textStyle={{ color: colors.mainColor, fontWeight: 'bold' }}
          style={{ backgroundColor: '#E8FF58' }}
        />
      )}
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

export default PremiumRequestScreen;
