import { pushTokenAtom, tokenAtom, userAtom } from '@/actions/global'
import Text from '@/components/Text'
import apiClient from '@/utils/apiClient'
import colors from '@/utils/colors'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { getAuthenScreen } from '@/utils/utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'expo-image'
import { useAtomValue, useSetAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16
    }
})

const SplashScreen = ({ navigation }) => {
    const setUser = useSetAtom(userAtom)
    const setToken = useSetAtom(tokenAtom)
    const pushToken = useAtomValue(pushTokenAtom)

    const openGetStart = () => {
        NavigationService.reset('GetStartScreen')
    }

    useEffect(() => {
        const getRoute = async () => {
            const token = await AsyncStorage.getItem('ACCESS_TOKEN')

            if (token) {
                apiClient('users/user-info')
                .then((res) => {
                    if(res && res.data && res.data.success) {
                        console.log({userInfo: res.data.data})
                        setUser(res.data.data)
                        setToken(token)
                        NavigationService.reset(getAuthenScreen(res.data.data))

                        console.log({pushToken})
                        if(pushToken) {
                            apiClient.post('users/update-token', {session_token: pushToken})
                            .then((res) => {
                                console.log({res})
                            })
                            .catch((error) => {
                                console.log({error})
                            })
                        }
                    } else {
                        openGetStart()
                    }
                })
                .catch((error) => {
                    openGetStart()
                    console.log({error})
                })
            } else {
                setTimeout(() => {
                    openGetStart()
                }, 2000);
            }
        }

        getRoute()
    }, [])

    return (
        <View style={styles.container}>
            <Image contentFit='contain' source={images.logo_text} style={{ height: 80, width: 150 }} />
            <Text style={{ fontSize: 24, fontWeight: '700' }}>Better Together</Text>
            <View style={{ paddingVertical: 64 }}>
                <Image contentFit='contain' source={images.splash_bg} style={{ width: 300, height: 300 }} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '500', textAlign: 'center' }}>{`Let Our AI Connect You`}</Text>
            <Text style={{ fontSize: 20, fontWeight: '500', textAlign: 'center' }}>{`with People Who Understand`}</Text>
            <Text style={{ fontSize: 20, fontWeight: '500', textAlign: 'center' }}>{`You!`}</Text>
            <ActivityIndicator size='large' color={colors.mainColor} />
        </View>
    )
}

export default SplashScreen