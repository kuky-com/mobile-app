import { userAtom } from '@/actions/global'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import Text from '@/components/Text'
import apiClient from '@/utils/apiClient'
import constants from '@/utils/constants'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import dayjs from 'dayjs'
import { Image } from 'expo-image'
import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import { DeviceEventEmitter, Keyboard, Linking, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Purchases from 'react-native-purchases'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F1F3'
    },
    inputContainer: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 16, height: 50
    }
})

const MySubscriptionScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const [currentUser, setUser] = useAtom(userAtom)
    const [loading, setLoading] = useState(false)
    const [expiredDate, setExpiredDate] = useState(null)
    const [activePlan, setActivePlan] = useState(null)
    const [activeSubscription, setActiveSubscription] = useState(null)

    useEffect(() => {
        const loadSubscriptions = async () => {
            try {
                if(activePlan) {
                    const products = await Purchases.getProducts([activePlan])
                    if (products && products.length > 0) {
                        console.log({products})
                        setActiveSubscription(products[0])
                    }
                }
            } catch (error) {
                console.log({error})
            }
        }

        loadSubscriptions()
    }, [activePlan])

    const getSubscriptionInfo = async () => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            if (customerInfo && customerInfo.latestExpirationDate && dayjs().isBefore(dayjs(customerInfo.latestExpirationDate))) {
                setExpiredDate(dayjs(customerInfo.latestExpirationDate).format('DD MMM YYYY'))
            } else {
                setExpiredDate(null)
            }

            if(customerInfo && customerInfo.entitlements && customerInfo.entitlements.active && customerInfo.entitlements.active['pro']) {
                setActivePlan(customerInfo.entitlements.active['pro'].productIdentifier)
            } else {
                setActivePlan(null)
            }
        } catch (e) {
            console.log({ e })
            setExpiredDate(null)
        }
    }

    useEffect(() => {
        getSubscriptionInfo()
    }, [])

    useEffect(() => {
        let eventListener = DeviceEventEmitter.addListener(constants.REFRESH_PROFILE, event => {
            getSubscriptionInfo()
        });

        return () => {
            eventListener.remove();
        };
    }, [])

    const updateProfile = async () => {
        try {
            Keyboard.dismiss()
            setLoading(true)

            apiClient.post('users/update', { full_name: fullName })
                .then((res) => {
                    console.log({ res })
                    setLoading(false)
                    if (res && res.data && res.data.success) {
                        setUser(res.data.data)
                        Toast.show({ text1: res.data.message, type: 'success' })
                    } else {
                        Toast.show({ text1: res.data.message, type: 'error' })
                    }
                })
                .catch((error) => {
                    console.log({ error })
                    setLoading(false)
                    Toast.show({ text1: error, type: 'error' })
                })
        } catch (error) {
            setLoading(false)
        }
    }

    const openSubscription = () => {
        navigation.push('PremiumRequestScreen')
    }

    console.log({activePlan})

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', zIndex: 2, gap: 8, borderBottomLeftRadius: 45, borderBottomRightRadius: 45, backgroundColor: '#725ED4', paddingHorizontal: 16, paddingBottom: 24, paddingTop: insets.top + 16, width: '100%', alignItems: 'center', justifyContent: 'center', }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.back_icon} style={{ width: 25, height: 25 }} contentFit='contain' />
                </TouchableOpacity>
                <Text style={{ flex: 1, textAlign: 'center', fontSize: 20, color: 'white', fontWeight: 'bold' }}>My Subscription</Text>

                <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                </View>
            </View>
            <View style={{ flex: 1, backgroundColor: 'white', marginTop: -40, paddingTop: 40 }}>
                <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16, paddingTop: 24, gap: 32 }}>
                    <View style={{ gap: 8 }}>
                        <Text style={{ fontSize: 14, color: '#646464' }}>My Plan</Text>
                        <View style={styles.inputContainer}>
                            <Text style={{flex: 1, fontSize: 16, color: '#333333', fontWeight: 'bold'}}>{activeSubscription ? `Preminum - ${activeSubscription.title}` : 'Free User'}</Text>
                            <TouchableOpacity onPress={openSubscription} style={{width: 25, height: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: '#48FFF4', borderWidth: 1, borderRadius: 5, borderColor: '#333333'}}>
                                <Image source={images.edit_icon} style={{tintColor: '#333333', width: 13, height: 13}} contentFit='contain'/>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ gap: 8 }}>
                        <Text style={{ fontSize: 14, color: '#646464' }}>Next renewal date</Text>
                        <View style={styles.inputContainer}>
                            <Text style={{flex: 1, fontSize: 16, color: '#333333', fontWeight: 'bold'}}>{expiredDate ? expiredDate : ''}</Text>
                        </View>
                    </View>

                    <View style={{ gap: 8 }}>
                        <Text style={{ fontSize: 14, color: '#646464' }}>Monthly payment</Text>
                        <View style={styles.inputContainer}>
                            <Text style={{flex: 1, fontSize: 16, color: '#333333', fontWeight: 'bold'}}>{activeSubscription ? `${activeSubscription.priceString} / ${activeSubscription.title}` : ''}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ width: '100%', paddingHorizontal: 16, marginBottom: insets.bottom + 20, }}>
                    <ButtonWithLoading
                        text='Save'
                        onPress={updateProfile}
                        loading={loading}
                    />
                </View>
            </View>
        </View>
    )
}

export default MySubscriptionScreen