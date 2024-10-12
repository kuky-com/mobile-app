import ButtonWithLoading from '@/components/ButtonWithLoading'
import Text from '@/components/Text'
import colors from '@/utils/colors'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
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
    const {conversation} = route.params
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
                
                products.sort((a, b) => a.price > b.price)
                if(products && products.length > 0) {
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
        if(planIndex >= 0) {
            try {
                setLoading(true)
                const product = subscriptions[planIndex]
                // console.log({response: JSON.stringify(product)})
                const {customerInfo} = await Purchases.purchaseStoreProduct(product)
                setLoading(false)

                if(customerInfo && customerInfo.entitlements && customerInfo.entitlements.active && customerInfo.entitlements.active['pro']) {
                    NavigationService.replace('MessageScreen', {conversation})
                } else {
                    Toast.show({text1: 'Fail to purchase subscription!', type: 'error'})
                }
              } catch (error) {
                console.log({error})
                setLoading(false)
                Toast.show({text1: 'Fail to purchase subscription!', type: 'error'})
              }
        }
    }

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
            <Image source={images.subscriptions_bg} style={{ width: '100%', height: Math.min(Dimensions.get('screen').width * 690 / 787, Dimensions.get('screen').height * 0.4) }} contentFit='cover' />
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', right: 16, top: insets.top + 8, width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8FF58', alignItems: 'center', justifyContent: 'center' }}>
                <Image source={images.close_icon} style={{ width: 18, height: 18, tintColor: '#725ED4' }} />
            </TouchableOpacity>
            <View style={{ paddingHorizontal: 16, flex: 1, alignItems: 'center', width: '100%', gap: 8 }}>
                <Text style={{ color: '#E8FF58', fontSize: 24, fontWeight: 'bold' }}>{'Unlock Messaging'}</Text>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 18 }}>{'To begin chatting and start building your connection, please upgrade to a premium plan'}</Text>
                <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ gap: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', justifyContent: 'center' }}>
                        {
                            subscriptions.map((item, index) => {
                                const hasOff = item.description.split(' - ').length === 2 ? item.description.split(' - ')[1] : undefined
                                return (
                                    <TouchableOpacity key={`product-${item.identifier}`} onPress={() => setPlanIndex(index)} style={{ borderRadius: 10, backgroundColor: planIndex === index ? '#E8FF58' : '#F0F0F0' }}>
                                        <View style={{ width: '100%', height: 22, alignItems: 'center', justifyContent: 'center'}}>
                                            {hasOff && <Text style={{fontSize: 10, fontWeight: '500', color: 'black'}}>{hasOff}</Text>}
                                        </View>
                                        <View style={{ borderRadius: 10, gap: 12, paddingHorizontal: 5, paddingVertical: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: planIndex === index ? '#E8FF58' : '#F0F0F0', backgroundColor: '#725ED4' }}>
                                            <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', lineHeight: 20, color: 'white' }}>{item.title.replace(' ', '\n')}</Text>
                                            <Text style={{ fontSize: item.priceString.length > 8 ? 18 : 20, fontWeight: 'bold', color: 'white' }}>{item.priceString}</Text>
                                            {planIndex === index &&
                                                <View style={{ position: 'absolute', top: 5, right: 5 }}>
                                                    <Image style={{ width: 20, height: 20 }} source={images.best_price} contentFit='contain' />
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
                    text='Continue'
                    loading={loading}
                    onPress={onContinue}
                    disabled={planIndex === null}
                />
            </View>
        </View>
    )
}

export default PremiumRequestScreen