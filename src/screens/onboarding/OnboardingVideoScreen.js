import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, Platform, StyleSheet, TextInput, TouchableOpacity, View, } from 'react-native'
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
import { getAuthenScreen } from '@/utils/utils'
import { CameraView, useCameraPermissions } from 'expo-camera'
import LottieView from 'lottie-react-native';
import { ResizeMode, Video } from 'expo-av'
import RangeSlider from '@/components/RangeSlider'
import * as FileSystem from 'expo-file-system'
import { FFmpegKit } from 'ffmpeg-kit-react-native'

const imageImage = `avatar${dayjs().unix()}.png`

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

const OnboardingVideoScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const [image, setImage] = useState(null)
    const reference = storage().ref(imageImage)
    const [videoUrl, setVideoUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const [currentUser, setUser] = useAtom(userAtom)
    const [permission, requestPermission] = useCameraPermissions();
    const [recording, setRecording] = useState(false)
    const cameraRef = useRef(null);
    const videoRef = useRef(null);
    const [videoDuration, setDuration] = useState(0)
    const [startPosition, setStartPosition] = useState(0)
    const [endPosition, setEndPosition] = useState(0)
    const [playing, setPlaying] = useState(false)

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

                // timerRef.current = setInterval(async () => {
                //     if ((timer + 1) > 30 || !recording) {
                //         if (timerRef && timerRef.current) {
                //             clearInterval(timerRef.current)
                //             timerRef.current = null
                //         }
                //         await stopRecording()
                //         return
                //     }
                //     console.log({ timer })
                //     setTimer((old) => (old + 1))
                // }, 1000);
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
        if (videoRef && videoRef.current) {
            videoRef.current.setStatusAsync({ shouldPlay: true, positionMillis: startPosition * 1000 })
        }
    }

    const onPause = () => {
        if (videoRef && videoRef.current) {
            videoRef.current.setStatusAsync({ shouldPlay: false })
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
            const command = `-y -i ${videoUrl.uri} -ss ${startPosition} -to ${endPosition} -c copy ${outputUri}`;

            const result = await FFmpegKit.execute(command)
            setProcessing(false)
            NavigationService.push('VideoProcessingScreen', { videoUrl: outputUri })
        } catch (error) {
            Toast.show({ text1: 'Cannot process your video. Please try to retake!', type: 'error' })
            setProcessing(false)
        }
    }

    return (
        <View style={{ flex: 1, width: '100%' }}>
            <StatusBar translucent style='dark' />
            {
                !videoUrl &&
                <CameraView style={StyleSheet.absoluteFill} facing='front' ref={cameraRef} mode='video'>
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
                                onPlaybackStatusUpdate={status => setPlaying(status.isPlaying)}
                                onLoad={onLoad}
                                positionMillis={startPosition * 1000}
                            />
                        }
                        {videoUrl &&
                            <View style={{ flex: 1, paddingVertical: 16 }}>
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
                                        <TouchableOpacity onPress={onPause} style={{ position: 'absolute', top: 0, left: 16, width: 30, height: 30, borderRadius: 15 }}>
                                            <Image source={images.pause_icon} style={{ width: 30, height: 30, borderRadius: 15 }} contentFit='contain' />
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
                                    <View style={{ marginTop: 20, paddingHorizontal: 24, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ height: 16, borderRadius: 8, paddingHorizontal: 5, backgroundColor: 'white', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 11, color: 'black', fontWeight: '600' }}>{`00:${startPosition.toString().padStart(2, '0')}`}</Text>
                                        </View>
                                        <View style={{ height: 16, borderRadius: 8, paddingHorizontal: 5, backgroundColor: 'white', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 11, color: 'black', fontWeight: '600' }}>{`00:${endPosition.toString().padStart(2, '0')}`}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        }
                        {/* <LottieView 
                                style={{width: 300, height: 400}}
                                autoPlay
                                source={require('../../assets/animations/recording.json')}
                            /> */}
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#e5e5e5', height: '100%' }} />
                </View>
                <View style={{ flex: 1, paddingTop: 24, paddingBottom: insets.bottom + 16, width: '100%', backgroundColor: '#e5e5e5', paddingHorizontal: 16, alignItems: 'center', gap: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: 'black' }}>Now, introduce yourself and tell us why you’re excited to connect with others on Kuky!</Text>
                    {!recording && !videoUrl &&
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
                loading && <LoadingView />
            }
        </View>
    )
}

export default OnboardingVideoScreen