import ButtonWithLoading from '@/components/ButtonWithLoading'
import Text from '@/components/Text'
import colors from '@/utils/colors'
import constants from '@/utils/constants'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { getUnit } from '@/utils/utils'
import dayjs from 'dayjs'
import { Image, ImageBackground } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { DeviceEventEmitter, Dimensions, Linking, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import Purchases from 'react-native-purchases'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#725ED4',
        gap: 16
    }
})

const productList = Platform.select({
    ios: [
        'com.kuky.ios.1month',
        'com.kuky.ios.6month',
        'com.kuky.ios.12month'
    ],
    android: [
        'com.kuky.android.1month',
        'com.kuky.android.6month',
        'com.kuky.android.12month'
    ]
})

const PremiumRequestScreen = ({ navigation, route }) => {
    const { conversation } = route && route.params ? route.params : {}
    const insets = useSafeAreaInsets()
    const [loading, setLoading] = useState(false)
    const [planIndex, setPlanIndex] = useState(null)
    const [subscriptions, setSubscriptions] = useState([])
    const [customerInfo, setCustomerInfo] = useState()

    useEffect(() => {
        const loadSubscriptions = async () => {
            const info = await Purchases.getCustomerInfo()
            setCustomerInfo(info)

            setLoading(true)
            try {
                const products = await Purchases.getProducts(productList)

                setLoading(false)

                products.sort((a, b) => a.price - b.price)
                if (products && products.length > 0) {
                    setPlanIndex(0)
                }
                console.log({ products: JSON.stringify(products) })
                setSubscriptions(products)
            } catch (error) {
                setLoading(false)
            }
        }

        loadSubscriptions()
    }, [])

    const onContinue = async () => {
        if (planIndex >= 0) {
            try {
                setLoading(true)
                const product = subscriptions[planIndex]
                console.log({ planIndex })

                const result = await Purchases.purchaseStoreProduct(product)
                console.log('pass here')
                setLoading(false)

                const { customerInfo } = result

                console.log({ response: JSON.stringify(result) })

                if (customerInfo && customerInfo.entitlements && customerInfo.entitlements.active && customerInfo.entitlements.active['pro']) {
                    if (conversation) {
                        NavigationService.replace('MessageScreen', { conversation })
                    }
                    DeviceEventEmitter.emit(constants.REFRESH_PROFILE)
                } else {
                    Toast.show({ text1: 'Fail to purchase subscription!', type: 'error' })
                }
            } catch (error) {
                console.log({ error })
                setLoading(false)
                if (error && error.message) {
                    Toast.show({ text1: error.message, type: 'error' })
                } else {
                    Toast.show({ text1: 'Fail to purchase subscription!', type: 'error' })
                }

            }
        }
    }

    const openTerms = () => {
        Linking.openURL('https://www.kuky.com/terms-and-conditions')
    }

    const openPolicy = () => {
        Linking.openURL('https://www.kuky.com/privacy-policy')
    }

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <Image source={images.subscriptions_bg} style={{ width: '100%', height: Dimensions.get('screen').height * 0.25, borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }} contentFit='cover' />
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', right: 16, top: insets.top + 8, width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8FF58', alignItems: 'center', justifyContent: 'center' }}>
                <Image source={images.close_icon} style={{ width: getUnit(18), height: getUnit(18), tintColor: '#725ED4' }} />
            </TouchableOpacity>
            <ScrollView style={{ flex: 1, width: '100%' }} showsVerticalScrollIndicator={false}>
                <View style={{ paddingHorizontal: getUnit(16), flex: 1, alignItems: 'center', width: '100%', gap: 8 }}>
                    {/* <Text style={{ color: '#E8FF58', fontSize: 24, fontWeight: 'bold' }}>{'Unlock Messaging'}</Text>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 18 }}>{'To begin chatting and start building your connection, please upgrade to a premium plan'}</Text> */}
                    <Text style={{ color: '#E8FF58', fontSize: getUnit(24), fontWeight: 'bold' }}>{'Premium subscription'}</Text>

                    <View style={{ gap: 8, marginVertical: getUnit(16) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, }}>
                            <Image style={{ width: getUnit(20), height: getUnit(20), }} source={images.best_price} contentFit='contain' />
                            <Text style={{ color: 'white', fontSize: getUnit(14), fontWeight: '500', textAlign: 'center', lineHeight: getUnit(18) }}>{'Unlimited match connections!'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Image style={{ width: getUnit(20), height: getUnit(20) }} source={images.best_price} contentFit='contain' />
                            <Text style={{ color: 'white', fontSize: getUnit(14), fontWeight: '500', textAlign: 'center', lineHeight: getUnit(18) }}>{'Unlock messaging!'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Image style={{ width: getUnit(20), height: getUnit(20) }} source={images.best_price} contentFit='contain' />
                            <Text style={{ color: 'white', fontSize: getUnit(14), fontWeight: '500', textAlign: 'center', lineHeight: getUnit(18) }}>{'Enjoy more features!'}</Text>
                        </View>
                    </View>

                    <View style={{ paddingBottom: 32, flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                        <Text style={{ color: '#E8FF58', fontSize: getUnit(24), fontWeight: 'bold' }}>{'3-month free trial then'}</Text>
                        <View style={{ width: '100%', flexWrap: 'wrap', gap: getUnit(24), flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', justifyContent: 'center' }}>
                            {
                                subscriptions.map((item, index) => {
                                    const hasOff = item.description.split(' - ').length === 2 ? item.description.split(' - ')[1] : undefined
                                    let title = item.title
                                    if (item.title.split(' ').length >= 2) {
                                        title = `${item.title.split(' ')[0]} ${item.title.split(' ')[1]}`
                                    }
                                    let periods = item.subscriptionPeriod
                                    if (item.subscriptionPeriod === 'P1M') {
                                        periods = '(per 1 month)'
                                    } else if (item.subscriptionPeriod === 'P6M') {
                                        periods = '(per 6 months)'
                                    } else if (item.subscriptionPeriod === 'P1Y') {
                                        periods = '(per 1 year)'
                                    }

                                    return (
                                        <TouchableOpacity key={`product-${item.identifier}`} onPress={() => setPlanIndex(index)} style={{ minWidth: getUnit(90), borderRadius: getUnit(10), backgroundColor: planIndex === index ? '#E8FF58' : '#F0F0F0' }}>
                                            <View style={{ width: '100%', height: getUnit(22), alignItems: 'center', justifyContent: 'center' }}>
                                                {hasOff && <Text style={{ fontSize: getUnit(10), fontWeight: '500', color: 'black' }}>{hasOff}</Text>}
                                            </View>
                                            <View style={{ borderRadius: getUnit(10), gap: getUnit(12), paddingHorizontal: getUnit(8), paddingVertical: getUnit(20), paddingTop: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: planIndex === index ? '#E8FF58' : '#F0F0F0', backgroundColor: '#725ED4' }}>
                                                <Text style={{ textAlign: 'center', fontSize: getUnit(13), fontWeight: 'bold', lineHeight: 20, color: 'white' }}>{`${title} plan`}</Text>
                                                <Text style={{ fontSize: item.priceString.length > 7 ? getUnit(16) : getUnit(20), fontWeight: 'bold', color: 'white' }}>{item.priceString}</Text>
                                                <Text style={{ fontSize: item.priceString.length > 7 ? getUnit(11) : getUnit(12), fontWeight: 'bold', color: 'white' }}>{periods}</Text>
                                                {planIndex === index &&
                                                    <View style={{ position: 'absolute', top: 5, right: 5 }}>
                                                        <Image style={{ width: getUnit(20), height: getUnit(20) }} source={images.best_price} contentFit='contain' />
                                                    </View>
                                                }
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </View>
                    </View>
                    {customerInfo && customerInfo.latestExpirationDate && dayjs().isBefore(dayjs(customerInfo.latestExpirationDate)) ?
                        <ButtonWithLoading
                            text={loading ? 'Processing...' : `Upgrade plan`}
                            loading={loading}
                            onPress={onContinue}
                            disabled={planIndex === null}
                        /> :
                        <ButtonWithLoading
                            text={loading ? 'Processing...' : 'Start Free Trial'}
                            loading={loading}
                            onPress={onContinue}
                            disabled={planIndex === null}
                        />
                    }
                    <Text style={{ fontSize: 12, marginTop: 5, fontWeight: '500', color: '#333333', textAlign: 'center' }}>{`By subscribing, you agree to our `}<Text onPress={openPolicy} style={{ textDecorationLine: 'underline', fontWeight: 'bold' }}>{`Privacy Policy`}</Text>{` and `}<Text onPress={openTerms} style={{ textDecorationLine: 'underline', fontWeight: 'bold' }}>{`Terms of Use`}</Text>{`. Subscriptions auto-renew until cancelled, as described in the Terms. You can cancel the subscription anytime.`}</Text>
                </View>
            </ScrollView>
        </View>
    )
}

export default PremiumRequestScreen