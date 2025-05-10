import Text from "@/components/Text";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
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
import { ResizeMode, Video } from "expo-av";
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
import { useAtomValue } from "jotai";
import { userAtom } from "../../actions/global";
import axios from "axios";
import colors from "../../utils/colors";
import SubtitleDisplay from "../../components/SubtitleDisplay";
import VideoManager from "../../components/VideoManager";
// import Vosk from 'react-native-vosk'

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

const MAX_DURATION = 60;

const ProfileVideoUpdateScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = useAtomValue(userAtom)
  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, requestAudioPermission] = useMicrophonePermissions();
  const [recording, setRecording] = useState(false);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const [videoDuration, setDuration] = useState(0);
  const [startPosition, setStartPosition] = useState(0);
  const [endPosition, setEndPosition] = useState(0);
  const [playing, setPlaying] = useState(false);

  const showAlert = useAlertWithIcon()
  const showNormalAlert = useAlert()

  const [timer, setTimer] = useState(0);

  const [processing, setProcessing] = useState(false);

  const [transcription, setTranscription] = useState("");
  const [displayedBlock, setDisplayedBlock] = useState('');
  const [highlightWords, setHighlightWords] = useState([]);

  let latestRequest = null;

  // const vosk = useRef(new Vosk()).current;

  // const load = useCallback(() => {
  //   vosk
  //     .loadModel('vosk-model-small-en-us-0.15')
  //     .then(() => {
  //       console.log('model load success')
  //     })
  //     .catch((e) => console.log(e));
  // }, [vosk]);

  // const startTranscript = () => {
  //   try {
  //     vosk
  //       .start()
  //       .then(() => {
  //         console.log('Starting recognition...');
  //       })
  //       .catch((e) => console.log(e));
  //   } catch (error) {
  //     console.log({ error });
  //   }
  // };

  // const stopTranscript = () => {
  //   vosk.stop();
  //   console.log('Stoping recognition...');
  // };

  // const unload = useCallback(() => {
  //   vosk.unload();
  // }, [vosk]);

  // useEffect(() => {
  //   const resultEvent = vosk.onResult((res) => {
  //     console.log('An onResult event has been caught: ' + res);

  //     processTranscript(res)
  //   });

  //   const errorEvent = vosk.onError((e) => {
  //     console.log({ errorEvent: e });
  //   });

  //   return () => {
  //     resultEvent.remove();
  //     errorEvent.remove();
  //   };
  // }, [vosk]);

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

  useEffect(() => {
    analytics().logScreenView({
      screen_name: 'ProfileVideoUpdateScreen',
      screen_class: 'ProfileVideoUpdateScreen'
    })
  }, [])

  const onLoad = (data) => {
    setStartPosition(0);
    setDuration(Math.round(data.durationMillis / 1000));
    setEndPosition(Math.round(data.durationMillis / 1000));
  };

  const startRecording = async () => {

    analytics().logEvent('video_recording_button')

    if (cameraRef.current) {
      setRecording(true);
      try {
        setTimer(0);
        setTimeout(() => {
          setTimer(1);
        }, 1000);

        try {
          // startTranscript()
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
      duration: 60000
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
        // stopTranscript()
        setTranscription('')

        await cameraRef.current.stopRecording();
        setRecording(false);
      }
    } catch (error) { }
  };

  const onPlay = async () => {
    try {
      if (videoRef && videoRef.current) {
        await VideoManager.stopCurrent();
        videoRef.current.setStatusAsync({ shouldPlay: true, positionMillis: startPosition * 1000 });
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
    setVideoUrl(null);
    setPlaying(false);
    setTimer(0);
    setRecording(false);
    setProcessing(false);
  };

  const handleTrim = async () => {
    if ((endPosition - startPosition) < 10) {
      showAlert(images.video_error, 'Too Short', 'Your video duration is too short.', 'Please record video at least 10 seconds', [
        { text: "Record again", onPress: () => clearVideo() }
      ])
      return
    }
    if ((endPosition - startPosition) > 60) {
      showAlert(images.video_error, 'Too Long', 'Your video duration is too long.', 'Please record video with maximum 60 seconds', [
        { text: "Record again", onPress: () => clearVideo() }
      ])
      return
    }

    setProcessing(true);
    try {
      setProcessing(false);
      NavigationService.push("ProfileVideoProcessingScreen", {
        videoUrl: videoUrl,
        startPosition,
        endPosition,
      });
      setTimeout(() => {
        clearVideo();
      }, 1000);
    } catch (error) {
      Toast.show({ text1: "Cannot process your video. Please try to retake!", type: "error" });
      setProcessing(false);
    }
  };

  const retryPermission = async () => {
    try {
      const res = await requestPermission();
      if (!res.canAskAgain && !res.granted) {
        Linking.openSettings();
      }

      const audioRes = await requestAudioPermission();
      if (!audioRes.canAskAgain && !audioRes.granted) {
        Linking.openSettings();
      }

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
            flex: 1,
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            backgroundColor: "#e5e5e5",
          }}
        >
          <View style={{ width: "100%", alignItems: "flex-end" }}>
            <Image
              source={images.logo_with_text}
              style={{ width: 120, height: 40, marginBottom: 2 }}
              contentFit="contain"
            />
          </View>
          {/* <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>{`Video 1`}</Text> */}
          <Text
            style={{ fontSize: 24, fontWeight: "bold", color: "black" }}
          >{`Tell us about yourself !`}</Text>
          <Text
            style={{ fontSize: 14, fontWeight: "500", color: "black" }}
          >{`You have ${MAX_DURATION} seconds`}</Text>
        </View>
        <View
          style={{
            width: "100%",
            height: Dimensions.get("screen").height - insets.bottom - insets.top - 350,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <View style={{ flex: 1, backgroundColor: "#e5e5e5", height: "100%" }} />
          <View
            style={{
              width: Dimensions.get("screen").width - 64,
              height: Dimensions.get("screen").height - insets.bottom - insets.top - 350,
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
                  right: 8,
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
              <CustomVideo
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
                ref={videoRef}
                sources={[videoUrl]}
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
              <View style={{ position: "absolute", left: 16, right: 16, top: 35, borderRadius: 5, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#00000099' }}>
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
                <View
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
                </View>
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
          <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', height: 70 }}>
            {highlightWords.length === 0 &&
              <Text style={{ fontSize: 14, fontWeight: "500", color: "black", lineHeight: 18, textAlign: 'center' }}>
                Share your purpose, likes, and dislikes with us - it only takes a moment and will help us connect you with the right people.
              </Text>
            }
            {highlightWords.length > 0 &&
              <Text style={{ fontSize: 14, fontWeight: "500", color: "black", lineHeight: 18, textAlign: 'center' }}>
                {`Here is what we found from your video: ${highlightWords.join(', ')}`}
              </Text>
            }
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
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#333333" }}>
                {"Upload your video"}
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
                {"Confirm & Continue"}
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
              We use your camera to help you create a video that lets us find the best matches for you.
            </Text>
            <ButtonWithLoading
              text="Continue"
              style={{ marginTop: 40 }}
              onPress={retryPermission}
            />
            <TouchableOpacity
              onPress={retryPermission}
              style={{ paddingHorizontal: 15, paddingVertical: 8, marginTop: 8 }}
            >
              <Text style={{ fontSize: 14, fontWeight: "500", color: "white" }}>
                Retry Permission
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfileVideoUpdateScreen;
