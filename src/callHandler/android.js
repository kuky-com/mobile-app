// import { EventType } from "@notifee/react-native/src/types/Notification";
import messaging from "@react-native-firebase/messaging";

import { SendbirdCalls } from "@sendbird/calls-react-native";

// import { RunAfterAppReady } from "../libs/StaticNavigation";
// import { DirectRouteWithParams, DirectRoutes } from "../navigations/routes";

/** Firebase RemoteMessage handler **/
export function setFirebaseMessageHandlers() {
  const firebaseListener = async (message) => {
    SendbirdCalls.android_handleFirebaseMessageData(message.data);
  };
  messaging().setBackgroundMessageHandler(firebaseListener);
  messaging().onMessage(firebaseListener);
}

/** Notifee ForegroundService with Notification */
export const NOTIFICATION_CHANNEL_ID = "sendbird.calls.rn.ringing";
export async function setNotificationForegroundService() {
  // Create channel
  //TODO: THIS
  // await Notifee.createChannel({
  //   name: "Ringing",
  //   id: NOTIFICATION_CHANNEL_ID,
  //   importance: AndroidImportance.HIGH,
  // });

  // Register foreground service, NOOP
  // TODO: HERE?
  //Notifee.registerForegroundService(async (notification) => new Promise(() => notification));

  // Register notification listeners
  const onNotificationAction = async ({ type, detail }) => {
    // if (type !== EventType.ACTION_PRESS || !detail.notification?.data?.call) {
    //   return;
    // }

    const callString = detail.notification.data.call;
    const callProps = JSON.parse(callString);

    const directCall = await SendbirdCalls.getDirectCall(callProps.callId);
    if (directCall.isEnded) {
      // TODO: HERE?
      //return Notifee.stopForegroundService();
    }

    // if (detail.pressAction?.id === "accept") {
    //   RunAfterAppReady < DirectRoutes,
    //     DirectRouteWithParams >
    //       ((navigation) => {
    //         if (directCall.isVideoCall) {
    //           navigation.navigate(DirectRoutes.VIDEO_CALLING, { callId: directCall.callId });
    //         } else {
    //           navigation.navigate(DirectRoutes.VOICE_CALLING, { callId: directCall.callId });
    //         }
    //         directCall.accept();
    //       });
    // } else if (detail.pressAction?.id === "decline") {
    //   await directCall.end();
    // }
  };
  // TODO: HERE
  // Notifee.onBackgroundEvent(onNotificationAction);
  // Notifee.onForegroundEvent(onNotificationAction);
}

export async function startRingingWithNotification(call) {
  const directCall = await SendbirdCalls.getDirectCall(call.callId);
  const callType = call.isVideoCall ? "Video" : "Voice";

  // Accept only one ongoing call
  const onGoingCalls = await SendbirdCalls.getOngoingCalls();
  if (onGoingCalls.length > 1) {
    return directCall.end();
  }

  // TODO: Display Notification for action
  // await Notifee.displayNotification({
  //   id: call.callId,
  //   title: `${callType} Call from ${call.remoteUser?.nickname ?? "Unknown"}`,
  //   data: { call: JSON.stringify(call) },
  //   android: {
  //     ongoing: true,
  //     asForegroundService: true,
  //     channelId: NOTIFICATION_CHANNEL_ID,
  //     actions: [
  //       { title: "Accept", pressAction: { id: "accept", launchActivity: "default" } },
  //       { title: "Decline", pressAction: { id: "decline" } },
  //     ],
  //   },
  // });

  const unsubscribe = directCall.addListener({
    // Update notification on established
    onEstablished() {
      //TODO: Notification
      // return Notifee.displayNotification({
      //   id: call.callId,
      //   title: `${callType} Call with ${directCall.remoteUser?.nickname ?? "Unknown"}`,
      //   data: { call: JSON.stringify(call) },
      //   android: {
      //     ongoing: true,
      //     asForegroundService: true,
      //     channelId: NOTIFICATION_CHANNEL_ID,
      //     actions: [{ title: "End", pressAction: { id: "decline" } }],
      //     timestamp: Date.now(),
      //     showTimestamp: true,
      //     showChronometer: true,
      //   },
      // });
    },
    // Remove notification on ended
    onEnded() {
      // TODO: HERE
      // Notifee.stopForegroundService();
      unsubscribe();
    },
  });
}
