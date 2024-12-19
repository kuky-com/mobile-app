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
        backgroundColor: '#F1F1F3',
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

const RegisterSuggestionScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()

    const onContinue = () => {
        NavigationService.reset('SignUpScreen')
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />

            <View style={{ flex: 1, gap: 24, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start', gap: 16, marginTop: 20 }}>
                        <Image source={images.logo_icon} style={{ width: 40, height: 40 }} contentFit='contain' />
                    </View>
                </View>
                <ScrollView style={{ flex: 1, width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View style={{ flex: 1, gap: 32, width: '100%' }}>
                        <Text style={{ fontSize: 32, lineHeight: 40, fontWeight: '600', color: '#4C4C4C', maxWidth: 250 }}>{`Here's how you can become part of Kuky! `}
                            <Image source={images.suggestion_think} style={{ width: 25, height: 25, marginBottom: 5 }} contentFit='contain' />
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', width: '100%' }}>
                            <Image source={images.suggestion_register1} style={{ width: 40, height: 40 }} contentFit='contain' />
                            <View style={{ flex: 1 }}>
                                <Text style={{ lineHeight: 30, fontSize: 16, fontWeight: 'bold', color: 'black' }}>{`Create Your Account`}</Text>
                                <Text style={{ lineHeight: 30, fontSize: 13, fontWeight: '500', color: 'black' }}>{`Sign up and tell us a bit about yourself.`}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', width: '100%' }}>
                            <Image source={images.suggestion_register2} style={{ width: 40, height: 40 }} contentFit='contain' />
                            <View style={{ flex: 1 }}>
                                <Text style={{ lineHeight: 30, fontSize: 16, fontWeight: 'bold', color: 'black' }}>{`Share Your Story`}</Text>
                                <Text style={{ lineHeight: 30, fontSize: 13, fontWeight: '500', color: 'black' }}>{`Record a selfie video to share your journey, likes, and dislikes. It only takes two minutes!`}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', width: '100%' }}>
                            <Image source={images.suggestion_register3} style={{ width: 40, height: 40 }} contentFit='contain' />
                            <View style={{ flex: 1 }}>
                                <Text style={{ lineHeight: 30, fontSize: 16, fontWeight: 'bold', color: 'black' }}>{`Let Our AI Work Its Magic`}</Text>
                                <Text style={{ lineHeight: 30, fontSize: 13, fontWeight: '500', color: 'black' }}>{`We’ll find the best connections for you based on your profile and story.`}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
            <View style={{ flexDirection: 'row', gap: 25, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <Text style={{ fontSize: 13, color: '#4C4C4C', width: 200, lineHeight: 25 }}>{`We can't wait to have you as part of Kuky!`}</Text>
                <Image source={images.suggestion_cloud} contentFit='contain' style={{ width: 72, height: 72 }} />
            </View>
            <TouchableOpacity onPress={onContinue} style={{ width: Platform.isPad ? 600 : '100%', alignSelf: 'center', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{'Let’s get started!'}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default RegisterSuggestionScreen