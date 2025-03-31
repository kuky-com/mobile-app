import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { View, StyleSheet, Dimensions, FlatList, Animated, TouchableWithoutFeedback } from "react-native";
import { Image } from "expo-image";
import LottieView from "lottie-react-native";
import VideoSubtitle from "./VideoSubtitle";
import { Audio, Video } from "expo-av";

const CustomVideo = React.forwardRef((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  const sources = useMemo(() => {
    const src = [];
    (props?.sources || []).forEach((source) => {
      if (source) src.push(source);
    });
    return src;
  }, [props.sources]);

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
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish && !status.isLooping) {
      if (sources && currentIndex < sources.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0)
      }
    }

    if (status.isLoaded && status.durationMillis) {
      const progressValue = status.positionMillis / status.durationMillis;
      progress.setValue(progressValue);
    }
  };

  const loadNewSource = useCallback(async () => {
    try {
      if (ref && ref.current) {
        await ref.current.unloadAsync();
      }
    } catch (error) {
      console.log({ unloadAsyncError: error });
    }

    try {
      console.log({ sources: sources, currentIndex });
      if (ref && ref.current && currentIndex >= 0) {
        const source = sources[currentIndex];

        if (source) {
          setLoading(true);
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            allowsRecordingIOS: false,
          });

          await ref.current.loadAsync({ uri: source }, {
            positionMillis: props?.positionMillis ? Math.max(props?.positionMillis, 50) : 50,
            shouldPlay: currentIndex > 0 ? true : props?.shouldPlay,
            isLooping: props?.isLooping,
            isMuted: props?.isMuted,
          });
        }
      }
    } catch (error) {
      console.log({ loadAsyncError: error });
    }
  }, [props?.profile, currentIndex]);

  useEffect(() => {
    if (currentIndex > sources.length - 1) {
      setCurrentIndex(0)
    }
  }, [sources]);

  useEffect(() => {
    loadNewSource();
  }, [loadNewSource]);

  const handlePressLeft = () => {
    console.log('handlePressRight')
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // flatListRef.current.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  const handlePressRight = () => {
    console.log('handlePressRight')

    if (currentIndex < sources.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handlePressCenter = () => {
    console.log('handlePressCenter')

    ref.current.setStatusAsync({ shouldPlay: false });
  };

  return (
    <View style={props?.style ? [props?.style, { alignItems: 'center', justifyContent: 'center' }] : styles.container}>
      {/* <FlatList
        ref={flatListRef}
        data={sources}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <Video
            {...props}
            ref={ref}
            source={{ uri: item }}
            positionMillis={props?.positionMillis ? Math.max(props?.positionMillis, 50) : 50}
            onReadyForDisplay={onReadyForDisplay}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />
        )}
        keyExtractor={(item, index) => `video-${index}`}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      /> */}

      <Video
        {...props}
        ref={ref}
        positionMillis={props?.positionMillis ? Math.max(props?.positionMillis, 50) : 50}
        onReadyForDisplay={onReadyForDisplay}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View style={styles.touchableContainer}>
        <TouchableWithoutFeedback onPress={handlePressLeft}>
          <View style={styles.touchableLeft} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={handlePressCenter}>
          <View style={styles.touchableCenter} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={handlePressRight}>
          <View style={styles.touchableRight} />
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.progressContainer}>
        {sources.map((_, index) => (
          <View key={index} style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progress,
                {
                  backgroundColor: currentIndex < index ? '#555' : 'white'
                },
                {
                  width: currentIndex === index ? progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }) : "100%",
                },
              ]}
            />
          </View>
        ))}
      </View>
      {props.posterSource && loading && (
        <View style={styles.posterContainer}>
          <Image
            source={props.posterSource}
            style={styles.poster}
            contentFit="cover"
          />
        </View>
      )}
      <LottieView
        autoPlay
        style={[styles.loading, { display: loading ? 'flex' : 'none' }]}
        source={require("../assets/animations/buffering.json")}
      />
      {isPlaying && props.subtitles && props.subtitles[currentIndex] && (
        <View style={styles.subtitleContainer}>
          <VideoSubtitle
            vttUrl={props.subtitles[currentIndex]}
            videoRef={ref}
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    width: '100%',
    height: '100%',
  },
  touchableContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 15
  },
  touchableLeft: {
    flex: 1,
  },
  touchableCenter: {
    flex: 1,
  },
  touchableRight: {
    flex: 1,
  },
  progressContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: "#555",
    marginHorizontal: 2,
  },
  progress: {
    height: 2,
    backgroundColor: "#fff",
  },
  posterContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  poster: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loading: {
    width: 90,
    height: 90,
    backgroundColor: "#00000000",
  },
  subtitleContainer: {
    zIndex: 5,
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
});

export default CustomVideo;