import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, Platform, StyleSheet, TextInput, TouchableOpacity, View, } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import storage from '@react-native-firebase/storage'
import LoadingView from '@/components/LoadingView'
import apiClient from '@/utils/apiClient'
import Toast from 'react-native-toast-message'
import { useAtom, useSetAtom } from 'jotai'
import { userAtom } from '@/actions/global'
import { capitalize, getAuthenScreen } from '@/utils/utils'
import { CameraView, useCameraPermissions } from 'expo-camera'
import LottieView from 'lottie-react-native';
import { ResizeMode, Video } from 'expo-av'
import AWSHelper from '@/utils/AWSHelper'
import axios from 'axios'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 24
    },
    imageContainer: {
        backgroundColor: 'transparent',
        overflow: 'hidden', borderRadius: 20, alignItems: 'center',
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

const VideoProcessingScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const { videoUrl } = route.params
    const videoRef = useRef(null);
    const [videoIntro, setVideoIntro] = useState('https://kuky-video-transcribe.s3.ap-southeast-1.amazonaws.com/Movie+on+24-6-2024.mov')

    const uploadFileToAws = async () => {
        try {
            const res = await AWSHelper.uploadFile(videoUrl, `video-${dayjs().unix()}.mp4`, 'video/mp4')
            console.log({ res })
        } catch (error) {

        }
        processAudio()
    }

    const processAudio = async () => {
        try {
            if (!videoIntro) return

            const response = await axios.post('https://ugfgxk4hudtff26aeled4u3h3u0buuhr.lambda-url.ap-southeast-1.on.aws', {
                s3_uri: 's3://kuky-video-transcribe/David Studentaudio.m4a'
            })

            let likes = []
            let dislikes = []
            let purposes = []
            let age = null
            let gender = null
            let name = null

            if (response && response.data && response.data.tags) {
                const tags = response.data.tags

                try {
                    if (tags.journey && tags.journey.length > 0) {
                        const names = tags.journey.map((item) => capitalize(item))
                        const res = await apiClient.post('interests/update-likes', { purposes: names })

                        if (res.data.data) {
                            purposes = res.data.data.map((item) => ({ name: item.purpose.name }))
                        }
                    }
                } catch (error) {
                    console.log({ error })
                }

                try {
                    if (tags.like && tags.like.length > 0) {
                        const names = tags.like.map((item) => capitalize(item))
                        const res = await apiClient.post('interests/update-likes', { likes: names })

                        if (res.data.data) {
                            likes = res.data.data.map((item) => ({ name: item.interest.name }))
                        }
                    }
                } catch (error) {
                    console.log({ error })
                }

                try {
                    if (tags.dislike && tags.dislike.length > 0) {
                        const names = tags.dislike.map((item) => capitalize(item))
                        const res = await apiClient.post('interests/update-dislikes', { dislikes: names })

                        if (res.data.data) {
                            dislikes = res.data.data.map((item) => ({ name: item.interest.name }))
                        }
                    }
                } catch (error) {
                    console.log({ error })
                }

                if (tags.name) {
                    name = tags.name
                }
            }

            NavigationService.reset('ReviewProfileScreen', { likes, dislikes, purposes, age, gender, name, video_intro: videoIntro })
        } catch (error) {
            console.log({ error })
        }

    }

    useEffect(() => {
        uploadFileToAws()
    }, [])

    return (
        <View style={{ flex: 1, width: '100%' }}>
            <StatusBar translucent style='dark' />
            <Video
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute', top: 0, left: 0,
                }}
                ref={videoRef}
                source={{ uri: videoUrl }}
                resizeMode={ResizeMode.COVER}
                shouldPlay={true}
                isLooping={true}
                isMuted={true}
            />

            <View style={{ ...StyleSheet.absoluteFill, backgroundColor: '#00000030' }} />
            <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: insets.top, paddingBottom: insets.bottom, alignItems: 'center' }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', gap: 16, paddingTop: 64 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', lineHeight: 30 }}>We are analyzing your video</Text>
                    <Text style={{ fontSize: 14, color: 'white' }}>This may take a few moments...</Text>
                </View>
                {/* <LottieView
                source={require('../../assets/animations/circle.lottie')}
                style={{ width: Dimensions.get('screen').width - 80, height: Dimensions.get('screen').width - 80 }}
                autoPlay
                loop
                resizeMode='cover'
            /> */}
                <Image source={images.processing} style={{ width: Dimensions.get('screen').width - 80, height: Dimensions.get('screen').width - 80 }} contentFit='cover' />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ lineHeight: 28, fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>Please hold tight! Your video is being analyzed and will be ready shortly.</Text>
                </View>
            </View>
        </View>
    )
}

export default VideoProcessingScreen