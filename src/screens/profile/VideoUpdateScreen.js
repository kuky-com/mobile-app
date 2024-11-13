import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, Linking, Platform, StyleSheet, TextInput, TouchableOpacity, View, } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import Toast from 'react-native-toast-message'
import { CameraView, useCameraPermissions } from 'expo-camera'
import LottieView from 'lottie-react-native';
import { ResizeMode, Video } from 'expo-av'
import RangeSlider from '@/components/RangeSlider'
import * as FileSystem from 'expo-file-system'
import { FFmpegKit } from 'ffmpeg-kit-react-native'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import Slider from '@react-native-community/slider'
import apiClient from '@/utils/apiClient'
import { uploadData } from 'aws-amplify/storage'
import { useAtom } from 'jotai'
import { userAtom } from '@/actions/global'

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

const VideoUpdateScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const [videoUrl, setVideoUrl] = useState(null)
    const [loading, setLoading] = useState(true)
    const [permission, requestPermission] = useCameraPermissions();
    const [recording, setRecording] = useState(false)
    const cameraRef = useRef(null);
    const videoRef = useRef(null);
    const [videoDuration, setDuration] = useState(0)
    const [startPosition, setStartPosition] = useState(0)
    const [endPosition, setEndPosition] = useState(0)
    const [playing, setPlaying] = useState(false)
    const [currentUser, setUser] = useAtom(userAtom)

    const [timer, setTimer] = useState(0)

    const [processing, setProcessing] = useState(false)

    const onLoad = (data) => {
        setStartPosition(0)
        setDuration(Math.round(data.durationMillis / 1000))
        setEndPosition(Math.round(data.durationMillis / 1000))
    }

    const startRecording = async () => {
        if (cameraRef.current) {
            setRecording(true)
            try {
                setTimer(0)
                setTimeout(() => {
                    setTimer(1)
                }, 1000);

                const videoData = await cameraRef.current.recordAsync({ maxDuration: 30 })
                setVideoUrl(videoData)
                setRecording(false)

            } catch (error) {
                console.log({ errorRecording: error })
            }
        }
    }

    useEffect(() => {
        const updateTimer = async () => {
            if ((timer + 1) > 30) {
                await stopRecording()
                return
            }
            if (recording) {
                setTimeout(() => {
                    setTimer((old) => (timer + 1))
                }, 1000);
            }
        }

        updateTimer()
    }, [timer])

    const stopRecording = async () => {
        try {
            if (cameraRef.current && recording) {
                await cameraRef.current.stopRecording();
                setRecording(false);
            }
        } catch (error) {

        }
    }

    const onPlay = () => {
        try {
            if (videoRef && videoRef.current) {
                videoRef.current.setStatusAsync({ shouldPlay: true, positionMillis: startPosition * 1000 })
            }
        } catch (error) {

        }
    }

    const onPause = () => {
        try {
            if (videoRef && videoRef.current) {
                videoRef.current.setStatusAsync({ shouldPlay: false })
            }
        } catch (error) {

        }
    }

    const onConfirm = () => {
        if (videoUrl && videoUrl.uri) {
            handleTrim()
        }
    }

    const handleValueChange = useCallback((low, high) => {
        setStartPosition(Math.round(low));
        setEndPosition(Math.round(high));
    }, []);

    const clearVideo = () => {
        setVideoUrl(null)
        setPlaying(false)
        setTimer(0)
        setRecording(false)
        setProcessing(false)
    }

    const handleTrim = async () => {
        setProcessing(true)
        try {
            const outputUri = `${FileSystem.documentDirectory}video_trimmed.mp4`
            const command = `-y -i ${videoUrl.uri} -ss ${startPosition} -to ${endPosition} -preset slow -c:a copy -f mp4 ${outputUri}`;

            await FFmpegKit.execute(command)

            const response = await fetch(outputUri);

            const blob = await response.blob();
            const fileName = `video-${dayjs().unix()}.mp4`

            const result = await uploadData({
                path: `public/${fileName}`,
                data: blob,
                options: {
                    contentType: 'video/mp4',
                    accessLevel: 'public'
                }
            }).result
            console.log('Succeeded: ', result)

            apiClient.post('users/update', { video_intro: `https://kuky-video.s3.ap-southeast-1.amazonaws.com/public/${fileName}` })
                .then((res) => {
                    setLoading(false)
                    if (res && res.data && res.data.success) {
                        setUser(res.data.data)
                        navigation.goBack()
                    } else {
                        Toast.show({ text1: res.data.message, type: 'error' })
                    }
                })
                .catch((error) => {
                    setLoading(false)
                    console.log({ error })
                    Toast.show({ text1: error, type: 'error' })
                    setProcessing(false)
                })

        } catch (error) {
            Toast.show({ text1: 'Cannot process your video. Please try to retake!', type: 'error' })
            setProcessing(false)
        }
    }

    const retryPermission = async () => {
        try {
            const res = await requestPermission()
            if (!res.canAskAgain && !res.granted) {
                Linking.openSettings()
            }
            console.log({ res })
        } catch (error) {
            console.log({ error })
        }
    }

    const handleChangePlaybackStatus = (status) => {
        setPlaying(status.isPlaying)
        if (status.positionMillis > (endPosition * 1000)) {
            onPause()
        }
    }

    if (processing) {
        return (
            <View style={{ flex: 1, width: '100%' }}>
                <StatusBar translucent style='dark' />
                {videoUrl && <Video
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
                }

                <View style={{ ...StyleSheet.absoluteFill, backgroundColor: '#00000030' }} />
                <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: insets.top, paddingBottom: insets.bottom, alignItems: 'center' }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', gap: 16, paddingTop: 64 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', lineHeight: 30 }}>We are analyzing your video</Text>
                        <Text style={{ fontSize: 14, color: 'white' }}>This may take a few moments...</Text>
                    </View>
                    <Image source={images.processing} style={{ width: Dimensions.get('screen').width - 80, height: Dimensions.get('screen').width - 80 }} contentFit='cover' />
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ lineHeight: 28, fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>Please hold tight! Your video is being analyzed and will be ready shortly.</Text>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, width: '100%' }}>
            <StatusBar translucent style='dark' />
            {
                !videoUrl &&
                <CameraView onCameraReady={() => setLoading(false)} style={StyleSheet.absoluteFill} facing='front' ref={cameraRef} mode='video'>
                </CameraView>
            }

            <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ flex: 1, gap: 16, alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: '#e5e5e5', paddingTop: insets.top + 8, paddingBottom: 16 }}>
                    <View style={{ width: '100%', alignItems: 'flex-end' }}>
                        <Image source={images.logo_with_text} style={{ width: 120, height: 40, marginBottom: 32 }} contentFit='contain' />
                    </View>
                    {/* <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>{`Video 1`}</Text> */}
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>{`Tell us about yourself !`}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: 'black' }}>{`You have 30 seconds`}</Text>
                </View>
                <View style={{
                    width: '100%',
                    height: Dimensions.get('screen').height - 450,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row'
                }}>
                    <View style={{ flex: 1, backgroundColor: '#e5e5e5', height: '100%', }} />
                    <View style={{
                        width: Dimensions.get('screen').width - 64,
                        height: Dimensions.get('screen').height - 450,

                    }}>
                        <View style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute', top: 0, left: 0,
                            borderColor: '#e5e5e5',
                            borderWidth: 6
                        }} />
                        <View style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute', top: 0, left: 0,
                            borderColor: '#CDB8E2',
                            borderWidth: 6, borderRadius: 20
                        }} />
                        {
                            loading &&
                            <View style={{ flex: 1, gap: 24, alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={images.camera_icon} style={{ width: 100, height: 100 }} contentFit='contain' />
                                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>Loading</Text>
                                    <ActivityIndicator color='#0BFF27' size='small' />
                                </View>
                            </View>
                        }
                        {
                            recording &&
                            <View style={{ position: 'absolute', top: 8, right: 8, width: 80, height: 24, justifyContent: 'center', borderRadius: 14, alignItems: 'center', gap: 8, backgroundColor: '#333333', flexDirection: 'row' }}>
                                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#FD3730' }} />
                                <Text style={{ fontSize: 14, color: 'white', fontWeight: 'bold' }}>{`00:${timer.toString().padStart(2, '0')}`}</Text>
                            </View>
                        }
                        {videoUrl &&
                            <Video
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute', top: 0, left: 0,
                                    borderColor: '#CDB8E2',
                                    borderWidth: 6, borderRadius: 20
                                }}
                                ref={videoRef}
                                source={videoUrl}
                                resizeMode={ResizeMode.COVER}
                                onPlaybackStatusUpdate={handleChangePlaybackStatus}
                                onLoad={onLoad}
                                positionMillis={startPosition * 1000}
                            />
                        }
                        {videoUrl &&
                            <View style={{ flex: 1, paddingVertical: 12 }}>
                                <View></View>
                                <View style={{
                                    flex: 1, alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {!playing &&
                                        <TouchableOpacity onPress={onPlay} style={{ width: 65, height: 65 }}>
                                            <Image source={images.play_button} style={{ width: 65, height: 65 }} contentFit='contain' />
                                        </TouchableOpacity>
                                    }
                                    {playing &&
                                        <TouchableOpacity onPress={onPause} style={{ position: 'absolute', top: 0, left: 16, width: 40, height: 40, borderRadius: 15 }}>
                                            <View style={{ position: 'absolute', backgroundColor: '#CDB8E2', top: 8, left: 8, bottom: 8, right: 8 }} />
                                            <Image source={images.pause_icon} style={{ width: 40, height: 40, borderRadius: 15 }} contentFit='contain' />
                                        </TouchableOpacity>
                                    }
                                </View>
                                <View>
                                    <RangeSlider
                                        min={0}
                                        max={videoDuration}
                                        low={startPosition}
                                        high={endPosition}
                                        onValueChange={(value) => setStartTime(value)}
                                        onChangeValue={handleValueChange}
                                    />
                                    <View style={{ marginTop: 25, paddingHorizontal: 24, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ height: 22, borderRadius: 11, paddingHorizontal: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 11, color: 'black', fontWeight: '600' }}>{`00:${startPosition.toString().padStart(2, '0')}`}</Text>
                                        </View>
                                        <View style={{ height: 22, borderRadius: 11, paddingHorizontal: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 11, color: 'black', fontWeight: '600' }}>{`00:${endPosition.toString().padStart(2, '0')}`}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        }

                        {
                            recording &&
                            <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
                                <Slider
                                    style={{ width: '100%' }}
                                    minimumValue={0}
                                    maximumValue={30}
                                    step={1}
                                    thumbImage={images.video_thumb}
                                    maximumTrackTintColor='#333333'
                                    minimumTrackTintColor='#333333'
                                    value={timer}
                                />
                                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ height: 22, borderRadius: 11, paddingHorizontal: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 11, color: 'black', fontWeight: '600' }}>{`00:00`}</Text>
                                    </View>
                                    <View style={{ height: 22, borderRadius: 11, paddingHorizontal: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 11, color: 'black', fontWeight: '600' }}>{`00:30`}</Text>
                                    </View>
                                </View>
                            </View>
                        }
                        {/* <LottieView 
                                style={{width: Dimensions.get('screen').width, marginLeft: -30, height: Dimensions.get('screen').height - 400, marginTop: 20, zIndex: 10}}
                                autoPlay
                                source={require('../../assets/animations/processing.json')}
                                resizeMode='cover'
                            /> */}
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#e5e5e5', height: '100%' }} />
                </View>
                <View style={{ flex: 1, paddingTop: 24, paddingBottom: insets.bottom + 16, width: '100%', backgroundColor: '#e5e5e5', paddingHorizontal: 16, alignItems: 'center', gap: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: 'black' }}>Now, introduce yourself and tell us why you’re excited to connect with others on Kuky!</Text>
                    {!recording && !loading && !videoUrl &&
                        <TouchableOpacity onPress={startRecording} style={{ width: Platform.isPad ? 600 : '100%', alignSelf: 'center', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{'Start recording'}</Text>
                        </TouchableOpacity>
                    }
                    {recording && !videoUrl &&
                        <TouchableOpacity onPress={stopRecording} style={{ width: Platform.isPad ? 600 : '100%', alignSelf: 'center', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D11C16', }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{'Stop'}</Text>
                        </TouchableOpacity>
                    }
                    {videoUrl &&
                        <TouchableOpacity disabled={processing} onPress={onConfirm} style={{ flexDirection: 'row', gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D11C16', }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{'Confirm & Continue'}</Text>
                            {processing &&
                                <ActivityIndicator color='white' />
                            }
                        </TouchableOpacity>
                    }
                    <View style={{ height: 30, width: '100%', paddingBottom: insets.bottom + 10 }}>
                        {videoUrl &&
                            <TouchableOpacity onPress={clearVideo} style={{ width: 120, alignSelf: 'center', height: 30, borderRadius: 30, alignItems: 'center', justifyContent: 'center', }}>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>{'Retake'}</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
            {
                (permission && !permission.granted) &&
                <View style={[StyleSheet.absoluteFill, {
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000000aa'
                }]}>
                    <View style={{
                        backgroundColor: '#725ED4', width: '90%', maxWidth: 500, borderRadius: 20, alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 16, paddingHorizontal: 24,
                    }}>
                        <Image source={images.camera_icon} style={{ width: 42, height: 42 }} contentFit='contain' />
                        <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold', marginTop: 10 }}>Camera Access Needed</Text>
                        <Text style={{ lineHeight: 24, fontSize: 16, color: 'white', fontWeight: '400', marginTop: 16, textAlign: 'center' }}>{`To continue, Kuky needs access to your camera. \nThis is required for recording your video introduction.`}</Text>
                        <Text style={{ lineHeight: 21, fontSize: 14, color: 'white', fontWeight: '400', marginTop: 16, textAlign: 'center' }}>We use your camera to help you create a video that lets us find the best matches for you.</Text>
                        <ButtonWithLoading
                            text='Grant Camera Access'
                            style={{ marginTop: 40 }}
                            onPress={retryPermission}
                        />
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 15, paddingVertical: 8, marginTop: 8, }}>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: 'white' }}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
        </View>
    )
}

export default VideoUpdateScreen