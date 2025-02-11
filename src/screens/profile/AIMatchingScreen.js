import React, { useEffect } from 'react'
import { DeviceEventEmitter, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import analytics from '@react-native-firebase/analytics'
import { Image } from 'expo-image'
import Text from '@/components/Text'
import ButtonWithLoading from '../../components/ButtonWithLoading'
import NavigationService from '@/utils/NavigationService'
import images from '../../utils/images'
import { FontAwesome6 } from '@expo/vector-icons'
import { useAtom, useAtomValue } from 'jotai'
import { userAtom } from '../../actions/global'
import AutoProgressBar from '../../components/AutoProgressBar'
import apiClient from '../../utils/apiClient'
import constants from '../../utils/constants'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16, backgroundColor: '#F1F1F3',
        paddingHorizontal: 24
    }
})

const AIMatchingScreen = ({ navigation, route }) => {
    const { fromView } = route && route.params ? route.params : {};
    const insets = useSafeAreaInsets()
    const [currentUser, setCurrentUser] = useAtom(userAtom)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'AIMatchingScreen',
            screen_class: 'AIMatchingScreen'
        })
    }, [])

    const getTag = () => {
        apiClient.get('interests/profile-tag')
            .then((res) => {
                console.log({ profileTag: res })
                if (res && res.data && res.data.success) {
                    setCurrentUser(res.data.data)
                    DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS)
                }
            })
            .catch((error) => {
                console.log({ profileError: error })
            })
    }


    useEffect(() => {
        getTag()
        setTimeout(() => {
            NavigationService.reset('Dashboard')
        }, 6500);
    }, [])

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24, gap: 24 }]}>
            <Image source={images.logo_icon} style={{ width: 40, height: 40 }} />
            <Text style={{ fontSize: 32, textAlign: 'center', lineHeight: 40, color: '#4C4C4C', fontWeight: '400' }}>Let’s Find Your Journey Buddies!</Text>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 }}>
                <Image source={images.suggestion_cloud} style={{ width: 95, height: 82 }} />
                <AutoProgressBar />
            </View>
            <Text style={{ fontSize: 13, color: '#4C4C4C', lineHeight: 25, fontWeight: '500' }}>Our AI is working to match you with the best companions based on your profile and story</Text>
        </View>
    )
}

export default AIMatchingScreen