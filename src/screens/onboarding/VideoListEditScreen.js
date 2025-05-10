import Text from "@/components/Text";
import images from "@/utils/images";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    AppState,
    DeviceEventEmitter,
    Dimensions,
    Keyboard,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import { userAtom } from "@/actions/global";
import analytics from '@react-native-firebase/analytics'
import NavigationService from '@/utils/NavigationService'
import CustomVideo from "../../components/CustomVideo";
import { ResizeMode } from "expo-av";
import { FontAwesome6 } from "@expo/vector-icons";
import VideoManager from "../../components/VideoManager";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#725ED4",
    },
});


const VideoListEditScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const currentUser = useAtomValue(userAtom);

    const videoIntroRef = useRef(null);
    const videoJourneyyRef = useRef(null);
    const videoInterestsRef = useRef(null);

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'VideoListEditScreen',
            screen_class: 'VideoListEditScreen'
        })
    }, [])

    const playVideo = async (type) => {
        pauseVideo()

        if (videoIntroRef && videoIntroRef.current && type === 'intro') {

            await VideoManager.stopCurrent();
            videoIntroRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 })
            VideoManager.setCurrent(videoIntroRef.current);
        }

        if (videoJourneyyRef && videoJourneyyRef.current && type === 'purpose') {

            await VideoManager.stopCurrent();
            videoJourneyyRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 })
            VideoManager.setCurrent(videoJourneyyRef.current);
        }

        if (videoInterestsRef && videoInterestsRef.current && type === 'interests') {

            await VideoManager.stopCurrent();
            videoInterestsRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 })
            VideoManager.setCurrent(videoInterestsRef.current);
        }
    }

    const pauseVideo = () => {
        if (videoIntroRef && videoIntroRef.current) {
            videoIntroRef.current.setStatusAsync({ shouldPlay: false })
        }

        if (videoJourneyyRef && videoJourneyyRef.current) {
            videoJourneyyRef.current.setStatusAsync({ shouldPlay: false })
        }

        if (videoInterestsRef && videoInterestsRef.current) {
            videoInterestsRef.current.setStatusAsync({ shouldPlay: false })
        }
    }

    const onSelect = (type) => {
        if (type === 'intro') {
            NavigationService.reset('IntroductionVideoScreen')
        } else if (type === 'purpose') {
            NavigationService.reset('JourneyVideoScreen')
        } else {
            NavigationService.reset('InterestVideoScreen')
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, alignItems: 'center', justifyContent: 'center', gap: 24 }]}>
            <StatusBar translucent style="dark" />

            <ScrollView style={{ width: '100%', flex: 1, paddingTop: 32 }}>
                <View style={{ width: '100%', flex: 1, paddingHorizontal: 24, paddingVertical: 24, borderRadius: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 16 }}>
                        <View>
                            <CustomVideo
                                style={{ borderWidth: 2, borderColor: '#CDB8E2', justifyContent: 'flex-end', width: 150, height: 200, borderRadius: 10, overflow: 'hidden' }}
                                ref={videoIntroRef}
                                sources={[
                                    currentUser?.video_intro,
                                ]}
                                // subtitles={[
                                //     currentUser?.subtitle_intro,
                                // ]}
                                resizeMode={ResizeMode.COVER}
                            />
                        </View>

                        <View style={{ flex: 1, gap: 8 }}>
                            <TouchableOpacity onPress={() => playVideo('intro')} style={{ borderWidth: 1, borderColor: 'white', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={images.play_icon} style={{ width: 40, height: 40 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>1 / 3</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>Tell us a little about yourself</Text>
                            <TouchableOpacity onPress={() => onSelect('intro')} style={{
                                height: 26, borderRadius: 13, backgroundColor: currentUser?.video_intro ? '#333333' : '#D62219', width: 120,
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{currentUser?.video_intro ? 'Retake' : 'Record'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ width: '100%', height: 2, backgroundColor: 'white', borderRadius: 1, marginVertical: 16 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 16 }}>
                        <View>
                            <CustomVideo
                                style={{ borderWidth: 2, borderColor: '#CDB8E2', justifyContent: 'flex-end', width: 150, height: 200, borderRadius: 10, overflow: 'hidden' }}
                                ref={videoJourneyyRef}
                                sources={[
                                    currentUser?.video_purpose,
                                ]}
                                // subtitles={[
                                //     currentUser?.subtitle_purpose,
                                // ]}
                                resizeMode={ResizeMode.COVER}
                            />
                        </View>

                        <View style={{ flex: 1, gap: 8 }}>
                            <TouchableOpacity onPress={() => playVideo('purpose')} style={{ borderWidth: 1, borderColor: 'white', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={images.play_icon} style={{ width: 40, height: 40 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>2 / 3</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>Journey video</Text>
                            <TouchableOpacity onPress={() => onSelect('purpose')} style={{
                                height: 26, borderRadius: 13, backgroundColor: currentUser?.video_purpose ? '#333333' : '#D62219', width: 120,
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{currentUser?.video_purpose ? 'Retake' : 'Record'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ width: '100%', height: 2, backgroundColor: 'white', borderRadius: 1, marginVertical: 16 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 16 }}>
                        <View>
                            <CustomVideo
                                style={{ borderWidth: 2, borderColor: '#CDB8E2', justifyContent: 'flex-end', width: 150, height: 200, borderRadius: 10, overflow: 'hidden' }}
                                ref={videoInterestsRef}
                                sources={[
                                    currentUser?.video_interests,
                                ]}
                                resizeMode={ResizeMode.COVER}
                            />
                        </View>

                        <View style={{ flex: 1, gap: 8 }}>
                            <TouchableOpacity onPress={() => playVideo('interests')} style={{ borderWidth: 1, borderColor: 'white', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={images.play_icon} style={{ width: 40, height: 40 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>3 / 3</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>Tell us something you really like/dislike!</Text>
                            <TouchableOpacity onPress={() => onSelect('interests')} style={{
                                height: 26, borderRadius: 13, backgroundColor: currentUser?.video_interests ? '#333333' : '#D62219', width: 120,
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{currentUser?.video_interests ? 'Retake' : 'Record'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity style={{
                position: 'absolute', top: insets.top + 5, right: 16,
                width: 25, height: 25, alignItems: 'center', justifyContent: 'center'
            }}
                onPress={() => navigation.goBack()}>
                <FontAwesome6 name='xmark' size={20} color='#ffffff' />
            </TouchableOpacity>
        </View>
    )
};

export default VideoListEditScreen;
