import Text from '@/components/Text'
import colors from '@/utils/colors'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Alert, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { appleAuth } from '@invertase/react-native-apple-authentication'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { StatusBar } from 'expo-status-bar'
import axios from 'axios'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { deviceIdAtom, pushTokenAtom, tokenAtom, userAtom } from '@/actions/global'
import Toast from 'react-native-toast-message'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiClient from '@/utils/apiClient'
import { getAuthenScreen } from '@/utils/utils'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import { FontAwesome5 } from '@expo/vector-icons'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eeeeee'
    }
})

const SignInScreen = ({ navigation }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const setToken = useSetAtom(tokenAtom)
    const setUser = useSetAtom(userAtom)
    const deviceId = useAtomValue(deviceIdAtom)
    const pushToken = useAtomValue(pushTokenAtom)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

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
        if (loading) return
        try {
            setLoading(true)
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if (response && response.data && response.data.idToken) {
                apiClient.post('auth/google', { token: response.data.idToken, device_id: deviceId, platform: Platform.OS })
                    .then((res) => {
                        setLoading(false)
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
                        setLoading(false)
                        Toast.show({ text1: error, type: 'error' })
                    })
            } else {
                // sign in was cancelled by user
                setLoading(false)
            }
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    const onApple = async () => {
        if (loading) return
        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
            });

            if (!appleAuthRequestResponse.identityToken) {
                Toast.show({ text1: i18n.t('error'), text2: i18n.t('cannot_login'), type: 'error' })
                return
            }
            
            let full_name = undefined
            if(appleAuthRequestResponse.fullName && appleAuthRequestResponse.fullName?.givenName && appleAuthRequestResponse.fullName?.familyName) {
                full_name = `${appleAuthRequestResponse.fullName?.givenName} ${appleAuthRequestResponse.fullName?.familyName}`
            }

            setLoading(true)

            apiClient.post('auth/apple', { full_name, token: appleAuthRequestResponse.identityToken, device_id: deviceId, platform: Platform.OS })
                .then((res) => {
                    setLoading(false)
                    if (res && res.data && res.data.success) {
                        if(res.data.data) {
                            setUser(res.data.data.user)
                            setToken(res.data.data.token)
                            AsyncStorage.setItem('ACCESS_TOKEN', res.data.data.token)
                            setTimeout(() => {
                                checkPushToken()
                            }, 200);
                            NavigationService.reset(getAuthenScreen(res.data.data.user))
                        } else {
                            Alert.alert('Error', res.data.message)
                        }
                        
                    } else {
                        Toast.show({ text1: res?.data?.message, type: 'error' })
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

    const onSignIn = () => {
        if (email.length === 0 || password.length === 0) {
            Toast.show({ text1: "Please enter your email and password", type: 'error' })
            return
        }
        if (loading) return
        setLoading(true)
        apiClient.post('auth/login', { email, password, device_id: deviceId, platform: Platform.OS })
            .then(async (res) => {
                // console.log({ res })
                setLoading(false)
                if (res && res.data && res.data.success) {
                    const currentUser = res.data.data.user
                    setUser(currentUser)
                    setToken(res.data.data.token)
                    await AsyncStorage.setItem('ACCESS_TOKEN', res.data.data.token)
                    // Toast.show({ text1: res.data.message, type: 'success' })
                    setTimeout(() => {
                        checkPushToken()
                    }, 200);
                    NavigationService.reset(getAuthenScreen(currentUser))
                } else {
                    Toast.show({ text1: res.data.message, type: 'error' })
                    if (res.data.message === 'Email not verified') {
                        apiClient.post('auth/resend-verification', { email: email })
                            .then((res) => {
                            })
                            .catch((error) => {
                                console.log({ error })
                            })
                        NavigationService.reset('EmailVerificationScreen', { email })
                    }
                }
            })
            .catch((error) => {
                console.log({ error })
                Toast.show({ text1: error, type: 'error' })


                setLoading(false)
            })
    }

    const onSignUp = () => {
        NavigationService.reset('SignUpScreen')
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent style='light' />
            <Image source={images.sign_up_bg} style={{ width: '100%', height: 200 }} contentFit='cover' />


            <View style={{ flex: 1, width: '100%', marginTop: -60, backgroundColor: 'white', borderRadius: 25, overflow: 'hidden', padding: 28, paddingBottom: 48 }}>
                <KeyboardAwareScrollView style={{ width: '100%', flex: 1 }} showsVerticalScrollIndicator={false}>
                    <View style={{ alignItems: 'center', width: Platform.isPad ? 600 : '100%', alignSelf: 'center', flex: 1, gap: 20, }}>
                        <Text style={{ fontSize: 24, color: '#333333', fontWeight: 'bold' }}>Welcome back</Text>
                        <View style={{ width: '100%', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 15, borderWidth: 2, borderColor: '#726E70' }}>
                            <TextInput
                                placeholder='Email address'
                                placeholderTextColor='#AAAAAA'
                                underlineColorAndroid='#00000000'
                                style={{ fontSize: 18, color: 'black', fontWeight: '500' }}
                                clearButtonMode='always'
                                value={email}
                                onChangeText={(text) => setEmail(text.toLowerCase())}
                                keyboardType='email-address'
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 15, borderWidth: 2, borderColor: '#726E70' }}>
                            <TextInput
                                placeholder='Password'
                                placeholderTextColor='#AAAAAA'
                                underlineColorAndroid='#00000000'
                                style={{ fontSize: 18, color: 'black', fontWeight: '500', flex: 1 }}
                                clearButtonMode='always'
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                onEndEditing={onSignIn}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(old => !old)}
                                style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                                <FontAwesome5 name={!showPassword ? 'eye' : 'eye-slash'} size={20} color={!showPassword ? 'black' : '#777777'} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#726E70' }} />
                            <Text style={{ fontSize: 18, color: '#726E70', fontWeight: 'bold' }}>or</Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#726E70' }} />
                        </View>
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

                        <ButtonWithLoading
                            text={'Sign in'}
                            onPress={onSignIn}
                            loading={loading}
                        />
                        <TouchableOpacity onPress={onSignUp} style={{ padding: 8 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#333333' }}>{`Are you new ? `}
                                <Text style={{ color: '#5E30C1' }}>Sign up here</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </View>

        </View>
    )
}

export default SignInScreen