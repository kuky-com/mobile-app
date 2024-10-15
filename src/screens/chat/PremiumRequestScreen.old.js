import ButtonWithLoading from '@/components/ButtonWithLoading'
import Text from '@/components/Text'
import colors from '@/utils/colors'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { getUnit } from '@/utils/utils'
import { Image, ImageBackground } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
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
    const { conversation } = route.params
    const insets = useSafeAreaInsets()
    const [loading, setLoading] = useState(false)
    const [planIndex, setPlanIndex] = useState(null)
    const [subscriptions, setSubscriptions] = useState([])

    useEffect(() => {
        const loadSubscriptions = async () => {
            setLoading(true)
            try {
                const products = await Purchases.getProducts(productList)

                setLoading(false)

                products.sort((a, b) => a.price - b.price)
                if (products && products.length > 0) {
                    setPlanIndex(0)
                }
                // console.log({ products })
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
                console.log({planIndex})

                const result = await Purchases.purchaseStoreProduct(product)
                console.log('pass here')
                setLoading(false)

                const { customerInfo } = result

                console.log({response: JSON.stringify(result)})

                if (customerInfo && customerInfo.entitlements && customerInfo.entitlements.active && customerInfo.entitlements.active['pro']) {
                    NavigationService.replace('MessageScreen', { conversation })
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

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
            <Image source={images.subscriptions_bg} style={{ width: '100%', height: Math.min(Dimensions.get('screen').width * 690 / 787, Dimensions.get('screen').height * 0.4) }} contentFit='cover' />
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', right: 16, top: insets.top + 8, width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8FF58', alignItems: 'center', justifyContent: 'center' }}>
                <Image source={images.close_icon} style={{ width: getUnit(18), height: getUnit(18), tintColor: '#725ED4' }} />
            </TouchableOpacity>
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

                <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <Text style={{ color: '#E8FF58', fontSize: getUnit(24), fontWeight: 'bold' }}>{'3-month free trial then'}</Text>
                    <View style={{ gap: getUnit(24), flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', justifyContent: 'center' }}>
                        {
                            subscriptions.map((item, index) => {
                                const hasOff = item.description.split(' - ').length === 2 ? item.description.split(' - ')[1] : undefined
                                let title = item.title
                                if (item.title.split(' ').length >= 2) {
                                    title = `${item.title.split(' ')[0]} ${item.title.split(' ')[1]}`
                                }
                                return (
                                    <TouchableOpacity key={`product-${item.identifier}`} onPress={() => setPlanIndex(index)} style={{ minWidth: getUnit(90), borderRadius: getUnit(10), backgroundColor: planIndex === index ? '#E8FF58' : '#F0F0F0' }}>
                                        <View style={{ width: '100%', height: getUnit(22), alignItems: 'center', justifyContent: 'center' }}>
                                            {hasOff && <Text style={{ fontSize: getUnit(10), fontWeight: '500', color: 'black' }}>{hasOff}</Text>}
                                        </View>
                                        <View style={{ borderRadius: getUnit(10), gap: getUnit(12), paddingHorizontal: getUnit(8), paddingVertical: getUnit(20), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: planIndex === index ? '#E8FF58' : '#F0F0F0', backgroundColor: '#725ED4' }}>
                                            <Text style={{ textAlign: 'center', fontSize: getUnit(14), fontWeight: 'bold', lineHeight: 20, color: 'white' }}>{title.replace(' ', '\n')}</Text>
                                            <Text style={{ fontSize: item.priceString.length > 7 ? getUnit(16) : getUnit(20), fontWeight: 'bold', color: 'white' }}>{item.priceString}</Text>
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
                <ButtonWithLoading
                    text={loading ? 'Processing...' : 'Start Free Trial'}
                    loading={loading}
                    onPress={onContinue}
                    disabled={planIndex === null}
                />
            </View>
        </View>
    )
}

export default PremiumRequestScreen