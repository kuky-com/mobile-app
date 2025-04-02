import React, { useEffect } from 'react'
import { DeviceEventEmitter, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'
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
import colors from '../../utils/colors'
import { getAuthenScreen } from '../../utils/utils'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16, backgroundColor: '#F1F1F3',
        paddingHorizontal: 24
    }
})

const WelcomeBackScreen = ({ navigation, route }) => {
    const { fromView } = route && route.params ? route.params : {};
    const insets = useSafeAreaInsets()
    const [currentUser, setCurrentUser] = useAtom(userAtom)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'WelcomeBackScreen',
            screen_class: 'WelcomeBackScreen'
        })
    }, [])

    const onContinue = () => {
        NavigationService.reset(getAuthenScreen(currentUser))
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24, gap: 24, backgroundColor: colors.mainColor }]}>
            <View style={{ width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 40 }}>
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.wave_bg} style={{
                        width: Dimensions.get('screen').width - 48,
                        height: Dimensions.get('screen').width - 48,
                        opacity: 0.5
                    }} />
                </View>
                <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold'}}>{`Welcome back ${currentUser?.full_name}!`}</Text>
                <Text style={{ width: '100%', fontSize: 16, textAlign: 'center', lineHeight: 30, color: 'white', fontWeight: '500' }}>{`Your journey with `}
                    <Text style={{fontWeight: 'bold', fontSize: 17}}>{`${currentUser?.journey?.name}`}</Text>
                    {` is just getting started. Let’s pick up where you left off.`}</Text>
            </View>

            <ButtonWithLoading
                text={'Let’s Get Started!'}
                onPress={onContinue}
            />
        </View>
    )
}

export default WelcomeBackScreen