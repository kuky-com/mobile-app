import { pushTokenAtom, tokenAtom, userAtom } from '@/actions/global'
import ButtonWithLoading from '@/components/ButtonWithLoading'
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
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: colors.mainColor,
        paddingHorizontal: 16
    }
})

const FirstTimeScreen = ({ navigation }) => {
    const setUser = useSetAtom(userAtom)
    const setToken = useSetAtom(tokenAtom)
    const pushToken = useAtomValue(pushTokenAtom)
    const [isFirstTime, setIsFirstTime] = useState(true)

    const openGetStart = () => {
        NavigationService.reset('GetStartScreen')
    }

    const getRoute = async () => {
        const token = await AsyncStorage.getItem('ACCESS_TOKEN')
        const deviceId = await AsyncStorage.getItem('DEVICE_ID')

        if (token && deviceId) {
            apiClient('users/user-info')
                .then((res) => {
                    console.log({ userInfo111: res.data.data })
                    if (res && res.data && res.data.success) {
                        console.log({ userInfo: res.data.data })
                        setUser(res.data.data)
                        setToken(token)

                        NavigationService.reset(getAuthenScreen(res.data.data))

                        console.log({ pushToken })
                        if (pushToken) {
                            apiClient.post('users/update-token', { session_token: pushToken })
                                .then((res) => {
                                    console.log({ res })
                                })
                                .catch((error) => {
                                    console.log({ error })
                                })
                        }
                    } else {
                        openGetStart()
                    }
                })
                .catch((error) => {
                    openGetStart()
                    console.log({ error })
                })
        } else {
            openGetStart()
        }
    }

    return (
        <View style={styles.container}>
            <Image contentFit='contain' source={images.logo_text} style={{ height: 80, width: 150, tintColor: 'white' }} />
            <Text style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>Better Together</Text>
            <View style={{ paddingVertical: 16 }}>
                <Image contentFit='contain' source={images.splash_bg} style={{ width: Dimensions.get('screen').width - 32, height: Dimensions.get('screen').width - 32 }} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '500', textAlign: 'center', color: 'white' }}>{`Let Our AI Connect You`}</Text>
            <Text style={{ fontSize: 20, fontWeight: '500', textAlign: 'center', color: 'white' }}>{`with People Who Understand`}</Text>
            <Text style={{ fontSize: 20, fontWeight: '500', textAlign: 'center', color: 'white' }}>{`You!`}</Text>
            {!isFirstTime && <ActivityIndicator size='large' color={'white'} />}
            {isFirstTime && <ButtonWithLoading text='Start Your Journey' onPress={getRoute} />}
        </View>
    )
}

export default FirstTimeScreen