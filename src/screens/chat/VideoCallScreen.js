import { useEffect } from "react";
import { View, Text } from "react-native";
import DirectCallControllerView from "@/components/DirectCallControllerView";
import DirectCallVideoContentView from "@/components/DirectCallVideoContentView";
import { useDirectCall } from "@/hooks/useDirectCall";
import AvatarImage from "@/components/AvatarImage";
import { BlurView } from "expo-blur";
import { useKeepAwake } from 'expo-keep-awake'
import analytics from '@react-native-firebase/analytics'

export const VideoCallScreen = ({ route, navigation }) => {
  const { call, status, currentAudioDeviceIOS, callLog } = useDirectCall(route.params.callId);
  useKeepAwake()

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "VideoCallScreen",
      screen_class: "VideoCallScreen",
    })
  }, [])

  useEffect(() => {
    if (status === "ended") {
      if(callLog && (callLog.endResult === 'DECLINED' || callLog.endResult === 'CANCELED') && route.params.onMiss) {
        route.params.onMiss()
      }
      if(callLog && callLog.endResult === 'COMPLETED' && route.params.onFinish) {
        route.params.onFinish(callLog.duration)
      }

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    }
  }, [status]);

  if (!call) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#333333" }}>
      <AvatarImage
        full_name={call.remoteUser?.nickname ?? ""}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        avatar={call?.remoteUser?.profileUrl}
      />

      <BlurView intensity={100} style={{ flex: 1 }}>
        {status === "connected" && <DirectCallVideoContentView status={status} call={call} />}

        <DirectCallControllerView
          status={status}
          call={call}
          ios_audioDevice={currentAudioDeviceIOS}
        />
      </BlurView>
    </View>
  );
};
