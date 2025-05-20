import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import LoadingView from '@/components/LoadingView'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/actions/global'
import colors from '../../utils/colors'
import analytics from '@react-native-firebase/analytics'
import { Video } from 'expo-av'
import CustomVideo from '../../components/CustomVideo'
import { FontAwesome6 } from '@expo/vector-icons'
import { milliseconds, set } from 'date-fns'
import apiClient from '../../utils/apiClient'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 24, paddingHorizontal: 24,
        backgroundColor: colors.mainColor
    },
    imageContainer: {
        backgroundColor: '#ECECEC', borderRadius: 20, alignItems: 'center',
        justifyContent: 'center',
        width: (Platform.isPad ? 600 : Dimensions.get('screen').width) - 48, height: (Platform.isPad ? 600 : Dimensions.get('screen').width) - 48,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
    },
    closeButton: {
        width: 30, height: 30, backgroundColor: '#333333',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 15,
        position: 'absolute', top: 8, right: 8
    }
})

const JourneyVideoTutorialScreen = ({ navigation, route }) => {
    const { fromOnboarding } = route && route.params ? route.params : {}
    const insets = useSafeAreaInsets()
    const currentUser = useAtomValue(userAtom)
    const [question, setQuestion] = useState(null)

    const getQuestion = async () => {
        try {
            const res = await apiClient.get(`journeys/jpf-video-question?journey_id=${currentUser?.journey_id}`)

            if (res && res.data && res.data.success) {
                setQuestion(res.data.data)
            }
        } catch (error) {
            console.log({ error })
        }
    }

    useEffect(() => {
        getQuestion()
    }, [])

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'JourneyVideoTutorialScreen',
            screen_class: 'JourneyVideoTutorialScreen'
        })
    }, [])

    const onContinue = () => {
        NavigationService.reset('JourneyVideoScreen')
    }

    const onSkip = () => {
        if (fromOnboarding) {
            NavigationService.reset('JourneyMatchingScreen')
        } else {
            NavigationService.reset('Dashboard')
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />

            <View style={{ flex: 1, gap: 48, width: Platform.isPad ? 600 : '100%', alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20, width: '100%', textAlign: 'center', color: 'white', fontWeight: 'bold', lineHeight: 30 }}>{`Your Journey & Why You're Here`}</Text>
                <Image source={images.record_tutorial} style={{ width: 180, height: 180 }} contentFit='contain' />
                <Text style={{ fontSize: 14, width: '100%', textAlign: 'center', color: 'white', fontWeight: '500', lineHeight: 21 }}>{`Share what brought you to Kuky. This helps us match you with people on a similar journey.`}</Text>
            </View>
            <TouchableOpacity onPress={onContinue} style={{ width: Platform.isPad ? 600 : '100%', alignSelf: 'center', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{'Record my reflection'}</Text>
            </TouchableOpacity>
            {/* <View style={{ width: '100%', alignItems: 'center' }}>
                <Text style={{ padding: 8, fontSize: 14, fontWeight: 'bold', color: 'white' }} onPress={onSkip}>Not right now</Text>
            </View> */}

        </View>
    )
}

export default JourneyVideoTutorialScreen