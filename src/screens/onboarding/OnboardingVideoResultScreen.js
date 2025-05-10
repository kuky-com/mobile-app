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
import Toast from "react-native-toast-message";
import VideoManager from "../../components/VideoManager";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#725ED4",
    },
});


const OnboardingVideoResultScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const currentUser = useAtomValue(userAtom);
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef(null);
    const [purposeData, setPurposeData] = useState(null);
    const [interestsData, setInterestsData] = useState(null);
    const [loading, setLoading] = useState(false)

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

    const playVideo = async () => {
        if (videoRef && videoRef.current) {
            await VideoManager.stopCurrent();
            videoRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 })
            VideoManager.setCurrent(videoRef.current);
        }
    }

    const pauseVideo = () => {
        if (videoRef && videoRef.current) {
            videoRef.current.setStatusAsync({ shouldPlay: false })
        }
    }

    const processAudio = async () => {

        setLoading(false)
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

    const onContinue = () => {

        setLoading(true)

        console.log({ uri: currentUser.video_interests, uri2: currentUser.video_purpose })

        axios.post('https://ugfgxk4hudtff26aeled4u3h3u0buuhr.lambda-url.ap-southeast-1.on.aws', {
            // s3_uri: `s3://kuky-video/public/${currentUser.audio_purpose}`
            s3_uri: currentUser.video_purpose
        })
            .then((res) => {
                if (res && res.data && res.data.tags) {
                    setPurposeData(res.data)
                } else {
                    setPurposeData({})
                    // setLoading(false)
                    // Toast.show({ text1: 'Something went wrong while processing your video.', type: 'error' })
                }
            })
            .catch((error) => {
                console.log({ error })
                setPurposeData({})
                // setLoading(false)
                // Toast.show({ text1: 'Something went wrong while processing your video.', type: 'error' })
            })

        axios.post('https://ugfgxk4hudtff26aeled4u3h3u0buuhr.lambda-url.ap-southeast-1.on.aws', {
            // s3_uri: `s3://kuky-video/public/${currentUser.audio_interests}`
            s3_uri: currentUser.video_interests
        })
            .then((res) => {
                if (res && res.data && res.data.tags) {
                    setInterestsData(res.data)
                } else {
                    setInterestsData({})
                    // setLoading(false)
                    // Toast.show({ text1: 'Something went wrong while processing your video.', type: 'error' })
                }
            })
            .catch((error) => {
                console.log({ error })
                setInterestsData({})
                // setLoading(false)
                // Toast.show({ text1: 'Something went wrong while processing your video.', type: 'error' })
            })
    }

    const onSelect = () => {
        navigation.navigate('VideoListEditScreen')
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, alignItems: 'center', justifyContent: 'center', gap: 24 }]}>
            <StatusBar translucent style="dark" />
            <Text style={{ fontSize: 20, color: 'white', textAlign: 'center', fontWeight: '600', lineHeight: 30 }}>{`All Done!\nHere’s Your Video!`}</Text>

            <View style={{ borderWidth: 2, borderColor: '#CDB8E2', justifyContent: 'flex-end', width: Math.min(Dimensions.get('screen').width - 32, 600), height: Math.min(Dimensions.get('screen').width + 60, 750), borderRadius: 20, overflow: 'hidden' }}>
                <CustomVideo
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10 }}
                    ref={videoRef}
                    sources={[
                        currentUser?.video_intro,
                        currentUser?.video_purpose,
                    ]}
                    subtitles={[
                        currentUser?.subtitle_intro,
                        currentUser?.subtitle_purpose,
                    ]}
                    resizeMode={ResizeMode.COVER}
                    onPlaybackStatusUpdate={status => {
                        // console.log({ status, url: currentUser?.video_intro })
                        setPlaying(status.isPlaying || status.isBuffering || status.shouldPlay);
                    }}
                />
                {!playing && currentUser?.video_intro &&
                    <View style={{ alignItems: 'center', gap: 3, marginBottom: 16 }}>
                        {!playing &&
                            <TouchableOpacity onPress={playVideo} style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={images.play_icon} style={{ width: 80, height: 80 }} contentFit='contain' />
                            </TouchableOpacity>
                        }

                        <Text style={{ color: '#949494', fontSize: 10, fontWeight: 'bold' }}>Watch video</Text>
                    </View>
                }
                {playing &&
                    <TouchableOpacity onPress={pauseVideo} style={{ position: 'absolute', top: 20, left: 16, width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={images.pause_icon} style={{ width: 50, height: 50, borderRadius: 25, }} contentFit='contain' />
                    </TouchableOpacity>
                }
                {
                    !playing && currentUser?.user_note &&
                    <View style={{
                        position: 'absolute', top: 10, left: 16, right: 16, backgroundColor: '#7B65E8ee',
                        paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10,
                    }}>
                        <Text style={{ color: '#E8FF58', width: '100%', textAlign: 'center', fontSize: 13, fontWeight: '600' }}>{currentUser?.user_note}</Text>
                    </View>
                }
            </View>

            <View style={{ width: '100%', paddingHorizontal: 16, gap: 16 }}>
                <ButtonWithLoading
                    onPress={onContinue}
                    loading={loading}
                    text={'Submit & Continue'}
                />
                {/* <TouchableOpacity
                    onPress={onContinue}
                    style={{
                        width: Platform.isPad ? 600 : "100%",
                        alignSelf: "center",
                        height: 60,
                        borderRadius: 30,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#333333",
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>
                        {"Submit & Continue"}
                    </Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                    onPress={onSelect}
                    style={{
                        paddingHorizontal: 16,
                        alignSelf: "center",
                        height: 30,
                        borderRadius: 30,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
                        {"Edit a Section"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
};

export default OnboardingVideoResultScreen;
