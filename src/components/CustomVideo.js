import React, { useEffect, useState } from "react";
import images from "@/utils/images";
import { Image } from "expo-image";
import { View } from "react-native";
import LottieView from "lottie-react-native";

const { Video, Audio } = require("expo-av");

const CustomVideo = React.forwardRef((props, ref) => {
  const [loading, setLoading] = useState(false);

  const onReadyForDisplay = async () => {
    if (props && props.onReadyForDisplay) {
      props.onReadyForDisplay();
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (props && props.onPlaybackStatusUpdate) {
      props.onPlaybackStatusUpdate(status);
    }

    setLoading(!status.isLoaded || status.isBuffering || (status.shouldPlay && !status.isPlaying));
  }

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true })
  }, [])

  useEffect(() => {
    const loadNewSource = async () => {
      try {
        if (ref && ref.current) {
          await ref.current.unloadAsync()
        }
      } catch (error) {
        console.log({ unloadAsyncError: error })
      }

      try {
        if (ref && ref.current) {
          if (props?.source) {
            setLoading(true)
            await ref.current.loadAsync(props?.source, {
              positionMillis: props?.positionMillis ? Math.max(props?.positionMillis, 50) : 50,
              shouldPlay: props?.shouldPlay,
              isLooping: props?.isLooping,
              isMuted: props?.isMuted,
            })
          }
        }
      } catch (error) {
        console.log({ loadAsyncError: error })
      }
    }

    loadNewSource()
  }, [props?.source?.uri])

  return (
    <Video
      ref={ref}
      {...props}
      positionMillis={props?.positionMillis ? Math.max(props?.positionMillis, 50) : 50}
      onReadyForDisplay={onReadyForDisplay}
      onPlaybackStatusUpdate={onPlaybackStatusUpdate}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* <Image
          source={images.buffering}
          style={{ display: loading ? 'flex' : 'none', width: "60%", height: "60%", resizeMode: "contain" }}
        /> */}

        <LottieView
          autoPlay
          style={{
            display: loading ? 'flex' : 'none',
            width: "30%", height: "30%",
            backgroundColor: "#00000000",
          }}
          source={require("../assets/animations/buffering.json")}
        />
      </View>
    </Video>
  );
});

export default CustomVideo;
