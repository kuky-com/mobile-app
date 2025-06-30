import { useEffect, useState,  useRef} from "react";
import { View, Text } from "react-native";
import DirectCallControllerView from "@/components/DirectCallControllerView";
import { useDirectCall } from "@/hooks/useDirectCall";
import { BlurView } from "expo-blur";
import AvatarImage from "@/components/AvatarImage";
import analytics from '@react-native-firebase/analytics'
import { useKeepAwake } from 'expo-keep-awake'
import { Audio } from "expo-av";

export const VoiceCallScreen = ({ route, navigation }) => {
  const { call, status, currentAudioDeviceIOS, callLog } = useDirectCall(route.params.callId);

  useKeepAwake()

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "VoiceCallScreen",
      screen_class: "VoiceCallScreen",
    })

    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
  }, [])
const dialingSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (status === 'pending') {
    const playDialing = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/dialing.mp3'),
          { shouldPlay: true, isLooping: true } 
        );
        dialingSoundRef.current = sound;
        await sound.playAsync();
      } catch (err) {
        console.log('Error playing dialing sound:', err);
      }
    };
    playDialing();
  }
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
