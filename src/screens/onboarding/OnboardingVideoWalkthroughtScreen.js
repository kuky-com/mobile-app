

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
import { FontAwesome6 } from '@expo/vector-icons'

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

const walkthroughts = [
    {
        title: `Our AI Matches You with People Who Truly Align with Your Goals`,
        image: images.walkthrought1,
        message: 'No endless swipes needed!'
    },
    {
        title: `Your Video Helps Us Verify Profiles`,
        image: images.walkthrought2,
        message: 'Keeping the platform authentic and safe.'
    },
    {
        title: `It’s Faster to Share Your Story in a Video`,
        image: images.walkthrought3,
        message: 'Say goodbye to long forms!'
    }
]

const OnboardingVideoWalkthroughtScreen = ({ navigation, route }) => {
    const { page } = route.params
    const insets = useSafeAreaInsets()
    const currentUser = useAtomValue(userAtom)

    const onNext = () => {

        if (page < 3)
            NavigationService.replace('OnboardingVideoWalkthroughtScreen', { page: page + 1 })
        else
            NavigationService.reset('OnboardingVideoScreen')
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />

            <View style={{ flex: 1, gap: 24, width: Platform.isPad ? 600 : '100%', alignSelf: 'center', alignItems: 'center' }}>

                <View style={{ flex: 1, gap: 48, width: '100%', maxWidth: 280, alignItems: 'center', justifyContent: "center" }}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', lineHeight: 30, color: '#4C4C4C' }}>{`Why We Ask for Your Video?`}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                            {
                                walkthroughts.map((item, index) => {
                                    if ((page - 1) === index) {
                                        return (
                                            <View key={item.title} style={{ width: 32, height: 5, borderRadius: 2.5, backgroundColor: '#CDB8E2' }} />
                                        )
                                    } else {
                                        return (
                                            <View key={item.title} style={{ width: 8, height: 5, borderRadius: 2.5, backgroundColor: '#D9D9D9' }} />
                                        )
                                    }
                                })
                            }
                        </View>
                    </View>
                    <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', lineHeight: 30, color: '#4C4C4C' }}>{`${walkthroughts[page - 1].title}`}</Text>
                    <Image source={walkthroughts[page - 1].image} style={{ width: 250, height: 250 }} contentFit='contain' />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', lineHeight: 30, color: '#4C4C4C' }}>{`${walkthroughts[page - 1].message}`}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={onNext} style={{ width: Platform.isPad ? 600 : '100%', alignSelf: 'center', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{page === 3 ? 'Got It! Let’s Go' : 'Next'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', right: 16, top: insets.top + 16, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesome6 name='xmark' size={20} color='black' />
            </TouchableOpacity>
        </View>
    )
}

export default OnboardingVideoWalkthroughtScreen