import { useEffect } from "react";
import { View, Text } from "react-native";
import DirectCallControllerView from "@/components/DirectCallControllerView";
import { useDirectCall } from "@/hooks/useDirectCall";
export const VoiceCallScreen = ({ route, navigation }) => {
  const { call, status, currentAudioDeviceIOS } = useDirectCall(route.params.callId);

  useEffect(() => {
    if (status === "ended") {
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    }
  }, [status]);

  if (!call) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} className="bg-black">
      <DirectCallControllerView
        status={status}
        call={call}
        ios_audioDevice={currentAudioDeviceIOS}
      />
    </View>
  );
};
