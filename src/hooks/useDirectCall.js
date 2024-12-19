import { useState } from "react";
import { SendbirdCalls } from "@sendbird/calls-react-native";
import { useEffectAsync } from "./useEffectAsync";

//export type DirectCallStatus = 'pending' | 'established' | 'connected' | 'reconnecting' | 'ended';
export const useDirectCall = (callId) => {
  const [, update] = useState(0);
  const forceUpdate = () => update((prev) => prev + 1);

  const [call, setCall] = useState();
  const [status, setStatus] = useState("pending");
  const [currentAudioDeviceIOS, setCurrentAudioDeviceIOS] = useState({ inputs: [], outputs: [] });
  const [finalCallLog, setFinalCallLog] = useState(null)

  useEffectAsync(async () => {
    const directCall = await SendbirdCalls.getDirectCall(callId);
    setCall(directCall);

    return directCall.addListener({
      onEstablished() {
        setStatus("established");
      },
      onConnected() {
        setStatus("connected");
      },
      onReconnecting() {
        setStatus("reconnecting");
      },
      onReconnected() {
        setStatus("connected");
      },
      onEnded({ callId, callLog }) {
        // callLog && CallHistoryManager.add(callId, callLog);
        // console.log({callId, callLog})
        setFinalCallLog(callLog)
        setStatus("ended");
      },
      onAudioDeviceChanged(_, { platform, data }) {
        if (platform === "ios") {
          setCurrentAudioDeviceIOS(data.currentRoute);
        } else {
          forceUpdate();
        }
      },
      onCustomItemsDeleted() {
        forceUpdate();
      },
      onCustomItemsUpdated() {
        forceUpdate();
      },
      onLocalVideoSettingsChanged() {
        forceUpdate();
      },
      onRemoteVideoSettingsChanged() {
        forceUpdate();
      },
      onRemoteAudioSettingsChanged() {
        forceUpdate();
      },
      onRemoteRecordingStatusChanged() {
        forceUpdate();
      },
      onUserHoldStatusChanged() {
        forceUpdate();
      },
      onPropertyUpdatedManually() {
        forceUpdate();
      },
    });
  }, []);

  return { call, status, currentAudioDeviceIOS, callLog: finalCallLog };
};
