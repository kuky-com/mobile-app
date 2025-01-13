import Text from "@/components/Text";
import images from "@/utils/images";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  DeviceEventEmitter,
  Dimensions,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Message,
  Send,
  Composer,
  Time,
  Avatar,
  Day,
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
import { formatCallSeconds } from "../../utils/utils";
import TypingBubble from "../../components/TypingBubble";
import LoadingView from "../../components/LoadingView";
import { NODE_ENV } from "../../utils/apiClient";
import analytics from '@react-native-firebase/analytics'
import OnlineStatus from "../../components/OnlineStatus";

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
    lineHeight: 22,
  },
  rightMessageContainer: {
    backgroundColor: "#E0E1DD",
    borderBottomRightRadius: 2.5,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 15,
  },
  leftMessageContainer: {
    backgroundColor: "#726F70",
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 2.5,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 15,
  },
  botMessageContainer: {
    backgroundColor: "#725ED4",
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 2.5,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 15,
  },
  onlineStatus: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#47F644',
  },
  onlineStatusBg: {
    position: 'absolute', top: -2, right: -2
  },
});

const typingMessageId = 'typing_indicator'

const MessageScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const currentUser = useAtomValue(userAtom);
  const { conversation } = route.params;
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(conversation);
  const appState = useRef(AppState.currentState);
  const [loading, setLoading] = useState(false);
  const showAlert = useAlert();
  const [isTyping, setIsTyping] = useState(false);
  const [isCallAvailable, setIsCallAvailable] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const scrollY = new Animated.Value(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  usePermissions(CALL_PERMISSIONS);

  useEffect(() => {
    analytics().logScreenView({
      screen_name: 'MessageScreen',
      screen_class: 'MessageScreen'
    })
  }, [])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      event => {
        setKeyboardHeight(event.endCoordinates.height);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsHeaderVisible(offsetY <= 0); // Show header when at top
      }
    }
  );

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
          let lastId = null
          querySnapshot.docs.forEach((doc, index) => {
            try {
              const firebaseData = doc.data();
              const data = {
                _id: doc?.id ?? "111",
                text: firebaseData.text,
                createdAt: firebaseData.createdAt.toDate(),
                user: firebaseData.user?._id === 0 ? {
                  _id: 0,
                  name: 'Kuky Bot',
                  avatar: images.bot_avatar,
                } : {
                  _id: firebaseData.user ? firebaseData.user?._id : 0,
                  name: firebaseData.user ? firebaseData.user?.full_name : "",
                  avatar: currentConversation?.profile?.avatar,
                },
                readBy: firebaseData.readBy || [],
                sent: !hadSend,
                type: firebaseData.type,
                received:
                  !hadRead &&
                  (firebaseData.readBy || []).includes(currentConversation?.profile?.id),
                showUserAvatar: lastId !== (firebaseData.user ? firebaseData.user?._id : 0)
              };

              lastId = firebaseData.user ? firebaseData.user?._id : 0

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

  useEffect(() => {
    const getCallStatus = async () => {
      try {
        const res = await apiClient.get(`users/${NODE_ENV}_${conversation.profile?.id}/readyForCall`)
        console.log({ res })
        if (res && res.data && res.data.success) {
          setIsCallAvailable(true)
        } else {
          setIsCallAvailable(false)
        }
      } catch (error) {
        console.log({ error })
        setIsCallAvailable(false)
      }
    }

    getCallStatus()
  }, [])

  useEffect(() => {


    const typingRef = firestore()
      .collection('conversations')
      .doc(conversation.conversation_id)
      .collection('typing')
      .doc(conversation.profile?.id.toString())

    const unsubscribe = typingRef.onSnapshot((doc) => {
      if (doc.exists) {
        const isUserTyping = doc.data().isTyping;
        setIsTyping(isUserTyping);

        if (isUserTyping) {
          setMessages((prevMessages) => {
            if (!prevMessages.find((msg) => msg._id === typingMessageId)) {
              return GiftedChat.append(prevMessages, [
                {
                  _id: typingMessageId,
                  text: '',
                  createdAt: new Date(),
                  user: { _id: conversation.profile?.id },
                  isTyping: true
                },
              ]);
            }
            return prevMessages;
          });
        } else {
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg._id !== typingMessageId)
          );
        }
      }
    })

    return () => unsubscribe();
  }, [currentConversation, currentUser?.id]);

  const renderMessage = (props) => {
    const { currentMessage, previousMessage } = props
    // if (currentMessage.type === 'missed_voice_call' || currentMessage.type === 'missed_video_call' || currentMessage.type === 'voice_call' || currentMessage.type === 'video_call') {
    let contentView = null

    if (currentMessage.isTyping) {
      contentView = (<TypingBubble />)
    } else if (currentMessage.type === 'missed_voice_call') {
      contentView = (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={currentMessage?.user?._id === currentUser?.id ? images.out_voice_call : images.missed_voice_call}
            style={{ width: 30, height: 30 }} contentFit="contain" />
          <TouchableOpacity onPress={() => calling(true)} style={{ gap: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', lineHeight: 20, color: currentMessage?.user?._id !== currentUser?.id ? '#f0f0f0' : 'black' }}>{currentMessage?.user?._id === currentUser?.id ? 'Voice call' : 'Missed voice call'}</Text>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: currentMessage?.user?._id !== currentUser?.id ? '#cccccc' : '#4c4c4c', lineHeight: 20 }}>{currentMessage?.user?._id === currentUser?.id ? 'No answer' : 'tap to call back'}</Text>
              <Text style={{ color: currentMessage?.user?._id !== currentUser?.id ? '#cccccc' : '#A2A2A2', fontSize: 10, lineHeight: 20 }}>{dayjs(currentMessage.createdAt).format('hh:mmA')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )
    } else if (currentMessage.type === 'missed_video_call') {
      contentView = (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={currentMessage?.user?._id === currentUser?.id ? images.out_video_call : images.missed_video_call}
            style={{ width: 30, height: 30 }} contentFit="contain" />
          <TouchableOpacity onPress={() => calling(true)} style={{ gap: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', lineHeight: 20, color: currentMessage?.user?._id !== currentUser?.id ? '#f0f0f0' : 'black' }}>{currentMessage?.user?._id === currentUser?.id ? 'Video call' : 'Missed video call'}</Text>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: currentMessage?.user?._id !== currentUser?.id ? '#cccccc' : '#4c4c4c', lineHeight: 20 }}>{currentMessage?.user?._id === currentUser?.id ? 'No answer' : 'tap to call back'}</Text>
              <Text style={{ color: currentMessage?.user?._id !== currentUser?.id ? '#cccccc' : '#A2A2A2', fontSize: 10, lineHeight: 20 }}>{dayjs(currentMessage.createdAt).format('hh:mmA')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )
    } else if (currentMessage.type === 'video_call' || currentMessage.type === 'voice_call') {
      contentView = (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={currentMessage.type === 'video_call' ? images.out_video_call : images.out_voice_call}
            style={{ width: 30, height: 30 }} contentFit="contain" />
          <View style={{ gap: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', lineHeight: 20, color: currentMessage?.user?._id !== currentUser?.id ? '#f0f0f0' : 'black' }}>{currentMessage.type === 'video_call' ? 'Video call' : 'Voice call'}</Text>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: currentMessage?.user?._id !== currentUser?.id ? '#cccccc' : '#4c4c4c', lineHeight: 20 }}>{currentMessage?.text}</Text>
              <Text style={{ color: currentMessage?.user?._id !== currentUser?.id ? '#cccccc' : '#A2A2A2', fontSize: 10, lineHeight: 20 }}>{dayjs(currentMessage.createdAt).format('hh:mmA')}</Text>
            </View>
          </View>
        </View>
      )
    } else {
      contentView = (
        <View style={{ gap: 1, alignItems: 'flex-end' }}>
          <Text selectable style={{ fontSize: 13, color: currentMessage?.user?._id !== currentUser?.id ? '#f0f0f0' : 'black', lineHeight: 20 }}>{currentMessage?.text}</Text>
          <Text style={{ color: currentMessage?.user?._id !== currentUser?.id ? '#cccccc' : '#A2A2A2', fontSize: 10, lineHeight: 20 }}>{dayjs(currentMessage.createdAt).format('hh:mmA')}</Text>
        </View>
      )
    }

    const isNewDay =
      !previousMessage ||
      new Date(previousMessage.createdAt).toDateString() !==
      new Date(currentMessage.createdAt).toDateString();

    return (
      <View>
        {isNewDay && <Day {...props} />}
        <View style={{
          width: '100%', paddingHorizontal: 8,
          flexDirection: 'row', alignItems: 'center',
          justifyContent: currentMessage?.user?._id === currentUser?.id ? 'flex-end' : 'flex-start',
          gap: 8, paddingBottom: 2, paddingTop: 2
        }}>
          <View style={{ width: 45 }}>
            {
              ((currentMessage.showUserAvatar || currentMessage.isTyping) && currentMessage?.user?._id !== currentUser?.id) && renderAvatar(props)
            }
          </View>
          <View style={[currentMessage?.user?._id === currentUser?.id ? styles.rightMessageContainer : (currentMessage?.user?._id === 0 ? styles.botMessageContainer : styles.leftMessageContainer), {
            maxWidth: Dimensions.get('screen').width - 28 - (currentMessage?.user?._id !== currentUser?.id ? 45 : 0)
          }]}>
            {contentView}
          </View>

          <View style={{ position: 'absolute', bottom: 6, right: 8 }}>
            {!!currentMessage.received && currentMessage.user._id === currentUser?.id && currentUser?.id && (
              <Text style={{ color: "#6C6C6C", fontWeight: "bold", fontSize: 8 }}>Read</Text>
            )}
            {!!currentMessage.sent &&
              !currentMessage.received &&
              currentMessage.user._id === currentUser?.id &&
              currentUser?.id && <Text style={{ color: "#6C6C6C", fontSize: 8 }}>Delivered</Text>}
          </View>
        </View>
      </View>
    )
    // }

    // return <Message {...props} />
  }

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={[
          styles.toolbarContainer,
          { marginBottom: insets.bottom, borderTopWidth: 2, borderTopColor: "black" },
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
          type: 'text'
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
      navigation.navigate("VideoCallScreen", {
        callId: callProps.callId,
        conversation, onMiss: () => missCall(true), onFinish: (duration) => finishCall(true, duration)
      });
    } else {
      navigation.navigate("VoiceCallScreen", {
        callId: callProps.callId, conversation,
        onMiss: () => missCall(false), onFinish: (duration) => finishCall(false, duration)
      });
    }
  };

  const missCall = (isVideo) => {
    firestore()
      .collection("conversations")
      .doc(conversation.conversation_id)
      .collection("messages")
      .add({
        _id: dayjs().unix.toString(),
        text: `Missed ${isVideo ? 'video' : 'voice'} call`,
        createdAt: new Date(),
        user: {
          _id: currentUser?.id,
          name: currentUser?.full_name ?? "",
        },
        readBy: [currentUser?.id],
        type: `missed_${isVideo ? 'video' : 'voice'}_call`
      });

    try {
      apiClient
        .post("matches/last-message", {
          last_message: `Missed ${isVideo ? 'video' : 'voice'} call`,
          conversation_id: conversation.conversation_id,
        })
        .then((res) => {
          // console.log({ res: res.data })
        })
        .catch((error) => {
          console.log({ error });
        });
    } catch (error) { }
  }

  const finishCall = (isVideo, duration) => {
    const text = formatCallSeconds(duration)
    firestore()
      .collection("conversations")
      .doc(conversation.conversation_id)
      .collection("messages")
      .add({
        _id: dayjs().unix.toString(),
        text: text,
        createdAt: new Date(),
        user: {
          _id: currentUser?.id,
          name: currentUser?.full_name ?? "",
        },
        readBy: [currentUser?.id],
        type: `${isVideo ? 'video' : 'voice'}_call`
      });

    try {
      apiClient
        .post("matches/last-message", {
          last_message: `${`${isVideo ? 'Video' : 'Voice'} call`}\n${text}`,
          conversation_id: conversation.conversation_id,
        })
        .then((res) => {
          // console.log({ res: res.data })
        })
        .catch((error) => {
          console.log({ error });
        });
    } catch (error) { }
  }

  const calling = async (isVideoCall) => {
    try {
      await authenticate();
      const callProps = await SendbirdCalls.dial(
        `${NODE_ENV}_${conversation.profile?.id}`,
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
    setLoading(true)
    apiClient
      .post("matches/accept", { friend_id: conversation.profile?.id })
      .then((res) => {
        console.log({ res1111: res })
        setLoading(false)
        DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS);
        if (res && res.data && res.data.success && res.data.data) {
          setCurrentConversation(res.data.data);
          NavigationService.replace("GetMatchScreen", { match: res.data.data });
        } else if (res && res.data && res.data.message) {
          showAlert('Hold on', res.data.message)
        }
      })
      .catch((error) => {
        setLoading(false)
        console.log({ error });
      });
  };

  const rejectAction = () => {
    setLoading(true)
    apiClient
      .post("matches/reject", { friend_id: conversation.profile?.id })
      .then((res) => {
        // console.log({ res })
        setLoading(false)
        DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS);
      })
      .catch((error) => {
        console.log({ error });
        setLoading(false)
      });
    setTimeout(() => {
      navigation.goBack();
    }, 3000);
  };

  const renderHeaderView = () => {
    if (isHeaderVisible)
      return (
        <MessageHeader conversation={currentConversation} rejectAction={rejectAction} likeAction={likeAction} />
      )
    else
      return null
  };

  const renderAvatar = (props) => {
    if (props.currentMessage.user._id === 0) {
      return (
        <TouchableOpacity onPress={() => navigation.navigate("BotProfileScreen")}>
          <Image
            style={{ width: 48, height: 48, borderRadius: 24 }}
            source={images.bot_avatar}
          />
        </TouchableOpacity>

      )
    }

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

  const updateTypingStatus = async (isTyping) => {
    try {
      await firestore()
        .collection('conversations')
        .doc(conversation?.conversation_id)
        .collection('typing')
        .doc(`${currentUser?.id}`)
        .set({ isTyping }, { merge: true });
    } catch (error) {
      console.log({ error });
    }
  }

  const handleTyping = (text) => {
    if (text.length > 0) {
      updateTypingStatus(true)
    } else {
      updateTypingStatus(false)
    }
  }

  const openProfile = () => {
    navigation.push("ConnectProfileScreen", {
      profile: conversation.profile,
      showAcceptReject: false,
    });
  };

  const isRecentOnline = currentConversation?.profile && currentConversation?.profile.last_active_time ? dayjs().diff(dayjs(currentConversation?.profile.last_active_time), 'minutes') < 60 : false

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
              borderColor: isRecentOnline ? '#47F644' : "white",
              borderRadius: 25,
            }}
          />
          {isRecentOnline &&
            <View style={styles.onlineStatusBg}>
              <OnlineStatus isRecentOnline={isRecentOnline} status={currentConversation?.profile?.online_status} radius={12} />
            </View>
          }
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
          {messages.length > 3 && isCallAvailable &&
            <>
              <TouchableOpacity
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
              </TouchableOpacity>
            </>
          }
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
        renderMessage={renderMessage}
        user={{
          _id: currentUser?.id,
          name: currentUser?.full_name ?? "",
        }}
        onInputTextChanged={handleTyping}
        alwaysShowSend
        listViewProps={{
          onScroll: handleScroll,
          scrollEventThrottle: 16,
          contentContainerStyle: {
            flexGrow: 1,
            justifyContent: "flex-start",
            paddingBottom: keyboardHeight,
          },
        }}
      />
      {loading && (
        <LoadingView />
      )}
    </View>
  );
};

export default MessageScreen;
