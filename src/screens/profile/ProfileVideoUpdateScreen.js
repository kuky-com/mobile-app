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

  const onLoad = (data) => {
    setStartPosition(0);
    setDuration(Math.round(data.durationMillis / 1000));
    setEndPosition(Math.round(data.durationMillis / 1000));
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
      try {
        setTimer(0);
        setTimeout(() => {
          setTimer(1);
        }, 1000);

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
        await cameraRef.current.stopRecording();
        setRecording(false);
      }
    } catch (error) { }
  };

  const onPlay = () => {
    try {
      if (videoRef && videoRef.current) {
        videoRef.current.setStatusAsync({ shouldPlay: true, positionMillis: startPosition * 1000 });
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
      <StatusBar translucent style="dark" />
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
            gap: 16,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            backgroundColor: "#e5e5e5",
            paddingTop: insets.top + 8,
            paddingBottom: 16,
          }}
        >
          <View style={{ paddingHorizontal: 16, marginBottom: 32, width: "100%", flexDirection: 'row', alignItems: "center", justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Image source={images.back_icon} style={{ width: 30, height: 30 }} contentFit="contain" />
            </TouchableOpacity>
            <Image
              source={images.logo_with_text}
              style={{ width: 120, height: 40 }}
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
            height: Dimensions.get("screen").height - 450,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <View style={{ flex: 1, backgroundColor: "#e5e5e5", height: "100%" }} />
          <View
            style={{
              width: Dimensions.get("screen").width - 64,
              height: Dimensions.get("screen").height - 450,
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
          <Text style={{ fontSize: 14, fontWeight: "500", color: "black", lineHeight: 18, textAlign: 'center' }}>
            Share your purpose, likes, and dislikes with us - it only takes a moment and will help us connect you with the right people.
          </Text>
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
              text="Grant Camera Access"
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
