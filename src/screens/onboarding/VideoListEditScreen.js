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
import {
    GiftedChat,
    Bubble,
    InputToolbar,
    Message,
    Send,
    Composer,
    Time,
    Avatar,
    Day,
    Actions,
} from "react-native-gifted-chat";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import { userAtom } from "@/actions/global";
import dayjs from "dayjs";
import TypingBubble from "../../components/TypingBubble";
import analytics from '@react-native-firebase/analytics'
import OnlineStatus from "../../components/OnlineStatus";
import Hyperlink from 'react-native-hyperlink'
import ButtonWithLoading from "../../components/ButtonWithLoading";
import NavigationService from '@/utils/NavigationService'
import CustomVideo from "../../components/CustomVideo";
import { ResizeMode } from "expo-av";
import AvatarImage from "../../components/AvatarImage";
import axios from "axios";
import { capitalize } from "../../utils/utils";
import apiClient from "../../utils/apiClient";
import { FontAwesome6 } from "@expo/vector-icons";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#725ED4",
    },
});


const VideoListEditScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const currentUser = useAtomValue(userAtom);
    const [playing, setPlaying] = useState(false);

    const [purposeData, setPurposeData] = useState(null);
    const [interestsData, setInterestsData] = useState(null);

    const videoIntroRef = useRef(null);
    const videoWhyRef = useRef(null);
    const videoChallengeRef = useRef(null);
    const videoPurposeRef = useRef(null);
    const videoInterestsRef = useRef(null);

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'OnboardingVideoResultScreen',
            screen_class: 'OnboardingVideoResultScreen'
        })
    }, [])

    useEffect(() => {
        if (interestsData && purposeData) {
            processAudio()
        }
    }, [interestsData, purposeData])

    const playVideo = (type) => {
        pauseVideo()

        if (videoIntroRef && videoIntroRef.current && type === 'intro') {
            videoIntroRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 })
        }

        if (videoWhyRef && videoWhyRef.current && type === 'why') {
            videoWhyRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 })
        }

        if (videoChallengeRef && videoChallengeRef.current && type === 'challenge') {
            videoChallengeRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 })
        }

        if (videoPurposeRef && videoPurposeRef.current && type === 'purpose') {
            videoPurposeRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 })
        }

        if (videoInterestsRef && videoInterestsRef.current && type === 'interests') {
            videoInterestsRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 })
        }
    }

    const pauseVideo = () => {
        if (videoIntroRef && videoIntroRef.current) {
            videoIntroRef.current.setStatusAsync({ shouldPlay: false })
        }

        if (videoWhyRef && videoWhyRef.current) {
            videoWhyRef.current.setStatusAsync({ shouldPlay: false })
        }

        if (videoChallengeRef && videoChallengeRef.current) {
            videoChallengeRef.current.setStatusAsync({ shouldPlay: false })
        }

        if (videoPurposeRef && videoPurposeRef.current) {
            videoPurposeRef.current.setStatusAsync({ shouldPlay: false })
        }

        if (videoInterestsRef && videoInterestsRef.current) {
            videoInterestsRef.current.setStatusAsync({ shouldPlay: false })
        }
    }

    const processAudio = async () => {
        try {
            if (!interestsData || !purposeData) return

            let likes = []
            let dislikes = []
            let purposes = []
            let age = null
            let gender = null
            let name = null


            if (purposeData.tags) {
                const tags = purposeData.tags

                try {
                    let names = []
                    if (tags.journey && tags.journey.length > 0) {
                        names = tags.journey.map((item) => capitalize(item))
                    }

                    if (currentUser && currentUser.purposes) {
                        for (const purpose of currentUser.purposes) {
                            if (!names.includes(capitalize(purpose.name)))
                                names.push(capitalize(purpose.name))
                        }
                    }
                    const res = await apiClient.post('interests/update-purposes', { purposes: names })

                    if (res.data.data) {
                        purposes = res.data.data.map((item) => ({ name: item.purpose.name }))
                    }
                } catch (error) {
                    console.log({ error })
                }
            }

            if (interestsData.tags) {
                const tags = interestsData.tags

                try {
                    let names = []
                    if (tags.like && tags.like.length > 0) {
                        names = tags.like.map((item) => capitalize(item))
                    }

                    if (currentUser && currentUser.interests) {
                        for (const interest of currentUser.interests) {
                            if (interest && interest.user_interests && interest.user_interests.interest_type === 'like' && !names.includes(capitalize(interest.name)))
                                names.push(capitalize(interest.name))
                        }
                    }
                    const res = await apiClient.post('interests/update-likes', { likes: names })

                    if (res.data.data) {
                        likes = res.data.data.map((item) => ({ name: item.interest.name }))
                    }
                } catch (error) {
                    console.log({ error })
                }

                try {
                    let names = []
                    if (tags.dislike && tags.dislike.length > 0) {
                        names = tags.dislike.map((item) => capitalize(item))
                    }

                    if (currentUser && currentUser.interests) {
                        for (const interest of currentUser.interests) {
                            if (interest && interest.user_interests && interest.user_interests.interest_type === 'dislike' && !names.includes(capitalize(interest.name)))
                                names.push(capitalize(interest.name))
                        }
                    }
                    const res = await apiClient.post('interests/update-dislikes', { dislikes: names })

                    if (res.data.data) {
                        dislikes = res.data.data.map((item) => ({ name: item.interest.name }))
                    }
                } catch (error) {
                    console.log({ error })
                }

                if (tags.name) {
                    name = tags.name
                }
            }

            // console.log({ likes, dislikes, purposes, age, gender, name, videoIntro })

            NavigationService.reset('OnboardingReviewProfileScreen', { likes, dislikes, purposes, age, gender, name })
        } catch (error) {
            console.log({ error })
            NavigationService.reset('OnboardingReviewProfileScreen')
        }

    }

    const onSelect = (type) => {
        NavigationService.reset('OnboardingVideoScreen', { recording_type: type })
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, alignItems: 'center', justifyContent: 'center', gap: 24 }]}>
            <StatusBar translucent style="dark" />

            <ScrollView style={{ width: '100%', flex: 1, paddingTop: 32 }}>
                <View style={{ width: '100%', flex: 1, paddingHorizontal: 24, paddingVertical: 24, borderRadius: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 12 }}>
                        <View>
                            <CustomVideo
                                style={{ borderWidth: 2, borderColor: '#CDB8E2', justifyContent: 'flex-end', width: 80, height: 100, borderRadius: 10, overflow: 'hidden' }}
                                ref={videoIntroRef}
                                sources={[
                                    currentUser?.video_intro,
                                ]}
                                // subtitles={[
                                //     currentUser?.subtitle_intro,
                                // ]}
                                resizeMode={ResizeMode.COVER}
                                onPlaybackStatusUpdate={status => {
                                    setPlaying(status.isPlaying || status.isBuffering || status.shouldPlay);
                                }}
                            />
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                                <TouchableOpacity onPress={() => playVideo('intro')} style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={images.play_icon} style={{ width: 40, height: 40 }} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>1 / 5</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>Tell us a little about yourself</Text>
                        </View>

                        <TouchableOpacity onPress={() => onSelect('intro')} style={{
                            height: 26, borderRadius: 13, backgroundColor: currentUser?.video_intro ? '#333333' : '#D62219', paddingHorizontal: 16
                            , alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{currentUser?.video_intro ? 'Retake' : 'Record'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '100%', height: 2, backgroundColor: 'white', borderRadius: 1, marginVertical: 16 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 12 }}>
                        <View>
                            <CustomVideo
                                style={{ borderWidth: 2, borderColor: '#CDB8E2', justifyContent: 'flex-end', width: 80, height: 100, borderRadius: 10, overflow: 'hidden' }}
                                ref={videoWhyRef}
                                sources={[
                                    currentUser?.video_why,
                                ]}
                                // subtitles={[
                                //     currentUser?.subtitle_why,
                                // ]}
                                resizeMode={ResizeMode.COVER}
                                onPlaybackStatusUpdate={status => {
                                    setPlaying(status.isPlaying || status.isBuffering || status.shouldPlay);
                                }}
                            />
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                                <TouchableOpacity onPress={() => playVideo('why')} style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={images.play_icon} style={{ width: 40, height: 40 }} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>2 / 5</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>Why Kuky?</Text>
                        </View>

                        <TouchableOpacity onPress={() => onSelect('why')} style={{
                            height: 26, borderRadius: 13, backgroundColor: currentUser?.video_why ? '#333333' : '#D62219', paddingHorizontal: 16
                            , alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{currentUser?.video_why ? 'Retake' : 'Record'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '100%', height: 2, backgroundColor: 'white', borderRadius: 1, marginVertical: 16 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 12 }}>
                        <View>
                            <CustomVideo
                                style={{ borderWidth: 2, borderColor: '#CDB8E2', justifyContent: 'flex-end', width: 80, height: 100, borderRadius: 10, overflow: 'hidden' }}
                                ref={videoChallengeRef}
                                sources={[
                                    currentUser?.video_challenge,
                                ]}
                                // subtitles={[
                                //     currentUser?.subtitle_challenge,
                                // ]}
                                resizeMode={ResizeMode.COVER}
                                onPlaybackStatusUpdate={status => {
                                    setPlaying(status.isPlaying || status.isBuffering || status.shouldPlay);
                                }}
                            />

                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                                <TouchableOpacity onPress={() => playVideo('challenge')} style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={images.play_icon} style={{ width: 40, height: 40 }} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>3 / 5</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>Your Personal Challenge</Text>
                        </View>

                        <TouchableOpacity onPress={() => onSelect('challenge')} style={{
                            height: 26, borderRadius: 13, backgroundColor: currentUser?.video_challenge ? '#333333' : '#D62219', paddingHorizontal: 16
                            , alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{currentUser?.video_challenge ? 'Retake' : 'Record'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '100%', height: 2, backgroundColor: 'white', borderRadius: 1, marginVertical: 16 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 12 }}>
                        <View>
                            <CustomVideo
                                style={{ borderWidth: 2, borderColor: '#CDB8E2', justifyContent: 'flex-end', width: 80, height: 100, borderRadius: 10, overflow: 'hidden' }}
                                ref={videoPurposeRef}
                                sources={[
                                    currentUser?.video_purpose,
                                ]}
                                // subtitles={[
                                //     currentUser?.subtitle_purpose,
                                // ]}
                                resizeMode={ResizeMode.COVER}
                                onPlaybackStatusUpdate={status => {
                                    setPlaying(status.isPlaying || status.isBuffering || status.shouldPlay);
                                }}
                            />

                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                                <TouchableOpacity onPress={() => playVideo('purpose')} style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={images.play_icon} style={{ width: 40, height: 40 }} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>4 / 5</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>Goals & Aspirations</Text>
                        </View>

                        <TouchableOpacity onPress={() => onSelect('purpose')} style={{
                            height: 26, borderRadius: 13, backgroundColor: currentUser?.video_purpose ? '#333333' : '#D62219', paddingHorizontal: 16
                            , alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{currentUser?.video_purpose ? 'Retake' : 'Record'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '100%', height: 2, backgroundColor: 'white', borderRadius: 1, marginVertical: 16 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 12 }}>

                        <View>
                            <CustomVideo
                                style={{ borderWidth: 2, borderColor: '#CDB8E2', justifyContent: 'flex-end', width: 80, height: 100, borderRadius: 10, overflow: 'hidden' }}
                                ref={videoInterestsRef}
                                sources={[
                                    currentUser?.video_interests,
                                ]}
                                // subtitles={[
                                //     currentUser?.subtitle_interests,
                                // ]}
                                resizeMode={ResizeMode.COVER}
                                onPlaybackStatusUpdate={status => {
                                    setPlaying(status.isPlaying || status.isBuffering || status.shouldPlay);
                                }}
                            />

                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                                <TouchableOpacity onPress={() => playVideo('interests')} style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={images.play_icon} style={{ width: 40, height: 40 }} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>5 / 5</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 22, color: 'white' }}>Your Likes & Dislikes!</Text>
                        </View>

                        <TouchableOpacity onPress={() => onSelect('interests')} style={{
                            height: 26, borderRadius: 13, backgroundColor: currentUser?.video_interests ? '#333333' : '#D62219', paddingHorizontal: 16
                            , alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{currentUser?.video_interests ? 'Retake' : 'Record'}</Text>
                        </TouchableOpacity>
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
