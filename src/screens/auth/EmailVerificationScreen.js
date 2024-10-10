import { deviceIdAtom, pushTokenAtom, tokenAtom, userAtom } from '@/actions/global'
import PinInput from '@/components/PinInput'
import Text from '@/components/Text'
import apiClient from '@/utils/apiClient'
import colors from '@/utils/colors'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { Image } from 'expo-image'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Keyboard, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-toast-message'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eeeeee'
    }
})

const EmailVerificationScreen = ({ navigation, route }) => {
    const { email } = route.params
    const [pin, setPin] = useState('')
    const deviceId = useAtomValue(deviceIdAtom)
    const setUser = useSetAtom(userAtom)
    const setToken = useSetAtom(tokenAtom)
    const pushToken = useAtomValue(pushTokenAtom)
    const [loading, setLoading] = useState(false)

    const checkPushToken = () => {
        if (pushToken) {
            apiClient.post('users/update-token', { session_token: pushToken })
                .then((res) => {
                    console.log({ res })
                })
                .catch((error) => {
                    console.log({ error })
                })
        }
    }

    const onContinue = () => {
        Keyboard.dismiss()

        setLoading(true)
        apiClient.post('auth/verify', { email, code: pin, device_id: deviceId, platform: Platform.OS })
            .then((res) => {
                setLoading(false)
                if (res && res.data && res.data.success) {
                    const currentUser = res.data.data.user
                    setUser(currentUser)
                    setToken(res.data.data.token)
                    AsyncStorage.setItem('ACCESS_TOKEN', res.data.data.token)
                    setTimeout(() => {
                        checkPushToken()
                    }, 200);
                    NavigationService.reset('VerificationSuccessScreen', { onboarding: true })
                } else {
                    Toast.show({ text1: res.data.message, type: 'error' })
                }
            })
            .catch((error) => {
                console.log({ error })
                Toast.show({ text1: error, type: 'error' })
                setLoading(false)
            })
    }

    const openSignIn = () => {
        NavigationService.reset('SignInScreen')
    }

    const onPinUpdate = (newPin) => {
        setPin(newPin)
    }

    useEffect(() => {
        if (pin.length === 4) {
            onContinue()
        }
    }, [pin])

    const onResend = () => {
        Keyboard.dismiss()
        apiClient.post('auth/resend-verification', { email: email })
            .then((res) => {
                if (res && res.data && res.data.success) {
                    Toast.show({ text1: res.data.message, type: 'success' })
                }
            })
            .catch((error) => {
                console.log({ error })
            })

    }

    return (
        <View style={styles.container}>
            <Image source={images.sign_up_bg} style={{ width: '100%', height: 200 }} contentFit='cover' />


            <View style={{ flex: 1, width: '100%', marginTop: -60, backgroundColor: 'white', borderRadius: 25, overflow: 'hidden', padding: 28, paddingBottom: 48 }}>
                <KeyboardAwareScrollView style={{ width: '100%', flex: 1 }} showsVerticalScrollIndicator={false}>
                    <View style={{ alignItems: 'center', width: '100%', flex: 1, gap: 20, }}>
                        <Text style={{ fontSize: 24, color: 'black', fontWeight: 'bold', width: '100%' }}>Enter your verification code</Text>
                        <Text style={{ color: '#726E70', fontSize: 15, width: '100%', marginBottom: 10 }}>{`We sent a code by text to `}
                            <Text style={{ color: '#5E30C1' }}>{email}</Text>
                        </Text>
                        <PinInput
                            text={pin}
                            handleTextChange={onPinUpdate}
                        />
                        <View style={{ height: 30, width: '100%', alignItems: 'center', justifyContent: 'center' }}>

                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1, gap: 16 }}>
                                <Text style={{ color: '#726E70', fontSize: 15, width: '100%', flex: 1 }}>{`Did't get a code? `}
                                    <Text onPress={onResend} style={{ color: '#5E30C1' }}>Resend</Text>
                                </Text>
                                <TouchableOpacity onPress={openSignIn}>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#333333' }}>Sign in</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity disabled={!(pin.length === 4)} onPress={onContinue} style={{ height: 50, width: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: pin.length === 4 ? '#333333' : '#726E70', }}>
                                {!loading && <Image source={images.next_icon} style={{ width: 20, height: 20, tintColor: 'white' }} contentFit='contain' />}
                                {loading && <ActivityIndicator size='small' color='white' />}
                            </TouchableOpacity>
                        </View>

                    </View>
                </KeyboardAwareScrollView>
            </View>

        </View>
    )
}

export default EmailVerificationScreen