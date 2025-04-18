import { ImageBackground } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Alert, DeviceEventEmitter, Image, Linking, Platform, TouchableOpacity, View } from 'react-native'
import images from '../../utils/images'
import Text from '../../components/Text'
import analytics, { settings } from '@react-native-firebase/analytics'
import Purchases from 'react-native-purchases'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ButtonWithLoading from '../../components/ButtonWithLoading'
import { getUnit } from '../../utils/utils'
import constants from '../../utils/constants'

const productListDefault = Platform.select({
    ios: ["com.kuky.blur_face"],
    android: ["com.kuky.android.blur_face"],
});

const BlurVideoScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const [loading, setLoading] = useState(false)
    const [subscriptions, setSubscriptions] = useState([])
    const [customerInfo, setCustomerInfo] = useState({})

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'PremiumRequestScreen',
            screen_class: 'PremiumRequestScreen'
        })
    }, []);

    useEffect(() => {
        const loadSubscriptions = async () => {

            const info = await Purchases.getCustomerInfo();
            setCustomerInfo(info);

            setLoading(true);
            try {
                const products = await Purchases.getProducts(productListDefault);

                console.log({ products })

                setLoading(false);
                setSubscriptions(products);
            } catch (error) {
                setLoading(false);
            }
        };

        loadSubscriptions();
    }, []);

    const onBuy = async () => {
        try {
            setLoading(true);
            const product = subscriptions[0];

            const result = await Purchases.purchaseStoreProduct(product);
            console.log("pass here");
            setLoading(false);

            const { customerInfo } = result;

            // console.log({ response: JSON.stringify(result) })

            if (
                customerInfo &&
                customerInfo.entitlements &&
                customerInfo.entitlements.active &&
                (
                    customerInfo.entitlements.active["blur_face"]
                )
            ) {
                DeviceEventEmitter.emit(constants.REFRESH_PROFILE);
                navigation.goBack()
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

    const openTerms = () => {
        Linking.openURL("https://www.kuky.com/terms-and-conditions");
    };

    const openPolicy = () => {
        Linking.openURL("https://www.kuky.com/privacy-policy");
    };


    return (
        <View style={{ flex: 1 }}>
            <ImageBackground source={images.subscription_bg} style={{ flex: 1, gap: 16, paddingHorizontal: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }} contentFit='fill'>
                <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: 'bold', color: '#E8FF58' }}>Keep your voice and story, just a little more private.</Text>
                <Text style={{ fontSize: 22, lineHeight: 30, color: 'white' }}>{`Add Face Blur to\nYour Video`}</Text>

                <View style={{ flex: 1, width: '100%' }}>
                    {
                        subscriptions.map((item) => {
                            console.log({item})
                            return (
                                <View key={item.identifier} style={{ flexDirection: 'row', gap: 5, backgroundColor: '#725ED4', padding: 16, borderWidth: 2, borderColor: '#E8FF58', borderRadius: 8 }}>
                                    <Image source={images.selected_plan} style={{ width: 25, height: 25 }} />
                                    <View style={{ flex: 1, gap: 16 }}>
                                        <Text style={{ lineHeight: 22, fontSize: 16, fontWeight: '600', color: 'white' }}>{`${item.description}`}</Text>
                                        <Text style={{ fontSize: 13, fontWeight: '400', color: 'white' }}>{`Cancel anytime`}</Text>
                                    </View>
                                    <Text style={{ lineHeight: 22, fontSize: 14, fontWeight: '400', color: 'white' }}>{`${item.pricePerMonthString} / Mo`}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                <ButtonWithLoading
                    text='Add Face Blur'
                    loading={loading}
                    onPress={onBuy}
                    style={{ backgroundColor: '#E8FF58' }}
                    textStyle={{ color: '#5E30C1', fontWeight: 'bold' }}
                    disabled={subscriptions.length === 0}
                />

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
        </View>
    )
}

export default BlurVideoScreen