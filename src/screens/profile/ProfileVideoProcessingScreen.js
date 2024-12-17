import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View, } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import apiClient from '@/utils/apiClient'
import { capitalize, getAuthenScreen } from '@/utils/utils'
import { ResizeMode, Video } from 'expo-av'
import axios from 'axios'
import { uploadData, getUrl, } from 'aws-amplify/storage'
import * as FileSystem from 'expo-file-system'
import { FFmpegKit, FFprobeKit } from 'ffmpeg-kit-react-native'
import CustomVideo from '@/components/CustomVideo'
import { getVideoResizeDimensions } from '../../utils/utils'
import { useAtomValue } from 'jotai'
import { userAtom } from '../../actions/global'
import { useAlertWithIcon } from '../../components/AlertIconProvider'

const ProfileVideoProcessingScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const { videoUrl, startPosition, endPosition } = route.params
    const videoRef = useRef(null);
    const [videoIntro, setVideoIntro] = useState(null)
    const showAlert = useAlertWithIcon()
    const currentUser = useAtomValue(userAtom)
    const [processingData, setProcessingData] = useState(null)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        uploadFileToAws()
    }, [videoUrl])

    useEffect(() => {
        if (videoIntro && processingData) {
            processAudio()
        }
    }, [videoIntro, processingData])

    const uploadFileToAws = async () => {
        try {
            const outputAudioUri = `${FileSystem.documentDirectory}audio.m4a`
            const commandAudio = `-y -i ${videoUrl.uri} -ss ${startPosition} -to ${endPosition} -vn -acodec aac ${outputAudioUri}`;

            await FFmpegKit.execute(commandAudio)

            const responseAudio = await fetch(outputAudioUri);

            const blobAudio = await responseAudio.blob();
            const audioFileName = `audio-${process.env.EXPO_PUBLIC_NODE_ENV}-${currentUser?.id}-${dayjs().unix()}.m4a`

            await uploadData({
                path: `public/${audioFileName}`,
                data: blobAudio,
                options: {
                    contentType: 'audio/m4a',
                    accessLevel: 'public'
                }
            }).result

            axios.post('https://ugfgxk4hudtff26aeled4u3h3u0buuhr.lambda-url.ap-southeast-1.on.aws', {
                s3_uri: `s3://kuky-video/public/${audioFileName}`
            })
                .then((res) => {
                    if (res && res.data && res.data.tags) {
                        setProcessingData(res.data)
                    }
                })
                .catch(() => {
                    showAlert(images.video_error, 'Oops!', 'Something went wrong while processing your video.', 'Please try again recording your video', [
                        { text: 'Record Again', onPress: () => navigation.goBack() }
                    ])
                })


            const { width, height } = await getVideoResizeDimensions(videoUrl.uri)

            const outputVideoUri = `${FileSystem.documentDirectory}video_trimmed.mp4`
            const commandVideo = `-y -i ${videoUrl.uri} -ss ${startPosition} -to ${endPosition} -vf ${width > height ? `scale=${height}:${width}` : `scale=${width}:${height}`} -crf 26 -preset veryfast -f mp4 ${outputVideoUri}`;

            await FFmpegKit.executeAsync(commandVideo, async (session) => {
                const returnCode = await session.getReturnCode();
                if (returnCode.isValueSuccess()) {
                    console.log('Conversion successful');
                    setProgress(95)

                    const responseVideo = await fetch(outputVideoUri);

                    const blobVideo = await responseVideo.blob();
                    const videoFileName = `video-${process.env.EXPO_PUBLIC_NODE_ENV}-${currentUser?.id}-${dayjs().unix()}.mp4`

                    await uploadData({
                        path: `public/${videoFileName}`,
                        data: blobVideo,
                        options: {
                            contentType: 'video/mp4',
                            accessLevel: 'public'
                        }
                    }).result

                    setVideoIntro({
                        https: `https://kuky-video.s3.ap-southeast-1.amazonaws.com/public/${videoFileName}`,
                        s3: `s3://kuky-video/public/${videoFileName}`
                    })
                } else {
                    console.log('Conversion failed', returnCode);
                }
            },
                (log) => {
                    const regex = /time=(\d{2}:\d{2}:\d{2}.\d{2})/;
                    const match = log.getMessage().match(regex);

                    if (match) {
                        const currentTime = match[1]; // Extracted time in HH:MM:SS.SS
                        calculateProgress(currentTime);
                    }
                }, (statistics) => {

                })


        } catch (error) {
            console.log({ error })

            showAlert(images.video_error, 'Oops!', 'Something went wrong while processing your video.', 'Please try again recording your video', [
                { text: 'Record Again', onPress: () => navigation.goBack() }
            ])
        }
    }

    const calculateProgress = (currentTime) => {
        const timeParts = currentTime.split(':');
        const seconds =
            parseFloat(timeParts[0]) * 3600 +
            parseFloat(timeParts[1]) * 60 +
            parseFloat(timeParts[2]);

        const totalDuration = (endPosition - startPosition)

        const progressPercent = Math.min((seconds / totalDuration) * 100, 100);
        setProgress(Math.round(progressPercent * 0.95));
    }

    const processAudio = async () => {
        try {
            if (!videoIntro || !videoIntro.s3 || !videoIntro.https || !processingData) return

            let likes = []
            let dislikes = []
            let purposes = []

            if (processingData && processingData.tags) {
                const tags = processingData.tags

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
            }

            // console.log({ likes, dislikes, purposes, videoIntro })

            NavigationService.replace('ProfileVideoReviewScreen', { likes, dislikes, purposes, videoIntro: videoIntro })
        } catch (error) {
            console.log({ error })
            showAlert(images.video_error, 'Oops!', 'Something went wrong while processing your video.', 'Please try again recording your video', [
                { text: 'Record Again', onPress: () => navigation.goBack() }
            ])
        }

    }

    return (
        <View style={{ flex: 1, width: '100%' }}>
            <StatusBar translucent style='dark' />
            <Video
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute', top: 0, left: 0
                }}
                ref={videoRef}
                source={videoUrl}
                resizeMode={ResizeMode.COVER}
                shouldPlay={true}
                isLooping={true}
                isMuted={true}
                positionMillis={startPosition * 1000}
            />

            <View style={{ ...StyleSheet.absoluteFill, backgroundColor: '#00000030' }} />
            <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: insets.top, paddingBottom: insets.bottom, alignItems: 'center' }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', gap: 16, paddingTop: 64 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', lineHeight: 30 }}>We are analyzing your video</Text>
                    <Text style={{ fontSize: 14, color: 'white' }}>This may take a few moments...</Text>
                </View>
                <Image source={images.processing} style={{ width: Dimensions.get('screen').width - 80, height: Dimensions.get('screen').width - 80 }} contentFit='cover' />
                <View style={{ backgroundColor: '#E74C3C', height: 40, borderRadius: 20, width: 90, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'black', fontSize: 18, fontWeight: "400" }}>{`${progress}%`}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ lineHeight: 28, fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>Please hold tight! Your video is being analyzed and will be ready shortly.</Text>
                </View>
            </View>
        </View>
    )
}

export default ProfileVideoProcessingScreen