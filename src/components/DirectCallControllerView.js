import React, { FC, Fragment, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AvatarImage from "@/components/AvatarImage";

import { DirectCallUserRole } from "@sendbird/calls-react-native";

import { useDirectCallDuration } from "@/hooks/useDirectCallDuration";
import AudioDeviceButton from "./AudioDeviceButton";
import Text from "@/components/Text";
import CallIcon from "./CallIcon";

// type ControllerViewProps = {
//   status: DirectCallStatus;
//   call: DirectCall;
//   ios_audioDevice: AudioDeviceRoute;
// };
const DirectCallControllerView = ({ status, call, ios_audioDevice }) => {
  const { top } = useSafeAreaInsets();
  const remoteUserNickname = useMemo(() => {
    if (call.myRole === DirectCallUserRole.CALLEE) {
      return call.caller?.nickname ?? "No name";
    }
    if (call.myRole === DirectCallUserRole.CALLER) {
      return call.callee?.nickname ?? "No name";
    }
    return "No name";
  }, [call]);

  const someOf = (stats) => stats.some((s) => s === status);
  const statusStandby = someOf(["pending"]);
  const statusInProgress = someOf(["established", "connected", "reconnecting"]);
  const statusEnded = someOf(["ended"]);
  const isVoiceCall = !call.isVideoCall;
  const isVideoCall = call.isVideoCall;
  console.log(status);
  return (
    <View style={[StyleSheet.absoluteFill, { padding: 16 }]}>
      <View style={styles.topController}>
        <View style={{ alignItems: "flex-end", paddingTop: top }}>
          {isVideoCall && statusInProgress && (
            <Pressable onPress={() => call.switchCamera()}>
              <CallIcon icon={"btnCameraFlipIos"} size={48} />
            </Pressable>
          )}
        </View>
        <View style={styles.information}>
          {statusStandby && (
            <Fragment>
              <Text className="text-lg2 text-color-red" style={styles.nickname}>
                {remoteUserNickname}
              </Text>
              <Text className="text-md text-color-red">
                {call.myRole === DirectCallUserRole.CALLER
                  ? "calling..."
                  : `Incoming ${call.isVideoCall ? "video" : "voice"} call...`}
              </Text>
            </Fragment>
          )}
          {((isVoiceCall && statusInProgress) || statusEnded) && (
            <Fragment>
              <AvatarImage
                full_name={call.remoteUser?.nickname ?? ""}
                style={{ width: 120, height: 120, borderRadius: 60 }}
                avatar={call?.remoteUser?.profileUrl}
              />
              <Text className="text-md text-red" style={styles.nickname}>
                {remoteUserNickname}
              </Text>
              <StatusView statusInProgress={statusInProgress} call={call} />
            </Fragment>
          )}
          <View style={styles.remoteMuteStatus}>
            {statusInProgress && !call.isRemoteAudioEnabled && (
              <Fragment>
                <CallIcon
                  icon={"AudioOff"}
                  size={40}
                  color={"rgba(0, 0, 0, 0.88)"}
                  containerStyle={{ marginBottom: 16 }}
                />
                <Text className="text-color-red">{`${remoteUserNickname} is muted`}</Text>
              </Fragment>
            )}
          </View>
        </View>
      </View>

      <View style={styles.bottomController}>
        {(statusStandby || statusInProgress) && (
          <>
            <View style={[styles.bottomButtonGroup, { marginBottom: 24 }]}>
              <Pressable
                style={[
                  styles.bottomButton,
                  { borderRadius: 10000, backgroundColor: "white", opacity: 30 },
                ]}
                onPress={() => {
                  if (call.isLocalAudioEnabled) {
                    call.muteMicrophone();
                  } else {
                    call.unmuteMicrophone();
                  }
                }}
              >
                <CallIcon
                  icon={call.isLocalAudioEnabled ? "btnAudioOff" : "btnAudioOffSelected"}
                  size={64}
                />
              </Pressable>
              {isVideoCall && (
                <Pressable
                  style={styles.bottomButton}
                  onPress={() => {
                    if (call.isLocalVideoEnabled) {
                      call.stopVideo();
                    } else {
                      call.startVideo();
                    }
                  }}
                >
                  <CallIcon
                    icon={call.isLocalVideoEnabled ? "btnVideoOff" : "btnVideoOffSelected"}
                    size={64}
                  />
                </Pressable>
              )}
              <AudioDeviceButton
                currentAudioDeviceIOS={ios_audioDevice}
                availableAudioDevicesAndroid={call.android_availableAudioDevices}
                currentAudioDeviceAndroid={call.android_currentAudioDevice}
                onSelectAudioDeviceAndroid={call.android_selectAudioDevice}
              />
            </View>

            <View style={styles.bottomButtonGroup}>
              {statusStandby && call.myRole === DirectCallUserRole.CALLEE && (
                <Pressable
                  style={styles.bottomButton}
                  onPress={() => call.accept()}
                  className="bg-red"
                >
                  <CallIcon icon={"btnCallVideoAccept"} size={64} />
                </Pressable>
              )}
              <Pressable onPress={() => call.end()}>
                <CallIcon icon={"btnCallEnd"} size={64} />
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const StatusView = ({ call, statusInProgress }) => {
  const seconds = useDirectCallDuration(call);
  return (
    <Text className="text-md text-color-red">{statusInProgress ? seconds : call.endResult}</Text>
  );
};

const styles = StyleSheet.create({
  topController: {
    flex: 1,
  },
  information: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  profile: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 32,
  },
  nickname: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  remoteMuteStatus: {
    height: 150,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bottomController: {
    flex: 0.8,
    justifyContent: "flex-end",
    paddingBottom: 64,
  },
  bottomButton: {
    marginRight: 24,
  },
  bottomButtonGroup: {
    flexDirection: "row",
    justifyContent: "center",
  },
});

export default DirectCallControllerView;
