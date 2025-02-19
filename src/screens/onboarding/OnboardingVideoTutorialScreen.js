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
    const [isMute, setIsMute] = useState(true)
    const [playing, setPlaying] = useState(true)
    const videoRef = useRef(null)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'OnboardingVideoTutorialScreen',
            screen_class: 'OnboardingVideoTutorialScreen'
        })
    }, [])

    const onContinue = () => {
        NavigationService.reset('OnboardingVideoScreen')
    }

    const onSkip = () => {
        NavigationService.reset('Dashboard')
        // if (currentUser?.profile_tag) {
        //     NavigationService.reset('Dashboard')
        // } else {
        //     NavigationService.reset('OnboardingReviewProfileScreen')
        // }
    }

    const openWalkThrought = () => {
        NavigationService.push('OnboardingVideoWalkthroughtScreen', { page: 1 })
    }

    const playVideo = async () => {
        if (videoRef && videoRef.current) {
            if (playing) {
                try {
                    await videoRef.current.setStatusAsync({ shouldPlay: false });
                } catch (error) {
                    console.log({ error });
                }
            } else {
                try {
                    await videoRef.current.setStatusAsync({ shouldPlay: true });
                } catch (error) {
                    console.log({ error });
                }
            }
        }
    };

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
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: 8 }}>
                    <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start', gap: 16, flex: 1 }}>
                        <Image source={images.logo_icon} style={{ width: 40, height: 40 }} contentFit='contain' />

                        <Text onPress={openWalkThrought} style={{ fontSize: 13, color: '#725ED4', textAlign: 'left', lineHeight: 18, fontWeight: '500' }}>Why We Ask for Your Video?</Text>

                        <Text style={{ fontSize: 26, lineHeight: 32, color: '#4C4C4C', fontWeight: '600' }}>{`Now,\nIt’s time to record your video!`}</Text>

                    </View>


                    <View style={{}}>
                        <Video
                            ref={videoRef}
                            source={require('../../assets/videos/tutorial_video.mov')}
                            style={{ width: 150, height: 280, borderRadius: 5 }}
                            resizeMode='cover'
                            shouldPlay={true}
                            useNativeControls={true}
                            isMuted={isMute}
                            onPlaybackStatusUpdate={(status) => {
                                // console.log({ status });
                                setPlaying(status.isPlaying);
                                if (status.didJustFinish) {
                                    videoRef.current.setStatusAsync({ positionMillis: 0 });
                                }
                            }}
                        />
                        <TouchableOpacity onPress={() => setIsMute(!isMute)} style={{ position: 'absolute', top: 5, right: 5, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mainColor }}>
                            <FontAwesome6 name={isMute ? 'volume-xmark' : 'volume-high'} size={15} color='white' />
                        </TouchableOpacity>

                        <View style={{ position: 'absolute', bottom: 5, left: 5, alignItems: 'flex-start', justifyContent: 'center' }}>
                            <TouchableOpacity
                                onPress={playVideo}
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Image
                                    source={playing ? images.pause_icon : images.play_icon}
                                    style={{ width: 50, height: 50 }}
                                    contentFit="contain"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <ScrollView style={{ flex: 1 }}>
                    <View style={{ flex: 1, gap: 32, width: '100%' }}>
                        {/* <Text style={{ fontSize: 32, fontWeight: '600', color: '#4C4C4C' }}>{`Now It’s time to record your video!`}</Text> */}

                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', width: '100%' }}>
                            <View style={{ marginTop: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.mainColor }} />
                            <Text style={{ flex: 1, lineHeight: 22, fontSize: 16, fontWeight: '500', color: 'black' }}>{`Remember to be yourself and have fun!`}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', width: '100%' }}>
                            <View style={{ marginTop: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.mainColor }} />
                            <Text style={{ flex: 1, lineHeight: 22, fontSize: 16, fontWeight: '500', color: 'black' }}>{`Tell us your purpose & who you’d like to connect with`}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', width: '100%' }}>
                            <View style={{ marginTop: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.mainColor }} />
                            <Text style={{ flex: 1, lineHeight: 22, fontSize: 16, fontWeight: '500', color: 'black' }}>{`Our AI will take care of the rest`}</Text>
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