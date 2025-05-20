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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16, backgroundColor: '#F1F1F3',
        paddingHorizontal: 24
    }
})

const JourneyMatchingScreen = ({ navigation, route }) => {
    const { fromView } = route && route.params ? route.params : {};
    const insets = useSafeAreaInsets()
    const [currentUser, setCurrentUser] = useAtom(userAtom)
    const [completed, setCompleted] = React.useState(false)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'JourneyMatchingScreen',
            screen_class: 'JourneyMatchingScreen'
        })
    }, [])

    useEffect(() => {
        const getJourney = async () => {
            try {
                const res = await apiClient.get(`users/${currentUser?.id}/analyze-user`)

                if (res && res.data && res.data.success) {
                    setCurrentUser(res.data.data)
                }
                setCompleted(true)
            } catch (error) {
                console.log('Error fetching journey:', error)
                setCompleted(true)
            }
        }

        getJourney()
    }, [])

    const onContinue = () => {
        NavigationService.reset('Dashboard')
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24, gap: 24, backgroundColor: colors.mainColor }]}>
            <View style={{ width: '100%', flex: 1, gap: 24, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.wave_bg} style={{
                        width: Dimensions.get('screen').width - 48,
                        height: Dimensions.get('screen').width - 48,
                        opacity: 0.5
                    }} />
                </View>
                <Text style={{ width: '100%', fontSize: 20, textAlign: 'center', lineHeight: 30, color: 'white', fontWeight: 'bold' }}>Kuky is matching you with the best community and people to support your growth</Text>
                {!completed && <AutoProgressBar indeterminate={!completed} />}
            </View>

            <ButtonWithLoading
                text={'Let’s Get Started!'}
                onPress={onContinue}
                disabled={!completed}
            />
        </View>
    )
}

export default JourneyMatchingScreen