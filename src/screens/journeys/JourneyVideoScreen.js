import Text from "@/components/Text";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    DeviceEventEmitter,
    Dimensions,
    Linking,
    Platform,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import dayjs from "dayjs";
import Toast from "react-native-toast-message";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import LottieView from "lottie-react-native";
import { Audio, ResizeMode, Video } from "expo-av";
import RangeSlider from "@/components/RangeSlider";
import * as FileSystem from "expo-file-system";
import { FFmpegKit } from "ffmpeg-kit-react-native";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import Slider from "@react-native-community/slider";
import CustomVideo from "@/components/CustomVideo";
import { useAlertWithIcon } from "../../components/AlertIconProvider";
import * as ImagePicker from 'expo-image-picker'
import { useAlert } from "../../components/AlertProvider";
import analytics from '@react-native-firebase/analytics'
import axios from "axios";
import { useAtom, useAtomValue } from "jotai";
import { userAtom } from "../../actions/global";
import colors from "../../utils/colors";
import SubtitleDisplay from "../../components/SubtitleDisplay";
import { set } from "date-fns";
import apiClient, { NODE_ENV } from "../../utils/apiClient";
import { uploadData, getUrl, } from 'aws-amplify/storage'
import { getAuthenScreen, getVideoResizeDimensions } from "../../utils/utils";
import Voice from '@react-native-voice/voice'
import { PERMISSIONS, request } from "react-native-permissions";
import Purchases from "react-native-purchases";
import constants from "../../utils/constants";
import CustomSwitch from "../../components/CustomSwitch";
import VideoManager from "../../components/VideoManager";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 24,
    },
    imageContainer: {
        backgroundColor: "transparent",
        overflow: "hidden",
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        width: (Platform.isPad ? 600 : Dimensions.get("screen").width) - 48,
        height: (Platform.isPad ? 600 : Dimensions.get("screen").width) - 48,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: "#000000",
    },
    closeButton: {
        width: 30,
        height: 30,
        backgroundColor: "#333333",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        position: "absolute",
        top: 8,
        right: 8,
    },
});

const MAX_DURATION = 30

const JourneyVideoScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { fromOnboarding } = route && route.params ? route.params : {}
    const [currentUser, setUser] = useAtom(userAtom)
    const [videoUrl, setVideoUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permission, requestPermission] = useCameraPermissions();
    const [audioPermission, requestAudioPermission] = useMicrophonePermissions();
    const [recording, setRecording] = useState(false);
    const cameraRef = useRef(null);
    const videoRef = useRef(null);
    const [videoDuration, setDuration] = useState(0);
    const [startPosition, setStartPosition] = useState(0);
    const [endPosition, setEndPosition] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [askPermissionOnce, setAskPermissionOnce] = useState(false)
    const [isFlipped, setIsFlipped] = useState(true)

    const showAlert = useAlertWithIcon()
    const showNormalAlert = useAlert()

    const [timer, setTimer] = useState(0);

    const [processing, setProcessing] = useState(false);

    const [transcription, setTranscription] = useState("");
    const [displayedBlock, setDisplayedBlock] = useState('');
    const [highlightWords, setHighlightWords] = useState([]);
    const [isBlur, setBlur] = useState(false)
    const [canBlur, setCanBlur] = useState(false)

    let latestRequest = null;

    // const [question, setQuestion] = useState(null)

    const loadSubscriptionInfo = async () => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            // console.log({ customerInfo: JSON.stringify(customerInfo) })

            if (
                customerInfo &&
                customerInfo.entitlements &&
                customerInfo.entitlements.active &&
                customerInfo.entitlements.active["blur_face"]
            ) {
                setCanBlur(true)
                setBlur(true)
            }
        } catch (error) {
            console.log({ error });
        }
    };

    useEffect(() => {
        loadSubscriptionInfo()

        const listener = DeviceEventEmitter.addListener(constants.REFRESH_PROFILE, loadSubscriptionInfo)

        return () => {
            listener.remove()
        }
    }, [])

    // const getQuestion = async () => {
    //     try {
    //         const res = await apiClient.get(`journeys/jpf-video-question?journey_id=${currentUser?.journey_id}`)

    //         if (res && res.data && res.data.success) {
    //             setQuestion(res.data.data)
    //         }
    //     } catch (error) {
    //         console.log({ error })
    //     }
    // }

    // useEffect(() => {
    //     getQuestion()
    // }, [])

    const setupTranscript = async () => {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        })
    }

    const startTranscript = async () => {
        try {
            await Voice.start('en-US')
        } catch (error) {
            console.log({ error })
        }
    }

    useEffect(() => {
        Voice.onSpeechPartialResults = (e) => {
            console.log({ e })
            processTranscript(e.value[0])
        }

        return () => {
            Voice.destroy().then(Voice.removeAllListeners).catch(e => {
                console.log("UNABLE TO DESTROY");
                console.log(e.error);
            });
        }
    }, [])

    useEffect(() => {
        if (permission &&
            permission.granted &&
            audioPermission &&
            audioPermission.granted) {
            if (Platform.OS === 'ios') {
                try {
                    request(PERMISSIONS.IOS.SPEECH_RECOGNITION).then((status) => {
                        console.log({ status })
                    })
                        .catch((error) => {
                            console.log({ error })
                        })
                } catch (error) {
                    console.log({ error })
                }
            }
        }
    }, [permission, audioPermission])

    const stopTranscript = async () => {
        try {
            await Voice.stop()

            Voice.destroy().then(Voice.removeAllListeners)
        }
        catch (error) {
            console.log({ error })
        }
    }

    useEffect(() => {
        setupTranscript()
    }, [])

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'JourneyVideoScreen',
            screen_class: 'JourneyVideoScreen'
        })
    }, [])

    const processTranscript = async (text) => {
        setTranscription((prev) => (prev + ' ' + text).trim());
        setDisplayedBlock(text);
    }

    useEffect(() => {
        if (transcription && transcription.length > 0)
            updateSubtitles(transcription)
    }, [transcription])

    const updateSubtitles = async (spokenText) => {

        const words = await analyzeText(spokenText);
        if (words && words.length > 0) {
            setHighlightWords(words)
        }
    };


    const analyzeText = async (text) => {
        if (latestRequest) {
            latestRequest.abort();
        }

        const controller = new AbortController();
        latestRequest = controller;

        try {
            const response = await axios.post("https://api.openai.com/v1/chat/completions", {
                model: "gpt-4o",
                messages: [{
                    role: "system", content: `Extract the following profiling information from the text: likes/interests, dislikes, currrent life journey and the purpose of the connection they are making.
Be concise, preferably one word for each like/dislike/journey/purpose, but do not simplify to an extreme level.
Some example of purposes could be: "grief processing", "traveling", "mutual support", so more words are allowed if needed.

Response should be array of all purpose, like, dislike. For example [ 'purpose 1', 'purpose 2', 'like1', 'like2', 'dislike1', 'dislike2'].

#Required:
- The words in response array must be in the input text
- Return valid json array of string format with no json text or json\`\`\`
- Do not return empty string as an object inside arrray`
                },
                {
                    role: "user", content: text
                }
                ],
                max_tokens: 50
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                signal: controller.signal
            });

            console.log({ respones: response.data.choices[0].message.content.trim() })
            return JSON.parse(response.data.choices[0].message.content.trim());
        } catch (error) {
            console.log({ error });
            return [];
        }
    };

    const onLoad = (data) => {
        setStartPosition(0);
        setDuration(Math.round(data.durationMillis / 1000));
        setEndPosition(Math.round(data.durationMillis / 1000));
    };

    const startRecording = async () => {
        analytics().logEvent('video_recording_button')
        setIsFlipped(true)

        if (cameraRef.current) {
            setRecording(true);
            try {
                setTimer(0);
                setTimeout(() => {
                    setTimer(1);
                }, 1000);

                try {
                    startTranscript()
                } catch (error) {
                    console.log({ error });
                }

                setTranscription('')

                const videoData = await cameraRef.current.recordAsync({ maxDuration: MAX_DURATION });
                console.log({ videoData });
                setVideoUrl(videoData);
                setRecording(false);
            } catch (error) {
                console.log({ errorRecording: error });
            }
        }
    };

    const selectFromLibrary = async () => {
        analytics().logEvent('video_uploading_button')

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: true,
            quality: 1,
            duration: 15000
        })

        console.log(result);

        if (!result.canceled) {
            if (result.assets[0].width > result.assets[0].height) {
                setTimeout(() => {
                    showNormalAlert('Error', 'Oops! Please upload a portrait video for the best experience.')
                }, 1000);

                return
            }
            setVideoUrl(result.assets[0])
            setIsFlipped(false)
        }
    }

    useEffect(() => {
        const updateTimer = async () => {
            if (timer + 1 > MAX_DURATION) {
                await stopRecording();
                return;
            }
            if (recording) {
                setTimeout(() => {
                    setTimer((old) => timer + 1);
                }, 1000);
            }
        };

        updateTimer();
    }, [timer]);

    const stopRecording = async () => {
        try {
            if (cameraRef.current && recording) {
                stopTranscript()
                setTranscription('')

                await cameraRef.current.stopRecording();
                setRecording(false);
            }
        } catch (error) {
            console.log({ error })
        }
    };

    const onPlay = async () => {
        try {
            if (videoRef && videoRef.current) {
                await VideoManager.stopCurrent();
                videoRef.current.setStatusAsync({ shouldPlay: true, positionMillis: startPosition * 1000 })
                VideoManager.setCurrent(videoRef.current);
            }
        } catch (error) { }
    };

    const onPause = () => {
        try {
            if (videoRef && videoRef.current) {
                videoRef.current.setStatusAsync({ shouldPlay: false });
            }
        } catch (error) { }
    };

    const onConfirm = () => {
        if (videoUrl && videoUrl.uri) {
            handleTrim();
        }
    };

    const handleValueChange = useCallback((low, high) => {
        setStartPosition(Math.round(low));
        setEndPosition(Math.round(high));
    }, []);

    const clearVideo = () => {
        setDisplayedBlock('')
        setTranscription('')
        setVideoUrl(null);
        setPlaying(false);
        setTimer(0);
        setRecording(false);
        setProcessing(false);
        setHighlightWords([])
    };

    const handleTrim = async () => {
        if ((endPosition - startPosition) < 10) {
            showAlert(images.video_error, 'Too Short', 'Your video duration is too short.', 'Please record video at least 10 seconds', [
                { text: "Record again", onPress: () => clearVideo() }
            ])
            return
        }
        if ((endPosition - startPosition) > MAX_DURATION) {
            showAlert(images.video_error, 'Too Long', 'Your video duration is too long.', `Please record video with maximum ${MAX_DURATION} seconds`, [
                { text: "Record again", onPress: () => clearVideo() }
            ])
            return
        }

        setProcessing(true);
        try {
            uploadFileToAws()
            // setProcessing(false);
            // NavigationService.reset("OnboardingVideoProcessingScreen", {
            //   videoUrl: videoUrl,
            //   startPosition,
            //   endPosition,
            // });
            // setTimeout(() => {
            //   clearVideo();
            // }, 1000);
        } catch (error) {
            Toast.show({ text1: "Cannot process your video. Please try to retake!", type: "error" });
            setProcessing(false);
        }
    };

    const showError = () => {
        showAlert(images.video_error, 'Oops!', 'Something went wrong while processing your video.', 'Please try again recording your video', [
            {
                text: 'Record Again', onPress: () => {
                    clearVideo()
                }
            }
        ], [
            {
                text: 'Skip Video Uploading', onPress: () => {
                    if (fromOnboarding || !currentUser?.journey_id) {
                        NavigationService.reset('MatchingInfoUpdateScreen', { fromOnboarding: true })
                    } else {
                        NavigationService.reset('Dashboard')
                    }
                }
            }
        ])
    }

    const updateProfile = (video, audio, subtitle, transcript) => {
        apiClient.post('users/update', {
            video_purpose: video,
            audio_purpose: audio,
            is_video_purpose_blur: isBlur,
            subtitle_intro: subtitle,
            video_intro_transcript: transcript
        })
            .then((res) => {
                setProcessing(false)
                if (res && res.data && res.data.success) {
                    setUser(res.data.data)
                    console.log({ user: res.data.data })

                    if (isBlur) {
                        setTimeout(() => {
                            DeviceEventEmitter.emit(constants.REFRESH_PROFILE);
                        }, 60000);
                    }

                    NavigationService.reset('JourneyMatchingScreen')

                } else {
                    Toast.show({ text1: res.data.message, type: 'error' })
                }
            })
            .catch((error) => {
                console.log({ error })
                setProcessing(false)
                Toast.show({ text1: error, type: 'error' })
            })
    }


    const uploadFileToAws = async () => {
        try {
            const outputAudioUri = `${FileSystem.documentDirectory}audio.m4a`
            const commandAudio = `-y -i ${videoUrl.uri} -ss ${startPosition} -to ${endPosition} -vn -acodec aac ${outputAudioUri}`;

            await FFmpegKit.execute(commandAudio)

            const responseAudio = await fetch(outputAudioUri);

            const blobAudio = await responseAudio.blob();
            const audioFileName = `audio-${NODE_ENV}-${currentUser?.id}-${dayjs().unix()}.m4a`

            await uploadData({
                path: `public/${audioFileName}`,
                data: blobAudio,
                options: {
                    contentType: 'audio/m4a',
                    accessLevel: 'public'
                }
            }).result

            const outputVideoUri = `${FileSystem.documentDirectory}video_trimmed.mp4`
            const commandVideo = `-y -i ${videoUrl.uri} -ss ${startPosition} -to ${endPosition} -vf scale=-2:720 -pix_fmt yuv420p -c:v libx264 -preset veryfast -crf 23 -b:v 800k -maxrate 850k -bufsize 1700k ${isFlipped ? '-vf hflip' : ''} -c:a aac -b:a 256k -ac 2 -ar 48000 -movflags +faststart -f mp4 ${outputVideoUri}`;

            await FFmpegKit.executeAsync(commandVideo, async (session) => {
                const returnCode = await session.getReturnCode();
                if (returnCode.isValueSuccess()) {
                    console.log('Conversion successful');

                    const responseVideo = await fetch(outputVideoUri);

                    const blobVideo = await responseVideo.blob();
                    const videoFileName = `video-${NODE_ENV}-${currentUser?.id}-${dayjs().unix()}.mp4`

                    await uploadData({
                        path: `public/${videoFileName}`,
                        data: blobVideo,
                        options: {
                            contentType: 'video/mp4',
                            accessLevel: 'public'
                        }
                    }).result

                    // setVideoIntro({
                    //   https: `https://kuky-video.s3.ap-southeast-1.amazonaws.com/public/${videoFileName}`,
                    //   audio: `https://kuky-video.s3.ap-southeast-1.amazonaws.com/public/${audioFileName}`
                    // })
                    let transcriptText = null
                    let subtitleUrl = null

                    try {
                        const response = await axios.post('https://6sx3m5nsmex2xyify3lb3x7s440xkxud.lambda-url.ap-southeast-1.on.aws', {
                            audio_uri: `https://kuky-video.s3.ap-southeast-1.amazonaws.com/public/${audioFileName}`
                        })

                        if (response && response.data && response.data.s3_url) {
                            transcriptText = response.data.transcript_text
                            subtitleUrl = response.data.s3_url
                        }
                    } catch (error) {
                        console.log({ error })
                    }

                    updateProfile(`https://kuky-video.s3.ap-southeast-1.amazonaws.com/public/${videoFileName}`,
                        `https://kuky-video.s3.ap-southeast-1.amazonaws.com/public/${audioFileName}`,
                        subtitleUrl,
                        transcriptText)


                } else {
                    console.log('Conversion failed', returnCode);
                    setProcessing(false);
                }
            },
                (log) => {
                    const regex = /time=(\d{2}:\d{2}:\d{2}.\d{2})/;
                    const match = log.getMessage().match(regex);

                    if (match) {
                        const currentTime = match[1];
                        // calculateProgress(currentTime);
                    }
                }, (statistics) => {

                })


        } catch (error) {
            console.log({ error })
            setProcessing(false);
            showError()
        }
    }

    const retryPermission = async (isContinue) => {
        try {
            const res = await requestPermission();
            console.log({ res })

            if (!res.canAskAgain && !res.granted && askPermissionOnce) {
                Alert.alert(
                    'Permission Required',
                    'Please enable camera permission from settings',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]
                );
            }

            const audioRes = await requestAudioPermission();
            if (!audioRes.canAskAgain && !audioRes.granted && askPermissionOnce) {
                Alert.alert(
                    'Permission Required',
                    'Please enable microphone permission from settings',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]
                );
            }

            setAskPermissionOnce(true)

            if (res.granted && videoRef && videoRef.current) {
                videoRef.current.resumePreview();
            }
            console.log({ res });
        } catch (error) {
            console.log({ error });
        }
    };

    const handleChangePlaybackStatus = (status) => {
        setPlaying(status.isPlaying);
        if (status.positionMillis > endPosition * 1000) {
            onPause();
        }
    };


    const onSkip = () => {
        if (fromOnboarding || !currentUser?.journey_id) {
            NavigationService.reset('MatchingInfoUpdateScreen', { fromOnboarding: true })
        } else {
            NavigationService.reset('Dashboard')
        }
    }

    const onSetBlur = (value) => {
        if (value) {
            if (canBlur) {
                setBlur(true)
            } else {
                navigation.push('BlurVideoScreen')
            }

        } else {
            setBlur(false)
        }
    }

    return (
        <View style={{ flex: 1, width: "100%" }}>
            {!videoUrl &&
                permission &&
                permission.granted &&
                audioPermission &&
                audioPermission.granted && (
                    <CameraView
                        onCameraReady={() => setLoading(false)}
                        style={StyleSheet.absoluteFill}
                        facing="front"
                        ref={cameraRef}
                        mode="video"
                    ></CameraView>
                )}

            <View style={{ flex: 1, width: "100%", alignItems: "center", justifyContent: "center" }}>
                <View
                    style={{
                        paddingTop: insets.top + 16, paddingBottom: 16,
                        gap: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        backgroundColor: "#e5e5e5",
                    }}
                >
                    <Text
                        style={{ fontSize: 20, lineHeight: 25, fontWeight: "bold", color: "black", textAlign: 'center' }}
                    >{`Your Journey & Why You're Here`}</Text>
                    <Text
                        style={{ fontSize: 14, lineHeight: 21, fontWeight: "500", color: "black", textAlign: 'center' }}
                    >{`You have ${MAX_DURATION} seconds`}</Text>
                    <View style={{ position: 'absolute', top: 0, left: 0, width: "100%", alignItems: "flex-end", paddingHorizontal: 32, paddingTop: insets.top }}>
                        {currentUser?.skip_recording_count < 5 && <Text style={{ fontSize: 13, color: '#725ED4', fontWeight: 'bold' }} onPress={onSkip}>Skip</Text>}
                    </View>
                </View>
                <View
                    style={{
                        width: "100%",
                        height: Dimensions.get("screen").height - insets.bottom - insets.top - 390,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                    }}
                >
                    <View style={{ flex: 1, backgroundColor: "#e5e5e5", height: "100%" }} />
                    <View
                        style={{
                            width: Dimensions.get("screen").width - 64,
                            height: Dimensions.get("screen").height - insets.bottom - insets.top - 390,
                        }}
                    >
                        <View
                            style={{
                                width: "100%",
                                height: "100%",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                borderColor: "#e5e5e5",
                                borderWidth: 6,
                            }}
                        />
                        <View
                            style={{
                                width: "100%",
                                height: "100%",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                borderColor: "#CDB8E2",
                                borderWidth: 6,
                                borderRadius: 20,
                            }}
                        />
                        {loading && (
                            <View style={{ flex: 1, gap: 24, alignItems: "center", justifyContent: "center" }}>
                                <Image
                                    source={images.camera_icon}
                                    style={{ width: 100, height: 100 }}
                                    contentFit="contain"
                                />
                                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                                    <Text style={{ fontSize: 16, color: "white", fontWeight: "bold" }}>Loading</Text>
                                    <ActivityIndicator color="#0BFF27" size="small" />
                                </View>
                            </View>
                        )}
                        {recording && (
                            <View
                                style={{
                                    position: "absolute",
                                    top: 8,
                                    left: 8,
                                    width: 80,
                                    height: 24,
                                    justifyContent: "center",
                                    borderRadius: 14,
                                    alignItems: "center",
                                    gap: 8,
                                    backgroundColor: "#333333",
                                    flexDirection: "row",
                                }}
                            >
                                <View
                                    style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#FD3730" }}
                                />
                                <Text
                                    style={{ fontSize: 14, color: "white", fontWeight: "bold" }}
                                >{`00:${timer.toString().padStart(2, "0")}`}</Text>
                            </View>
                        )}
                        {videoUrl && (
                            <Video
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    borderColor: "#CDB8E2",
                                    borderWidth: 6,
                                    borderRadius: 20,
                                    transform: [{ scaleX: isFlipped ? -1 : 1 }]
                                }}
                                ref={videoRef}
                                source={videoUrl}
                                resizeMode={ResizeMode.COVER}
                                onPlaybackStatusUpdate={handleChangePlaybackStatus}
                                onLoad={onLoad}
                                positionMillis={startPosition * 1000}
                            />
                        )}
                        {videoUrl && (
                            <View style={{ flex: 1, paddingVertical: 12 }}>
                                <View></View>
                                <View
                                    style={{
                                        flex: 1,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {!playing && (
                                        <TouchableOpacity onPress={onPlay} style={{ width: 65, height: 65 }}>
                                            <Image
                                                source={images.play_button}
                                                style={{ width: 65, height: 65 }}
                                                contentFit="contain"
                                            />
                                        </TouchableOpacity>
                                    )}
                                    {playing && (
                                        <TouchableOpacity
                                            onPress={onPause}
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 16,
                                                width: 40,
                                                height: 40,
                                                borderRadius: 15,
                                            }}
                                        >
                                            <Image
                                                source={images.pause_icon}
                                                style={{ width: 40, height: 40, borderRadius: 15 }}
                                                contentFit="contain"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View>
                                    <RangeSlider
                                        min={0}
                                        max={videoDuration}
                                        low={startPosition}
                                        high={endPosition}
                                        //TODO: HAVE A LOOK ON THIS
                                        // onValueChange={(value) => setStartTime(value)}
                                        onChangeValue={handleValueChange}
                                    />
                                    <View
                                        style={{
                                            marginTop: 25,
                                            paddingHorizontal: 24,
                                            flexDirection: "row",
                                            width: "100%",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <View
                                            style={{
                                                height: 22,
                                                borderRadius: 11,
                                                paddingHorizontal: 5,
                                                backgroundColor: "white",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Text
                                                style={{ fontSize: 11, color: "black", fontWeight: "600" }}
                                            >{`00:${startPosition.toString().padStart(2, "0")}`}</Text>
                                        </View>
                                        <View
                                            style={{
                                                height: 22,
                                                borderRadius: 11,
                                                paddingHorizontal: 5,
                                                backgroundColor: "white",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Text
                                                style={{ fontSize: 11, color: "black", fontWeight: "600" }}
                                            >{`00:${endPosition.toString().padStart(2, "0")}`}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {recording && displayedBlock.length > 0 && (
                            <View style={{ position: "absolute", left: 16, right: 16, bottom: 65, borderRadius: 5 }}>
                                <SubtitleDisplay
                                    subtitles={displayedBlock}
                                    highlightWords={highlightWords}
                                />
                            </View>
                        )
                        }

                        {recording && (
                            <View style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
                                <Slider
                                    style={{ width: "100%" }}
                                    minimumValue={0}
                                    maximumValue={MAX_DURATION}
                                    step={1}
                                    thumbImage={images.video_thumb}
                                    maximumTrackTintColor="#333333"
                                    minimumTrackTintColor="#333333"
                                    value={timer}
                                />
                                {/* <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      height: 22,
                      borderRadius: 11,
                      paddingHorizontal: 5,
                      backgroundColor: "white",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{ fontSize: 11, color: "black", fontWeight: "600" }}
                    >{`00:${timer.toString().padStart(2, "0")}`}</Text>
                  </View>
                  <View
                    style={{
                      height: 22,
                      borderRadius: 11,
                      paddingHorizontal: 5,
                      backgroundColor: "white",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{ fontSize: 11, color: "black", fontWeight: "600" }}
                    >{`00:${MAX_DURATION}`}</Text>
                  </View>
                </View> */}
                            </View>
                        )}
                        {/* <LottieView 
                                style={{width: Dimensions.get('screen').width, marginLeft: -30, height: Dimensions.get('screen').height - 400, marginTop: 20, zIndex: 10}}
                                autoPlay
                                source={require('../../assets/animations/processing.json')}
                                resizeMode='cover'
                            /> */}
                    </View>
                    <View style={{ flex: 1, backgroundColor: "#e5e5e5", height: "100%" }} />
                </View>
                <View
                    style={{
                        flex: 1,
                        paddingTop: 24,
                        paddingBottom: insets.bottom + 16,
                        width: "100%",
                        backgroundColor: "#e5e5e5",
                        paddingHorizontal: 16,
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    <View style={{ marginVertical: -8, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                            <Text style={{ fontSize: 10, fontWeight: '500', color: 'black' }}>{'Face blur:'}</Text>
                            <CustomSwitch value={isBlur} onValueChange={onSetBlur} />
                        </View>
                        {isBlur && <Text style={{ flex: 1, textAlign: 'right', fontSize: 10, lineHeight: 14, fontWeight: '400', color: 'black' }}>{`Your face blur won't appear during recording but will be applied before sharing your profile.`}</Text>}
                    </View>
                    <View style={{ width: '100%', alignItems: 'flex-start', justifyContent: 'flex-start', height: 85, }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, }}>
                            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#333333', alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={images.happy_cloud} style={{ width: 20, height: 20 }} contentFit="contain" />
                            </View>
                            <View style={{
                                backgroundColor: "#333333",
                                borderBottomLeftRadius: 2.5,
                                borderBottomRightRadius: 10,
                                borderTopRightRadius: 10,
                                borderTopLeftRadius: 10,
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                flex: 1, marginRight: 32
                            }}>
                                <Text style={{ fontSize: 13, color: 'white', lineHeight: 20, fontWeight: '500' }}>{`Share what brought you to Kuky. This helps us match you with people on a similar journey.`}</Text>
                            </View>
                        </View>
                    </View>
                    {!recording && !loading && !videoUrl && (
                        <TouchableOpacity
                            onPress={startRecording}
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
                                {"Start recording"}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {!recording && !loading && !videoUrl && (
                        <TouchableOpacity
                            onPress={selectFromLibrary}
                            style={{
                                paddingHorizontal: 16,
                                alignSelf: "center",
                                height: 30,
                                borderRadius: 30,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text style={{ fontSize: 16, fontWeight: "700", color: "#333333" }}>
                                {"Upload video"}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {recording && !videoUrl && (
                        <TouchableOpacity
                            onPress={stopRecording}
                            style={{
                                width: Platform.isPad ? 600 : "100%",
                                alignSelf: "center",
                                height: 60,
                                borderRadius: 30,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#D11C16",
                            }}
                        >
                            <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>{"Stop"}</Text>
                        </TouchableOpacity>
                    )}
                    {videoUrl && (
                        <TouchableOpacity
                            disabled={processing}
                            onPress={onConfirm}
                            style={{
                                flexDirection: "row",
                                gap: 16,
                                width: Platform.isPad ? 600 : "100%",
                                alignSelf: "center",
                                height: 60,
                                borderRadius: 30,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#D11C16",
                            }}
                        >
                            <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>
                                {"Continue"}
                            </Text>
                            {processing && <ActivityIndicator color="white" />}
                        </TouchableOpacity>
                    )}
                    <View style={{ height: 30, width: "100%", paddingBottom: insets.bottom + 10 }}>
                        {videoUrl && (
                            <TouchableOpacity
                                onPress={clearVideo}
                                style={{
                                    width: 120,
                                    alignSelf: "center",
                                    height: 30,
                                    borderRadius: 30,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: "bold", color: "black" }}>{"Retake"}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
            {((permission && !permission.granted) || (audioPermission && !audioPermission.granted)) && (
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#000000aa",
                        },
                    ]}
                >
                    <View
                        style={{
                            backgroundColor: "#725ED4",
                            width: "90%",
                            maxWidth: 500,
                            borderRadius: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            paddingVertical: 16,
                            paddingHorizontal: 24,
                        }}
                    >
                        <Image
                            source={images.camera_icon}
                            style={{ width: 42, height: 42 }}
                            contentFit="contain"
                        />
                        <Text style={{ fontSize: 20, color: "white", fontWeight: "bold", marginTop: 10 }}>
                            Camera Access Needed
                        </Text>
                        <Text
                            style={{
                                lineHeight: 24,
                                fontSize: 16,
                                color: "white",
                                fontWeight: "400",
                                marginTop: 16,
                                textAlign: "center",
                            }}
                        >{`To continue, Kuky needs access to your camera. \nThis is required for recording your video introduction.`}</Text>
                        <Text
                            style={{
                                lineHeight: 21,
                                fontSize: 14,
                                color: "white",
                                fontWeight: "400",
                                marginTop: 16,
                                textAlign: "center",
                            }}
                        >
                            We use your camera to help you create a video that lets us find the best matches for
                            you.
                        </Text>
                        <ButtonWithLoading
                            text="Continue"
                            style={{ marginTop: 40 }}
                            onPress={retryPermission}
                        />
                        {currentUser?.skip_recording_count < 5 && <TouchableOpacity
                            onPress={onSkip}
                            style={{ paddingHorizontal: 15, paddingVertical: 8, marginTop: 8 }}
                        >
                            <Text style={{ fontSize: 14, fontWeight: "500", color: "white" }}>
                                Skip for now
                            </Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            )}
        </View>
    );
};

export default JourneyVideoScreen;
