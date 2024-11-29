import Text from "@/components/Text";
import images from "@/utils/images";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  DeviceEventEmitter,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Actions,
  Send,
  Composer,
  Time,
  Avatar,
} from "react-native-gifted-chat";
import { SheetManager } from "react-native-actions-sheet";
import { StatusBar } from "expo-status-bar";
import firestore from "@react-native-firebase/firestore";
import { useAtomValue } from "jotai";
import { userAtom } from "@/actions/global";
import dayjs from "dayjs";
import axios from "axios";
import apiClient from "@/utils/apiClient";
import constants from "@/utils/constants";
import Toast from "react-native-toast-message";
import Purchases from "react-native-purchases";
import NavigationService from "@/utils/NavigationService";
import AvatarImage from "@/components/AvatarImage";
import { useAlert } from "@/components/AlertProvider";
import { VideoIcon, CallIcon } from "@/icons";
import { SendbirdCalls, SoundType } from "@sendbird/calls-react-native";
import { authenticate } from "../../utils/sendbird";
import { CALL_PERMISSIONS, usePermissions } from "@/hooks/usePermissions";
import MessageHeader from "./components/MessageHeader";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 16,
    // height: 60,
    alignItems: "center",
    width: "100%",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    justifyContent: "center",
  },
  nameContainer: {
    alignItems: "center",
    gap: 3,
    justifyContent: "center",
    flexDirection: "row",
  },
  backButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  nameText: {
    fontSize: 16,
    color: "#696969",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  moreButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  moreIcon: {
    width: 20,
    height: 20,
  },
  memberAvatar: {
    width: 18,
    height: 18,
    backgroundColor: "white",
    borderRadius: 9,
    marginRight: -4,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiIcon: {
    width: 16,
    height: 16,
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: "#725ED4",
  },
  sendButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "black",
    paddingHorizontal: 16,
    marginLeft: 16,
    marginRight: 16,
  },
  inputContainer: {
    flex: 1,
    paddingVertical: 0,
    marginTop: 8,
  },
  inputText: {
    fontSize: 16,
    color: "black",
    textAlignVertical: "top",
  },
});

const MessageScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const currentUser = useAtomValue(userAtom);
  const { conversation } = route.params;
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(conversation);
  const appState = useRef(AppState.currentState);
  const [loading, setLoading] = useState(false);
  const showAlert = useAlert();
  usePermissions(CALL_PERMISSIONS);

  const loadSubscriptionInfo = async () => {
    try {
      if (currentUser?.is_premium_user) {
        return;
      }

      const customerInfo = await Purchases.getCustomerInfo();
      // console.log({ customerInfo: JSON.stringify(customerInfo) })

      if (
        !(
          customerInfo &&
          customerInfo.entitlements &&
          customerInfo.entitlements.active &&
          customerInfo.entitlements.active["pro"]
        )
      ) {
        setTimeout(() => {
          NavigationService.replace("PremiumRequestScreen", { conversation });
        }, 500);
      }
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current &&
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        loadSubscriptionInfo();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.profile_approved) {
      showAlert(
        "Your account is almost ready!",
        "While we complete the approval, feel free to browse and get familiar with other profiles. You’ll be connecting soon!",
        [
          {
            text: "Keep Exploring",
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
        () => {
          navigation.goBack();
        },
      );
    }
  }, [currentUser]);

  useEffect(() => {
    if (!conversation.profile) {
      setLoading(true);
      apiClient
        .post("matches/conversation", { conversation_id: conversation.conversation_id })
        .then((res) => {
          if (res && res.data && res.data.success) {
            setLoading(false);
            setCurrentConversation(res.data.data);
          } else {
            Alert.alert("Error", "This chat has ended. You can start a new match!", [
              { text: "Ok", onPress: () => navigation.goBack() },
            ]);
          }
        })
        .catch((error) => {
          console.log({ error });
          setLoading(false);
        });
    }
  }, [conversation]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("conversations")
      .doc(conversation.conversation_id)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .onSnapshot((querySnapshot) => {
        if (querySnapshot) {
          const messagesFirestore = [];
          let hadSend = false;
          let hadRead = false;
          querySnapshot.docs.forEach((doc) => {
            try {
              const firebaseData = doc.data();
              const data = {
                _id: doc?.id ?? "111",
                text: firebaseData.text,
                createdAt: firebaseData.createdAt.toDate(),
                user: {
                  _id: firebaseData.user ? firebaseData.user?._id : 0,
                  name: firebaseData.user ? firebaseData.user?.full_name : "",
                  avatar: currentConversation?.profile?.avatar,
                },
                readBy: firebaseData.readBy || [],
                sent: !hadSend,
                received:
                  !hadRead &&
                  (firebaseData.readBy || []).includes(currentConversation?.profile?.id),
                showUserAvatar: true,
              };

              hadSend = true;
              if ((firebaseData.readBy || []).includes(currentConversation?.profile?.id)) {
                hadRead = true;
              }

              if (!data.readBy.includes(currentUser?.id)) {
                firestore()
                  .collection("conversations")
                  .doc(conversation.conversation_id)
                  .collection("messages")
                  .doc(doc.id)
                  .update({
                    readBy: firestore.FieldValue.arrayUnion(currentUser?.id),
                  });

                firestore()
                  .collection("users")
                  .doc(currentUser?.id)
                  .collection("readStatus")
                  .doc(conversation.conversation_id)
                  .set({ lastRead: firestore.FieldValue.serverTimestamp() }, { merge: true });
              }

              messagesFirestore.push(data);
            } catch (error) {
              console.log({ error });
            }
          });
          setMessages(messagesFirestore);
        }
      });

    return () => unsubscribe();
  }, [currentConversation, currentUser?.id]);

  const renderBubble = (bubbleProps) => {
    return (
      <Bubble
        {...bubbleProps}
        wrapperStyle={{
          right: {
            backgroundColor: "#E0E1DD",
            borderBottomRightRadius: 2.5,
            borderBottomLeftRadius: 10,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 6,
            marginBottom: 15,
          },
          left: {
            backgroundColor: "#CFC7F7",
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 2.5,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 6,
            marginBottom: 15,
          },
        }}
        textStyle={{
          right: {
            color: "black",
          },
          left: {
            color: "black",
          },
        }}
        renderTime={(props) => (
          <Time
            {...props}
            timeTextStyle={{
              left: {
                fontSize: 10,
                color: "#646464",
              },
              right: {
                fontSize: 10,
                color: "#646464",
              },
            }}
          />
        )}
      />
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={[
          styles.toolbarContainer,
          { marginBottom: insets.bottom + 16, borderTopWidth: 2, borderTopColor: "black" },
        ]}
        primaryStyle={{ alignItems: "center" }}
        wrapperStyle={{ borderWidth: 0 }}
        accessoryStyle={{ borderWidth: 0 }}
      />
    );
  };

  const renderComposer = (props) => {
    if (currentConversation.status === "sent" || currentConversation.status === "accepted") {
      return <Composer {...props} textInputStyle={styles.inputText} placeholder="Type here ..." />;
    } else {
      return null;
    }
  };

  const renderSend = (props) => {
    if (currentConversation.status === "sent" || currentConversation.status === "accepted") {
      return (
        <Send {...props} disabled={!props.text} containerStyle={styles.sendButton}>
          <Image source={images.sent_icon} style={styles.sendIcon} contentFit="contain" />
        </Send>
      );
    } else {
      return null;
    }
  };

  const onSend = useCallback(
    async (messages = []) => {
      const { _id, createdAt, text, user } = messages[0];
      firestore()
        .collection("conversations")
        .doc(conversation.conversation_id)
        .collection("messages")
        .add({
          _id,
          text,
          createdAt,
          user,
          readBy: [user._id],
        });

      try {
        apiClient
          .post("matches/last-message", {
            last_message: text,
            conversation_id: conversation.conversation_id,
          })
          .then((res) => {
            // console.log({ res: res.data })
          })
          .catch((error) => {
            console.log({ error });
          });
      } catch (error) { }
    },
    [conversation.conversation_id],
  );
  const onNavigate = (callProps) => {
    if (callProps.isVideoCall) {
      navigation.navigate("VideoCallScreen", { callId: callProps.callId, conversation });
    } else {
      navigation.navigate("VoiceCallScreen", { callId: callProps.callId, conversation });
    }
  };

  const calling = async (isVideoCall) => {
    try {
      await authenticate();
      const callProps = await SendbirdCalls.dial(
        `${process.env.NODE_ENV}_${conversation.profile?.id}`,
        isVideoCall,
      );
      onNavigate(callProps);
    } catch (e) {
      Alert.alert("Failed", e.message);
    }
  };

  const onDisconnect = async () => {
    await SheetManager.show("confirm-action-sheets", {
      payload: {
        onCancel: () => {
          apiClient
            .post("matches/disconnect", { friend_id: conversation.profile.id, id: conversation.id })
            .then(async (res) => {
              // console.log({ res })
              if (res && res.data && res.data.success) {
                Toast.show({ text1: res.data.message, type: "success" });
                DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS);
                setTimeout(() => {
                  navigation.goBack();
                }, 200);
              } else if (res && res.data && res.data.message) {
                Toast.show({ text1: res.data.message, type: "error" });
              }
            })
            .catch((error) => {
              console.log({ error });
              Toast.show({ text1: error, type: "error" });
            });
        },
        onConfirm: () => { },
        cancelText: "End Connection",
        confirmText: "Cancel",
        header: "Do you want to end the connection with this user?",
        title: `Ending the connection will delete all previous messages, and both users will no longer be shown to each other.`,
      },
    });
  };

  const onBlock = async () => {
    await SheetManager.show("confirm-action-sheets", {
      payload: {
        onCancel: () => {
          apiClient
            .post("users/block-user", { friend_id: conversation.profile.id })
            .then((res) => {
              if (res && res.data && res.data.success) {
                DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS);
                Toast.show({ text1: res.data.message, type: "success" });
                setTimeout(() => {
                  navigation.goBack();
                }, 200);
              } else {
                Toast.show({ text1: res?.data?.message ?? "Block action failed!", type: "error" });
              }
            })
            .catch((error) => {
              Toast.show({ text1: error, type: "error" });
            });
        },
        onConfirm: () => { },
        cancelText: "Block",
        confirmText: "Cancel",
        header: "Do you want to block this user?",
        title: `Block user will delete all previous messages, and both users will no longer be shown to each other.`,
      },
    });
  };

  const onReport = async () => {
    const options = [
      { text: "Inappropriate", color: "#333333" },
      { text: "Nudity or sexual activity", color: "#333333" },
      { text: "Violence or threat of violence", color: "#333333" },
      { text: "Hate speech or symbols", color: "#333333" },
      { text: "Bullying or harassment", color: "#333333" },
      { text: "Spam", color: "#333333" },
      { text: "Cancel", style: "cancel-text" },
    ];

    await SheetManager.show("cmd-action-sheets", {
      payload: {
        actions: options,
        title: "Why do you want to report this match?",
        onPress(index) {
          if (index < options.length) {
            apiClient
              .post("users/report-user", {
                reported_id: conversation.profile.id,
                reason: options[index].text,
              })
              .then(async (res) => {
                if (res && res.data && res.data.success) {
                  await SheetManager.show("confirm-action-sheets", {
                    payload: {
                      header: "Thanks for reporting",
                      message:
                        "Your report is private.\nYour report is being investigated and we will take action ASAP",
                      cancelText: "Okay",
                    },
                  });
                } else {
                  Toast.show({
                    text1: res?.data?.message ?? "Report action failed!",
                    type: "error",
                  });
                }
              })
              .catch((error) => {
                Toast.show({ text1: error, type: "error" });
              });
          }
        },
      },
    });
  };

  const moreAction = async () => {
    const options = [
      { text: "Leave a Review", color: "#5E30C1" },
      { text: "End Connection", color: "#FF2323" },
      { text: "Report", color: "#FF2323" },
      { text: "Block", color: "#FF2323" },
      { text: "Cancel", style: "cancel" },
    ];

    await SheetManager.show("cmd-action-sheets", {
      payload: {
        actions: options,
        onPress(index) {
          if (index === 0) {
            onReview();
          } else if (index === 1) {
            onDisconnect();
          } else if (index === 2) {
            onReport();
          } else if (index === 3) {
            onBlock();
          }
        },
      },
    });
  };

  const onReview = () => {
    navigation.push("ReviewMatchScreen", { profile: currentConversation.profile });
  };

  const likeAction = () => {
    apiClient
      .post("matches/accept", { friend_id: conversation.profile?.id })
      .then((res) => {
        console.log({ res })
        DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS);
        if (res && res.data && res.data.success && res.data.data) {
          setCurrentConversation(res.data.data);
          NavigationService.replace("GetMatchScreen", { match: res.data.data });
        }
      })
      .catch((error) => {
        console.log({ error });
      });
  };

  const rejectAction = () => {
    apiClient
      .post("matches/reject", { friend_id: conversation.profile?.id })
      .then((res) => {
        // console.log({ res })
        DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS);
      })
      .catch((error) => {
        console.log({ error });
      });
    setTimeout(() => {
      navigation.goBack();
    }, 3000);
  };

  const renderHeaderView = () => {
    return(
      <MessageHeader conversation={currentConversation} rejectAction={rejectAction} likeAction={likeAction} />
    )
  };

  const renderAvatar = (props) => {
    return (
      <TouchableOpacity
        onPress={openProfile}
        style={{ width: 48, height: 48, borderWidth: 2, borderColor: "#aaaaaa", borderRadius: 24 }}
      >
        {/* <Image source={{ uri: currentConversation?.profile?.avatar }} style={{ width: 44, height: 44, borderRadius: 22, }} /> */}
        <AvatarImage
          full_name={currentConversation?.profile?.full_name ?? ""}
          style={{ width: 44, height: 44, borderRadius: 22 }}
          avatar={currentConversation?.profile?.avatar}
        />
      </TouchableOpacity>
    );
  };

  const openProfile = () => {
    navigation.push("ConnectProfileScreen", {
      profile: conversation.profile,
      showAcceptReject: false,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent style="dark" />
      <View
        style={{
          gap: 8,
          height: 80 + insets.top,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          backgroundColor: "#725ED4",
          paddingHorizontal: 16,
          paddingTop: insets.top,
          width: "100%",
          alignItems: "center",
          justifyContent: "flex-start",
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 35, height: 35, alignItems: "center", justifyContent: "center" }}
        >
          <Image
            source={images.back_icon_no_border}
            style={{ width: 20, height: 20 }}
            contentFit="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={openProfile}>
          {/* <Image source={{ uri: currentConversation?.profile?.avatar }} style={{ width: 50, height: 50, borderWidth: 2, borderColor: 'white', borderRadius: 25, }} /> */}
          <AvatarImage
            full_name={currentConversation?.profile?.full_name ?? ""}
            avatar={currentConversation?.profile?.avatar}
            style={{
              width: 50,
              height: 50,
              borderWidth: 2,
              borderColor: "white",
              borderRadius: 25,
            }}
          />
        </TouchableOpacity>
        <Text onPress={openProfile} style={{ flex: 1, fontSize: 18, color: "white", fontWeight: "bold" }}>
          {currentConversation?.profile?.full_name}
        </Text>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          {/* <TouchableOpacity
            onPress={() => calling(false)}
            style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}
          >
            <CallIcon />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => calling(true)}
            style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}
          >
            <VideoIcon />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={moreAction}
            style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}
          >
            <Image
              source={images.more_icon}
              style={{ width: 20, height: 20 }}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
      {renderHeaderView()}
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        renderInputToolbar={renderInputToolbar}
        minInputToolbarHeight={66}
        renderComposer={renderComposer}
        renderSend={renderSend}
        renderAvatar={renderAvatar}
        renderTicks={(currentMessage) => {
          const tickedUser = currentMessage.user._id;
          console.log({ currentMessage });
          return (
            <View style={{ position: "absolute", bottom: -20, right: -8 }}>
              {!!currentMessage.received && tickedUser === currentUser?.id && currentUser?.id && (
                <Text style={{ color: "#6C6C6C", fontWeight: "bold", fontSize: 8 }}>Read</Text>
              )}
              {!!currentMessage.sent &&
                !currentMessage.received &&
                tickedUser === currentUser?.id &&
                currentUser?.id && <Text style={{ color: "#6C6C6C", fontSize: 8 }}>Delivered</Text>}
            </View>
          );
        }}
        renderTime={(props) => (
          <Time
            {...props}
            timeTextStyle={{
              left: {
                fontSize: 10,
                color: "#646464",
              },
              right: {
                fontSize: 10,
                color: "#646464",
              },
            }}
          />
        )}
        renderBubble={renderBubble}
        user={{
          _id: currentUser?.id,
          name: currentUser?.full_name ?? "",
        }}
        alwaysShowSend
      />
      {loading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "#000000ee", alignItems: "center", justifyContent: "center" },
          ]}
        >
          <ActivityIndicator color="white" />
        </View>
      )}
    </View>
  );
};

export default MessageScreen;
