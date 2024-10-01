import Text from '@/components/Text'
import colors from '@/utils/colors'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { appleAuth } from '@invertase/react-native-apple-authentication'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { StatusBar } from 'expo-status-bar'
import axios from 'axios'
import { useAtomValue, useSetAtom } from 'jotai'
import { deviceIdAtom, tokenAtom, userAtom } from '@/actions/global'
import Toast from 'react-native-toast-message'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiClient from '@/utils/apiClient'
import { getAuthenScreen } from '@/utils/utils'

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

    const onSocialLogin = (id, name, avatar, email, provider) => {
        console.log({ id, name, avatar, email, provider })
    }

    const onGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if (isSuccessResponse(response)) {
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

        const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

        if (credentialState === appleAuth.State.AUTHORIZED) {
            console.log({ appleAuthRequestResponse })

            const { identityToken, nonce, email, fullName, user } = appleAuthRequestResponse;
            if (email === null) {
                Alert.alert(i18n.t('error'), i18n.t('apple_need_reset_login'))
                return
            }
            onSocialLogin(user, fullName.givenName + ' ' + fullName.familyName, null, email, 'apple')
        } else {
            Toast.show({ text1: i18n.t('error'), text2: i18n.t('cannot_login'), type: 'error' })
        }
    }

    const onSignIn = () => {
        // NavigationService.reset('Dashboard')
        apiClient.post('auth/login', { email, password, device_id: deviceId, platform: Platform.OS })
            .then((res) => {
                console.log({ res })
                if (res && res.data && res.data.success) {
                    const currentUser = res.data.data.user
                    setUser(currentUser)
                    setToken(res.data.data.token)
                    AsyncStorage.setItem('ACCESS_TOKEN', res.data.data.token)
                    Toast.show({ text1: res.data.message, type: 'success' })

                    NavigationService.reset(getAuthenScreen(currentUser))
                } else {
                    Toast.show({ text1: res.data.message, type: 'error' })
                }
            })
            .catch((error) => {
                console.log({ error })
                Toast.show({ text1: error, type: 'error' })
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
                    <View style={{ alignItems: 'center', width: '100%', flex: 1, gap: 20, }}>
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
                        <View style={{ width: '100%', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 15, borderWidth: 2, borderColor: '#726E70' }}>
                            <TextInput
                                placeholder='Password'
                                placeholderTextColor='#AAAAAA'
                                underlineColorAndroid='#00000000'
                                style={{ fontSize: 18, color: 'black', fontWeight: '500' }}
                                clearButtonMode='always'
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#726E70' }} />
                            <Text style={{ fontSize: 18, color: '#726E70', fontWeight: 'bold' }}>or</Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#726E70' }} />
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center', gap: 10, flexDirection: 'row' }}>
                            <TouchableOpacity onPress={onApple} style={{ height: 54, borderRadius: 25, alignItems: 'center', justifyContent: 'center', width: 80, backgroundColor: '#EEEEEE' }}>
                                <Image source={images.apple_icon} style={{ width: 20, height: 20 }} contentFit='contain' />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onGoogle} style={{ height: 54, borderRadius: 25, alignItems: 'center', justifyContent: 'center', width: 80, backgroundColor: '#EEEEEE' }}>
                                <Image source={images.google_icon} style={{ width: 20, height: 20 }} contentFit='contain' />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={onSignIn} style={{ marginTop: 60, width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Sign in</Text>
                        </TouchableOpacity>
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