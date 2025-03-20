import React, { useEffect, useState, useRef } from "react";
import images from "@/utils/images";
import { Image } from "expo-image";
import { View } from "react-native";
import LottieView from "lottie-react-native";
import VideoSubtitle from "./VideoSubtitle";

const { Video, Audio } = require("expo-av");

const CustomVideo = React.forwardRef((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(ref);

  const onReadyForDisplay = async () => {
    if (props && props.onReadyForDisplay) {
      props.onReadyForDisplay();
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    console.log({status})
    if (props && props.onPlaybackStatusUpdate) {
      props.onPlaybackStatusUpdate(status);
    }

    setLoading(!status.isLoaded || status.isBuffering || (status.shouldPlay && !status.isPlaying));
    setIsPlaying(status.isPlaying);

    // if (status.didJustFinish && !status.isLooping) {
    //   if (props.sources && currentIndex < props.sources.length - 1) {
    //     setCurrentIndex(currentIndex + 1);
    //   }
    // }
  };

  useEffect(() => {
    const loadNewSource = async () => {
      try {
        if (videoRef.current) {
          await videoRef.current.unloadAsync();
        }
      } catch (error) {
        console.log({ unloadAsyncError: error });
      }

      try {
        if (videoRef.current) {
          const source = props.sources ? props.sources[currentIndex] : null;
          console.log({source, currentIndex})

          if (source) {
            setLoading(true);
            await videoRef.current.loadAsync({uri: source}, {
              positionMillis: props?.positionMillis ? Math.max(props?.positionMillis, 50) : 50,
              shouldPlay: true,
              isLooping: props?.isLooping,
              isMuted: props?.isMuted,
            });
          }
        }
      } catch (error) {
        console.log({ loadAsyncError: error });
      }
    };

    loadNewSource();
  }, [props.sources, currentIndex]);

  return (
    <Video
      ref={videoRef}
      {...props}
      positionMillis={props?.positionMillis ? Math.max(props?.positionMillis, 50) : 50}
      onReadyForDisplay={onReadyForDisplay}
      onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      onError={(error) => console.log({ error })}
      onLoad={(status) => console.log({status1: status})}
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
        {props.posterSource && loading && (
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
            <Image
              source={props.posterSource}
              style={{ flex: 1, width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </View>
        )}

        <LottieView
          autoPlay
          style={{
            display: loading ? 'flex' : 'none',
            width: 90, height: 90,
            backgroundColor: "#00000000",
          }}
          source={require("../assets/animations/buffering.json")}
        />

        {isPlaying && props.subtitles && props.subtitles[currentIndex] && (
          <View style={{ zIndex: 5, position: 'absolute', bottom: 16, left: 16, right: 16 }}>
            <VideoSubtitle
              vttUrl={props.subtitles[currentIndex]}
              videoRef={videoRef}
            />
          </View>
        )}
      </View>
    </Video>
  );
});

export default CustomVideo;