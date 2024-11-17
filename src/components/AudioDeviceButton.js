import React, { FC, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

import { AVAudioSessionPort, AudioDeviceType, SendbirdCalls } from "@sendbird/calls-react-native";

import { useIIFE } from "../hooks/useEffectAsync";
import CallIcon from "./CallIcon";
import Text from "./Text";

// type Props = {
//   currentAudioDeviceIOS: AudioDeviceRoute;

//   currentAudioDeviceAndroid?: AudioDeviceType | null;
//   availableAudioDevicesAndroid: AudioDeviceType[];
//   onSelectAudioDeviceAndroid: (audioDevice: AudioDeviceType) => void;
// };
const AudioDeviceButton = ({
  currentAudioDeviceIOS,

  currentAudioDeviceAndroid,
  availableAudioDevicesAndroid = [],
  onSelectAudioDeviceAndroid,
}) => {
  const disabled = useIIFE(() => {
    if (Platform.OS === "ios") {
      // return ios_currentAudioDevice.outputs[0]?.type === AVAudioSessionPort.builtInSpeaker;
    }
    if (Platform.OS === "android") {
      if (availableAudioDevicesAndroid.length === 0) {
        return true;
      }
      // return android_currentAudioDevice === AudioDeviceType.SPEAKERPHONE;
    }
    return false;
  });

  const audioBtn = useIIFE(() => {
    if (Platform.OS === "ios") {
      switch (currentAudioDeviceIOS.outputs[0]?.type) {
        case AVAudioSessionPort.bluetoothLE:
        case AVAudioSessionPort.bluetoothHFP:
        case AVAudioSessionPort.bluetoothA2DP:
          return "btnBluetoothSelected";
        case AVAudioSessionPort.builtInSpeaker:
          return "btnSpeakerSelected";
      }
    }

    if (Platform.OS === "android") {
      switch (currentAudioDeviceAndroid) {
        case AudioDeviceType.BLUETOOTH:
          return "btnBluetoothSelected";
        case AudioDeviceType.SPEAKERPHONE:
          return "btnSpeakerSelected";
      }
    }

    return "btnSpeaker";
  });

  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        disabled={disabled}
        onPress={async () => {
          if (Platform.OS === "android") {
            setVisible(true);
          }
          if (Platform.OS === "ios") {
            SendbirdCalls.ios_routePickerView();
          }
        }}
      >
        <CallIcon icon={audioBtn} size={64} />
      </TouchableOpacity>

      {Platform.OS === "android" && (
        <AudioDeviceSelectModal
          currentDevice={currentAudioDeviceAndroid}
          devices={availableAudioDevicesAndroid}
          visible={visible}
          onSelect={(device) => {
            setVisible(false);
            device && onSelectAudioDeviceAndroid(device);
          }}
        />
      )}
    </>
  );
};

export const AudioDeviceSelectModal = ({ visible, devices, onSelect, currentDevice }) => {
  return (
    <Modal
      transparent
      hardwareAccelerated
      visible={visible}
      style={{ margin: 0 }}
      animationType={"fade"}
      onRequestClose={() => onSelect(null)}
    >
      <View style={menuStyles.container}>
        <View style={menuStyles.body}>
          <Text style={{ padding: 16 }} className="text-xl">
            {"Select audio device"}
          </Text>
          {devices.map((device) => {
            return (
              <Pressable
                key={device}
                android_ripple={{ color: "#742DDD" }}
                onPress={() => onSelect(device)}
                style={menuStyles.button}
              >
                <Text style={{ flex: 1, height: 24 }}>{device?.toLowerCase()}</Text>
                {currentDevice === device && <CallIcon icon={"Done"} />}
              </Pressable>
            );
          })}
          <TouchableOpacity onPress={() => onSelect(null)} style={menuStyles.close}>
            <Text color={"#161616"}>{"Close"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const menuStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  body: {
    borderRadius: 12,
    width: 260,
    backgroundColor: "white",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  close: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AudioDeviceButton;
