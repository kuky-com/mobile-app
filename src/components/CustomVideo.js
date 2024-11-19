import React, { useEffect, useState } from "react";
import images from "@/utils/images";
import { Image } from "expo-image";
import { View } from "react-native";

const { Video, Audio } = require("expo-av");

const CustomVideo = React.forwardRef((props, ref) => {
  const [loaded, setLoaded] = useState(false);

  const onReadyForDisplay = async () => {
    if (props && props.onReadyForDisplay) {
      props.onReadyForDisplay();
    }
    setLoaded(true);
  };

  const onPlaybackStatusUpdate = (status) => {
    if (props && props.onPlaybackStatusUpdate) {
      props.onPlaybackStatusUpdate(status);
    }
    setLoaded(status.isLoaded);
  }

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true })
  }, [])

  useEffect(() => {
    const loadNewSource = async () => {
      try {
        if (ref && ref.current) {
          await ref.current.unloadAsync()

          if (props?.source) {
            await ref.current.loadAsync(props?.source, {
              positionMillis: props?.positionMillis ? Math.max(props?.positionMillis, 50) : 50, 
              shouldPlay: props?.shouldPlay,
              isLooping: props?.isLooping,
              isMuted: props?.isMuted,
            })
          }
        }
      } catch (error) {
        console.log({ error })
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
        {!loaded && (
          <Image
            source={images.buffering}
            style={{ width: "60%", height: "60%", resizeMode: "contain" }}
          />
        )}
      </View>
    </Video>
  );
});

export default CustomVideo;
