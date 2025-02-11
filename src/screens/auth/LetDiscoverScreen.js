import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect } from 'react'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import colors from '../../utils/colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import analytics from '@react-native-firebase/analytics'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 32,
    }
})

const LetDiscoverScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'LetDiscoverScreen',
            screen_class: 'LetDiscoverScreen'
        })
    }, [])

    const openSignIn = () => {
        NavigationService.reset('SignInScreen')
    }

    const skipTour = () => {
        analytics().logEvent('skip_tour_button')
        NavigationService.reset('SignUpScreen')
        // NavigationService.reset('SampleExploreScreen')
    }

    const onDiscover = () => {
        analytics().logEvent('discover_kuky_button')
        NavigationService.reset('OnboardingSampleProfileScreen')
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={openSignIn} style={{ padding: 8 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: 'black' }}>Sign In</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ gap: 16, width: '100%' }}>
                    <Image source={images.logo_icon} style={{ width: 40, height: 40 }} contentFit='contain' />
                    <Text style={{ fontSize: 32, lineHeight: 40, fontWeight: '600', color: '#4c4c4c' }}>{`Let’s\nDiscover Kuky!`}</Text>
                </View>
                <View style={{ paddingVertical: 24, flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, width: '100%' }}>
                    <Image source={images.suggestion_cloud} style={{ width: 90, height: 90 }} contentFit='contain' />
                    <Text style={{ width: '100%', fontSize: 18, fontWeight: '500', lineHeight: 25, color: '#4C4C4C' }}>Next, </Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 6, backgroundColor: colors.mainColor, }} />
                        <Text style={{ flex: 1, fontSize: 18, fontWeight: '500', lineHeight: 25, color: 'black' }}>{`You'll see a few profiles of people sharing their stories.`}</Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 6, backgroundColor: colors.mainColor, }} />
                        <Text style={{ flex: 1, fontSize: 18, fontWeight: '500', lineHeight: 25, color: 'black' }}>{`Watch their videos, explore their interests, and decide if you’d like to connect.`}</Text>
                    </View>
                </View>
                <View style={{ width: '100%', alignItems: "center" }}>
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Image source={images.next_arrow} style={{ width: 35, height: 60 }} contentFit='contain' />
                    </View>
                    <TouchableOpacity onPress={onDiscover} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Discover Kuky</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={skipTour} style={{ padding: 8, marginTop: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#333333' }}>Skip Tour</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default LetDiscoverScreen