import { useEffect } from "react";
import { View, Text } from "react-native";
import DirectCallControllerView from "@/components/DirectCallControllerView";
import { useDirectCall } from "@/hooks/useDirectCall";
import { BlurView } from "expo-blur";
import AvatarImage from "@/components/AvatarImage";
import analytics from '@react-native-firebase/analytics'

export const VoiceCallScreen = ({ route, navigation }) => {
  const { call, status, currentAudioDeviceIOS, callLog } = useDirectCall(route.params.callId);

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "VoiceCallScreen",
      screen_class: "VoiceCallScreen",
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
        <DirectCallControllerView
          status={status}
          call={call}
          ios_audioDevice={currentAudioDeviceIOS}
        />
      </BlurView>
    </View>
  );
};
