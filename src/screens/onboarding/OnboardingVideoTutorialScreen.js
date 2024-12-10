import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Dimensions, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import LoadingView from '@/components/LoadingView'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/actions/global'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 24, paddingHorizontal: 24
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

const OnboardingVideoTutorialScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const currentUser = useAtomValue(userAtom)

    const onContinue = () => {
        NavigationService.reset('OnboardingVideoScreen')
    }

    const onSkip = () => {
        if (currentUser?.profile_tag) {
            NavigationService.reset('Dashboard')
        } else {
            NavigationService.reset('OnboardingReviewProfileScreen')
        }
    }

    const openWalkThrought = () => {
        NavigationService.push('OnboardingVideoWalkthroughtScreen', {page: 1})
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
            {/* {
                !onboarding &&
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 16, top: insets.top + 16, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.back_icon_no_border} style={{ width: 25, height: 25 }} contentFit='contain' />
                </TouchableOpacity>
            } */}
            <View style={{ flex: 1, gap: 24, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start', gap: 16, marginTop: 20 }}>
                        <Image source={images.logo_icon} style={{ width: 40, height: 40 }} contentFit='contain' />
                        <Text style={{ fontSize: 16, color: '#4C4C4C', fontWeight: '600' }}>Video recording</Text>
                    </View>
                    <View style={{ alignItems: 'center', width: 130, justifyContent: 'center', paddingHorizontal: 10 }}>
                        <Text onPress={openWalkThrought} style={{ fontSize: 13, color: '#725ED4', textAlign: 'right', lineHeight: 18, fontWeight: '500' }}>Why We Ask for Your Video?</Text>
                    </View>
                </View>
                <ScrollView style={{ flex: 1, width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View style={{ flex: 1, gap: 32, width: '100%' }}>
                        <Text style={{ fontSize: 32, fontWeight: '600', color: '#4C4C4C' }}>{`Now It’s time to record your video!`}</Text>

                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', width: '100%' }}>
                            <View style={{ marginTop: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#A74FFF' }} />
                            <Text style={{ flex: 1, lineHeight: 22, fontSize: 16, fontWeight: '500', color: 'black' }}>{`Remember to be yourself and have fun`}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', width: '100%' }}>
                            <View style={{ marginTop: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#A74FFF' }} />
                            <Text style={{ flex: 1, lineHeight: 22, fontSize: 16, fontWeight: '500', color: 'black' }}>{`Tell us your purpose & who you’d like to connect with`}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', width: '100%' }}>
                            <View style={{ marginTop: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#A74FFF' }} />
                            <Text style={{ flex: 1, lineHeight: 22, fontSize: 16, fontWeight: '500', color: 'black' }}>{`Our AI will take care of the matching for you`}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
            <Text style={{ fontSize: 13, color: '#4C4C4C', width: '100%', textAlign: 'center' }}>We’ll guide you through the process</Text>
            <TouchableOpacity onPress={onContinue} style={{ width: Platform.isPad ? 600 : '100%', alignSelf: 'center', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{'Continue'}</Text>
            </TouchableOpacity>
            <View style={{ width: '100%', alignItems: 'center' }}>
                <Text style={{ padding: 8, fontSize: 14, fontWeight: 'bold' }} onPress={onSkip}>Skip for now</Text>
            </View>
        </View>
    )
}

export default OnboardingVideoTutorialScreen