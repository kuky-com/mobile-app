import React, { FC, Fragment, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AvatarImage from "@/components/AvatarImage";

import { DirectCallUserRole } from "@sendbird/calls-react-native";

import { useDirectCallDuration } from "@/hooks/useDirectCallDuration";
// import AudioDeviceButton from "./AudioDeviceButton";
import Text from "@/components/Text";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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

  return (
    <View style={[StyleSheet.absoluteFill, { padding: 16 }]}>
      <View style={styles.topController}>
        <View style={{ alignItems: "flex-end", paddingTop: top }}>
          {isVideoCall && statusInProgress && (
            <Pressable onPress={() => call.switchCamera()}>
              {/* <SBIcon icon={"btnCameraFlipIos"} size={48} /> */}
              <MaterialIcons name="flip-camera-ios" size={48} color="black" />
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
              {/* <Image
                style={styles.profile}
                source={
                  call.remoteUser?.profileUrl
                    ? { uri: call.remoteUser?.profileUrl }
                    : IconAssets.Avatar
                }
              /> */}
              <AvatarImage
                full_name={call.remoteUser?.nickname ?? ""}
                style={{ width: 44, height: 44, borderRadius: 22 }}
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
                <FontAwesome name="microphone-slash" size={40} color="black" />
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
                {/* <SBIcon
                  icon={call.isLocalAudioEnabled ? "btnAudioOff" : "btnAudioOffSelected"}
                  size={64}
                /> */}
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
                  {/* <SBIcon
                    icon={call.isLocalVideoEnabled ? "btnVideoOff" : "btnVideoOffSelected"}
                    size={64}
                  /> */}
                </Pressable>
              )}
              {/* <AudioDeviceButton
                currentAudioDeviceIOS={ios_audioDevice}
                availableAudioDevicesAndroid={call.android_availableAudioDevices}
                currentAudioDeviceAndroid={call.android_currentAudioDevice}
                onSelectAudioDeviceAndroid={call.android_selectAudioDevice}
              /> */}
            </View>

            <View style={styles.bottomButtonGroup}>
              {statusStandby && call.myRole === DirectCallUserRole.CALLEE && (
                <Pressable
                  style={styles.bottomButton}
                  onPress={() => call.accept()}
                  className="bg-red"
                >
                  {/* <SBIcon icon={"btnCallVideoAccept"} size={64} /> */}
                  <FontAwesome5 name="video" size={64} color="white" />
                </Pressable>
              )}
              <Pressable onPress={() => call.end()}>
                {/* <SBIcon icon={"btnCallEnd"} size={64} /> */}
                <FontAwesome5 name="video-slash" size={64} color="white" />
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
