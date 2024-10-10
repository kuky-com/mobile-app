import Text from '@/components/Text'
import images from '@/utils/images'
import { Image } from 'expo-image'
import React, { useEffect } from 'react'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { appleAuth } from '@invertase/react-native-apple-authentication'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import NavigationService from '@/utils/NavigationService'
import { StatusBar } from 'expo-status-bar'
import apiClient from '@/utils/apiClient'
import { useAtomValue, useSetAtom } from 'jotai'
import { deviceIdAtom, pushTokenAtom, tokenAtom, userAtom } from '@/actions/global'
import { getAuthenScreen } from '@/utils/utils'
import AsyncStorage from '@react-native-async-storage/async-storage'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eeeeee'
    }
})

const SignUpScreen = ({ navigation }) => {
    const deviceId = useAtomValue(deviceIdAtom)
    const setUser = useSetAtom(userAtom)
    const setToken = useSetAtom(tokenAtom)
    const pushToken = useAtomValue(pushTokenAtom)

    useEffect(() => {
        GoogleSignin.configure({
            scopes: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/plus.me', 'https://www.googleapis.com/auth/userinfo.email',],
            iosClientId: '412387490825-am138on43a9aarl0kt0oj9096v2akl1s.apps.googleusercontent.com',
            webClientId: '412387490825-jgoa1hmhhcojmik0qkcc3dnc089sfb6s.apps.googleusercontent.com',
            offlineAccess: true
        })
    }, [])

    useEffect(() => {
        if (Platform.OS === 'ios') {
            return appleAuth.onCredentialRevoked(async () => {
                console.warn('If this function executes, User Credentials have been Revoked');
            })
        }
    }, [])

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

    const onGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            console.log({ response })
            if (response && response.data && response.data.idToken) {
                apiClient.post('auth/google', { token: response.data.idToken, device_id: deviceId, platform: Platform.OS })
                    .then((res) => {
                        console.log({ res: res.data })

                        if (res && res.data && res.data.success) {
                            setUser(res.data.data.user)
                            setToken(res.data.data.token)
                            AsyncStorage.setItem('ACCESS_TOKEN', res.data.data.token)
                            setTimeout(() => {
                                checkPushToken()
                            }, 200);
                            NavigationService.reset(getAuthenScreen(res.data.data.user))
                        } else {
                            Toast.show({ text1: res?.data?.message, type: 'error' })
                        }
                    })
                    .catch((error) => {
                        console.log({ error })
                        Toast.show({ text1: error, type: 'error' })
                    })
            } else {
                // sign in was cancelled by user
            }
        } catch (error) {
            console.log(error)
        }
    }

    const onApple = async () => {

        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        });

        if (!appleAuthRequestResponse.identityToken) {
            Toast.show({ text1: i18n.t('error'), text2: i18n.t('cannot_login'), type: 'error' })
            return
        }

        console.log({ appleAuthRequestResponse })

        apiClient.post('auth/apple', { token: appleAuthRequestResponse.identityToken, device_id: deviceId, platform: Platform.OS })
            .then((res) => {
                console.log({ res: res.data })

                if (res && res.data && res.data.success) {
                    setUser(res.data.data.user)
                    setToken(res.data.data.token)
                    AsyncStorage.setItem('ACCESS_TOKEN', res.data.data.token)
                    setTimeout(() => {
                        checkPushToken()
                    }, 200);
                    NavigationService.reset(getAuthenScreen(res.data.data.user))
                } else {
                    Toast.show({ text1: res?.data?.message, type: 'error' })
                }
            })
            .catch((error) => {
                console.log({ error })
                Toast.show({ text1: error, type: 'error' })
            })
    }

    const onSignUp = () => {
        NavigationService.reset('SignUpEmailScreen')
    }

    const onSignIn = () => {
        NavigationService.reset('SignInScreen')
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent style='light' />
            <View style={{ flex: 1 }}>
                <Image source={images.sign_up_bg} style={{ width: '100%', height: '100%' }} />
            </View>
            <View style={{ marginTop: -30, backgroundColor: 'white', borderRadius: 25, overflow: 'hidden', padding: 28, gap: 20, alignItems: 'center', paddingBottom: 48 }}>
                <TouchableOpacity onPress={onSignUp} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Sign Up with Email</Text>
                </TouchableOpacity>
                <View style={{ alignItems: 'center', justifyContent: 'center', gap: 10, flexDirection: 'row' }}>
                    {Platform.OS === 'ios' &&
                        <TouchableOpacity onPress={onApple} style={{ height: 54, borderRadius: 25, alignItems: 'center', justifyContent: 'center', width: 80, backgroundColor: '#EEEEEE' }}>
                            <Image source={images.apple_icon} style={{ width: 20, height: 20 }} contentFit='contain' />
                        </TouchableOpacity>
                    }
                    <TouchableOpacity onPress={onGoogle} style={{ height: 54, borderRadius: 25, alignItems: 'center', justifyContent: 'center', width: 80, backgroundColor: '#EEEEEE' }}>
                        <Image source={images.google_icon} style={{ width: 20, height: 20 }} contentFit='contain' />
                    </TouchableOpacity>
                </View>
                <Text onPress={onSignIn} style={{ fontSize: 20, fontWeight: '700', color: '#6900D3' }}>Sign in</Text>
                <Text style={{ fontSize: 12, textAlign: 'center', fontWeight: '500', lineHeight: 17 }}>{`By tapping Sign Up / Login, you agree to our `}
                    <Text style={{ textDecorationLine: 'underline', fontWeight: 'bold' }}>Terms</Text>
                    {` .\nLearn how we process your data in our  `}
                    <Text style={{ textDecorationLine: 'underline', fontWeight: 'bold' }}>Privacy Policy</Text>
                    {` and `}
                    <Text style={{ textDecorationLine: 'underline', fontWeight: 'bold' }}>Cookies Policy</Text>
                    {`.`}
                </Text>
            </View>
        </View>
    )
}

export default SignUpScreen