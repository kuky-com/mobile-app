import React, { FC, useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DirectCallVideoView } from "@sendbird/calls-react-native";
import { CALL_PERMISSIONS, usePermissions } from "@/hooks/usePermissions";
import AvatarImage from "./AvatarImage";
import Text from "./Text";
import { BlurView } from "expo-blur";

const DirectCallVideoContentView = ({ call, status }) => {
  const { left, top, viewWidth, viewHeight, scaleTo } = useLocalViewSize("large");
  const insets = useSafeAreaInsets()

  usePermissions(CALL_PERMISSIONS);
  useEffect(() => {
    switch (status) {
      case "pending": {
        scaleTo("large");
        break;
      }
      case "established":
      case "connected":
      case "reconnecting": {
        scaleTo("small");
        break;
      }
      case "ended": {
        break;
      }
    }
  }, [status]);

  return (
    <View style={{ flex: 1, backgroundColor: '#E8E8E8', gap: 1 }}>
      <View style={{ flex: 1 }}>
        {
          call?.isRemoteVideoEnabled ?
            <DirectCallVideoView
              mirror={false}
              resizeMode={"cover"}
              viewType={"remote"}
              callId={call.callId}
              style={{ flex: 1 }}
            />
            :
            <View style={{ flex: 1 }}>
              <AvatarImage
                full_name={call.remoteUser?.nickname ?? ""}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                avatar={call?.remoteUser?.profileUrl}
              />
              <BlurView style={{ flex: 1, alignItems: 'center', justifyContent: "center", gap: 16 }}>
                <AvatarImage
                  full_name={call.remoteUser?.nickname ?? ""}
                  style={{ width: 120, height: 120, borderRadius: 60 }}
                  avatar={call?.remoteUser?.profileUrl}
                />
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>{call.remoteUser?.nickname ?? ""}</Text>
              </BlurView>
            </View>
        }
      </View>
      <View style={{ flex: 1 }}>
        {
          call?.isLocalVideoEnabled ?
            <DirectCallVideoView
              mirror={true}
              resizeMode={"cover"}
              viewType={"local"}
              callId={call.callId}
              android_zOrderMediaOverlay
              style={{ flex: 1 }}
            /> :
            <View style={{ flex: 1 }}>
              <AvatarImage
                full_name={call.localUser?.nickname ?? ""}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                avatar={call?.localUser?.profileUrl}
              />
              <BlurView style={{ flex: 1, alignItems: 'center', justifyContent: "center", gap: 16, paddingBottom: 90 + insets.bottom }}>
                <AvatarImage
                  full_name={call.localUser?.nickname ?? ""}
                  style={{ width: 120, height: 120, borderRadius: 60 }}
                  avatar={call?.localUser?.profileUrl}
                />
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>{call.localUser?.nickname ?? ""}</Text>
              </BlurView>
            </View>
        }
      </View>
    </View>
  );
};

const useLocalViewSize = (initialScale = "large") => {
  const { width, height } = useWindowDimensions();
  const { top: topInset } = useSafeAreaInsets();

  const MAX_WIDTH = Math.min(width, height);
  const MIN_WIDTH = 96;
  const MAX_HEIGHT = Math.max(width, height);
  const MIN_HEIGHT = 160;

  const viewWidth = useRef(
    new Animated.Value(initialScale === "large" ? MAX_WIDTH : MIN_WIDTH),
  ).current;
  const left = viewWidth.interpolate({
    inputRange: [MIN_WIDTH, MAX_WIDTH],
    outputRange: [16, 0],
    extrapolate: "clamp",
  });
  const top = viewWidth.interpolate({
    inputRange: [MIN_WIDTH, MAX_WIDTH],
    outputRange: [16 + topInset, 0],
    extrapolate: "clamp",
  });
  const viewHeight = viewWidth.interpolate({
    inputRange: [MIN_WIDTH, MAX_WIDTH],
    outputRange: [MIN_HEIGHT, MAX_HEIGHT],
    extrapolate: "clamp",
  });
  const scaleTo = (size) => {
    Animated.timing(viewWidth, {
      toValue: size === "small" ? MIN_WIDTH : MAX_WIDTH,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  return { left, top, viewWidth, viewHeight, scaleTo };
};

export default DirectCallVideoContentView;
