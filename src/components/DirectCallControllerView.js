import React, { FC, Fragment, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AvatarImage from "@/components/AvatarImage";

import { DirectCallUserRole } from "@sendbird/calls-react-native";

import { useDirectCallDuration } from "@/hooks/useDirectCallDuration";
import AudioDeviceButton from "./AudioDeviceButton";
import Text from "@/components/Text";
import CallIcon from "./CallIcon";
import { CALL_PERMISSIONS, usePermissions } from "@/hooks/usePermissions";
import { BlurView } from 'expo-blur'

// type ControllerViewProps = {
//   status: DirectCallStatus;
//   call: DirectCall;
//   ios_audioDevice: AudioDeviceRoute;
// };
const DirectCallControllerView = ({ status, call, ios_audioDevice }) => {
  const { top } = useSafeAreaInsets();
  usePermissions(CALL_PERMISSIONS);
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
        <View style={{ alignItems: "flex-end", justifyContent: 'center', paddingTop: top }}>
          <View style={{ gap: 16, alignItems: 'center' }}>
            {isVideoCall && statusInProgress && (
              <Pressable onPress={() => call.switchCamera()}>
                <CallIcon icon={"btnCameraFlipIos"} size={48} />
              </Pressable>
            )}
            {statusInProgress && !call.isRemoteAudioEnabled &&
              <CallIcon
                icon={"AudioOff"}
                size={28}
                color={"white"}
              />
            }
          </View>
        </View>
        <View style={styles.information}>
          {((isVoiceCall && statusInProgress) || statusEnded || statusStandby) && (
            <Fragment>

              <StatusView isVideoCall={call.isVideoCall} myRole={call.myRole} statusStandby={statusStandby} statusInProgress={statusInProgress} call={call} />

              <AvatarImage
                full_name={call.remoteUser?.nickname ?? ""}
                style={[{ width: 120, height: 120, borderRadius: 60 }, styles.shadow]}
                avatar={call?.remoteUser?.profileUrl}
              />
              <Text className="text-md text-red" style={styles.nickname}>
                {remoteUserNickname}
              </Text>

            </Fragment>
          )}
          {/* <View style={styles.remoteMuteStatus}>
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
          </View> */}
        </View>
      </View>

      <View style={styles.bottomController}>
        {(statusStandby || statusInProgress) && (
          <>
            <View style={[styles.bottomButtonGroup, { marginBottom: 24, zIndex: 20 }]}>
              <AudioDeviceButton
                currentAudioDeviceIOS={ios_audioDevice}
                availableAudioDevicesAndroid={call.android_availableAudioDevices}
                currentAudioDeviceAndroid={call.android_currentAudioDevice}
                onSelectAudioDeviceAndroid={call.android_selectAudioDevice}
              />

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
              <Pressable
                style={[
                  styles.bottomButton,
                  { borderRadius: 10000 },
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

              <Pressable onPress={() => {
                console.log('end call')
                call.end()
              }}>
                <CallIcon icon={"btnCallEnd"} size={64} />
              </Pressable>
            </View>

            {statusStandby && call.myRole === DirectCallUserRole.CALLEE && (
              <View style={[styles.bottomButtonGroup, { justifyContent: 'space-between', paddingHorizontal: 32, zIndex: 20 }]}>
                <Pressable
                  style={styles.bottomButton}
                  onPress={() => {
                    console.log('end call')
                    call.end()
                  }}
                  className="bg-red"
                >
                  <CallIcon icon={"btnCallDecline"} size={64} />

                  <Text style={styles.responseText}>Decline</Text>
                </Pressable>

                <Pressable style={styles.bottomButton}
                  onPress={() => call.accept()}

                >
                  <CallIcon icon={"btnCallVoiceAccept"} size={64} />
                  <Text style={styles.responseText}>Accept</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const StatusView = ({ call, statusInProgress, statusStandby, myRole, isVideoCall }) => {
  const seconds = useDirectCallDuration(call);

  let textContent = ''
  if (statusStandby) {
    textContent = myRole === DirectCallUserRole.CALLER
      ? "Calling..."
      : `Incoming ${isVideoCall ? "video" : "voice"} call...`
  } else {
    textContent = statusInProgress ? seconds : call.endResult
  }

  return (
    <Text style={{ fontSize: 14, color: 'white', fontWeight: 'bold', marginBottom: 32 }}>{textContent}</Text>
  );
};

const styles = StyleSheet.create({
  topController: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    padding: 16
  },
  information: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 16
  },
  profile: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 32,
  },
  nickname: {
    fontSize: 28,
    fontWeight: "bold",
    color: 'white'
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
    zIndex: 20
  },
  bottomButton: {
    alignItems: 'center',
    gap: 8
  },
  bottomButtonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16
  },
  responseText: {
    fontSize: 10, color: 'white', fontWeight: 'bold'
  },
  shadow: {
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    elevation: 1,
    shadowColor: '#000000',
  }
});

export default DirectCallControllerView;
