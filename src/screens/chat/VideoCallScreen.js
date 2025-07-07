import { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import DirectCallControllerView from "@/components/DirectCallControllerView";
import DirectCallVideoContentView from "@/components/DirectCallVideoContentView";
import { useDirectCall } from "@/hooks/useDirectCall";
import AvatarImage from "@/components/AvatarImage";
import { BlurView } from "expo-blur";
import { useKeepAwake } from 'expo-keep-awake'
import analytics from '@react-native-firebase/analytics'
import { Audio } from "expo-av";

export const VideoCallScreen = ({ route, navigation }) => {
  const { call, status, currentAudioDeviceIOS, callLog } = useDirectCall(route.params.callId);
  useKeepAwake()

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "VideoCallScreen",
      screen_class: "VideoCallScreen",
    })

    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });

  }, [])
  const dialingSoundRef = useRef < Audio.Sound | null > (null);
//   const isDialingPlayingRef = useRef(false);
//  const currentPlayIdRef = useRef(0);
//  const stopDialing = async () => {
//     try {
//       if (dialingSoundRef.current) {
//         await dialingSoundRef.current.stopAsync();
//         await dialingSoundRef.current.unloadAsync();
//         dialingSoundRef.current = null;
//         console.log("Dialing sound stopped");
//       }
//     } catch (err) {
//       console.log("Error stopping dialing sound:", err);
//     }
//  };
  
// useEffect(() => {
//   const playDialing = async () => {
//     if (isDialingPlayingRef.current || dialingSoundRef.current) return;

//     try {
//       const { sound } = await Audio.Sound.createAsync(
//         require("../../assets/sounds/dialing.mp3"),
//         { shouldPlay: true, isLooping: true }
//       );
//       dialingSoundRef.current = sound;
//       isDialingPlayingRef.current = true;
//       await sound.playAsync();
//       console.log("Dialing sound started");
//     } catch (err) {
//       console.log("Error playing dialing sound:", err);
//     }
//   };

//   if (status === "pending") {
//     playDialing();
//   }

//   if (status === "connected" || status === "ended") {
//     stopDialing();
//   }

//   return () => {
//     stopDialing(); // cleanup when component unmounts or status changes
//   };
// }, [status]);


  // useEffect(() => {
  //   if (status === "ended") {
  //     stopDialing();

  //     if (
  //       callLog &&
  //       (callLog.endResult === "DECLINED" || callLog.endResult === "CANCELED") &&
  //       route.params.onMiss
  //     ) {
  //       route.params.onMiss();
  //     }

  //     if (callLog && callLog.endResult === "COMPLETED" && route.params.onFinish) {
  //       route.params.onFinish(callLog.duration);
  //     }

  //     setTimeout(() => {
  //       navigation.goBack();
  //     }, 1000);
  //   }
  // }, [status]);
  
  useEffect(() => {
    // if (status === 'pending') {
    //     const playDialing = async () => {
    //     try {
    //       const { sound } = await Audio.Sound.createAsync(
    //         require('../../assets/sounds/dialing.mp3'),
    //         { shouldPlay: true, isLooping: true }
    //       );
    //       dialingSoundRef.current = sound;
    //       await sound.playAsync();
    //     } catch (err) {
    //       console.log('Error playing dialing sound:', err);
    //     }
    //   };
    //   playDialing();
    // } else {
    //   console.log('Stopping dialing sound');
    //   if (dialingSoundRef.current) {
    //     dialingSoundRef.current.stopAsync().then(() => {
    //       dialingSoundRef.current = null;
    //     }).catch(err => {
    //       console.log('Error stopping dialing sound:', err);
    //     });
    //   }
    // }
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
