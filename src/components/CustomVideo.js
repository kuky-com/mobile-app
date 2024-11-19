import React, { useEffect, useState } from "react";
import images from "@/utils/images";
import { Image } from "expo-image";
import { View } from "react-native";

const { Video, Audio } = require("expo-av");

const CustomVideo = React.forwardRef((props, ref) => {
  const [loaded, setLoaded] = useState(false);

  const onReadyForDisplay = () => {
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

  return (
    <Video ref={ref} {...props} onReadyForDisplay={onReadyForDisplay} onPlaybackStatusUpdate={onPlaybackStatusUpdate}>
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
