import { Header } from "@/components/Header";
import Text from "@/components/Text";
import apiClient from "@/utils/apiClient";
import colors from "@/utils/colors";
import images from "@/utils/images";
import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConversationListItem from "./components/ConversationListItem";
import { SheetManager } from "react-native-actions-sheet";
import Toast from "react-native-toast-message";
import constants from "@/utils/constants";
import { useAtom, useAtomValue } from "jotai";
import { totalMessageCounterAtom, totalMessageUnreadAtom, userAtom } from "@/actions/global";
import analytics from '@react-native-firebase/analytics'
import Purchases from "react-native-purchases";
import TextInput from "../../components/TextInput";
import { FontAwesome6 } from "@expo/vector-icons";
import AvatarImage from "../../components/AvatarImage";
import SupportListItem from "./components/SupportListItem";
import { totalOtherMessageCounterAtom, totalOtherMessageUnreadAtom, totalSupportMessageCounterAtom, totalSupportMessageUnreadAtom } from "../../actions/global";
import firestore from '@react-native-firebase/firestore';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F3",
  },
});

const MatchesScreen = ({ navigation }) => {
  const currentUser = useAtomValue(userAtom);
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState([]);
  const [unverifyMatches, setUnverifyMatches] = useState([]);
  const [isFetching, setFetching] = useState(false);
  
  // Message counter atoms
  const [unreadCounterMessage, setTotalCounterUnread] = useAtom(totalMessageCounterAtom);
  const [unreadMessage, setUnreadMessage] = useAtom(totalMessageUnreadAtom);
  const [unreadOtherMessage, setTotalOtherUnread] = useAtom(totalOtherMessageCounterAtom);
  const [otherUnread, setOtherUnreadCounter] = useAtom(totalOtherMessageUnreadAtom);
  const [supportUnreadCounter, setSupportUnreadCounter] = useAtom(totalSupportMessageCounterAtom);
  const [supportUnread, setSupportUnread] = useAtom(totalSupportMessageUnreadAtom);
  
  const [isPremium, setIsPremium] = useState(true);
  const [freeTotal, setFreeTotal] = useState(0);
  const [freeCount, setFreeCount] = useState(0);
  const appState = useRef(AppState.currentState);
  const [keyword, setKeyword] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  const [viewMode, setViewMode] = useState("connections");
  const [recentMatches, setRecentMatches] = useState([]);
  
  // Message management state
  const [conversationMessages, setConversationMessages] = useState({});
  const [conversationCallIcons, setConversationCallIcons] = useState({});

  useEffect(() => {
    analytics().logScreenView({
      screen_name: 'MatchesScreen',
      screen_class: 'MatchesScreen'
    })
  }, [])

  useEffect(() => {
    onRefresh();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current &&
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        onRefresh();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let eventListener = DeviceEventEmitter.addListener(constants.REFRESH_SUGGESTIONS, () => {
      onRefresh();
    });

    return () => {
      eventListener.remove();
    };
  }, []);

  // Centralized message listener for all conversation types


  useEffect(() => {
    const allUnsubscribers = {};

    // Helper function to create a listener for a conversation
    const createConversationListener = (conversationId, conversationType) => {
      if (allUnsubscribers[conversationId]) {
        return; // Already listening to this conversation
      }

      const unsubscribe = firestore()
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .onSnapshot(querySnapshot => {
          if (querySnapshot.empty) {
            // Update appropriate unread counter atom based on conversation type
            if (conversationType === 'verified') {
              setTotalCounterUnread((prev) => ({ ...(prev ?? {}), [conversationId]: 0 }));
            } else if (conversationType === 'unverified') {
              setTotalOtherUnread((prev) => ({ ...(prev ?? {}), [conversationId]: 0 }));
            } else if (conversationType === 'support') {
              setSupportUnreadCounter((prev) => ({ ...(prev ?? {}), [conversationId]: 0 }));
            }
          } else {
            const messagesFirestore = querySnapshot.docs.length > 0 ? querySnapshot.docs[0].data() : null;
            
            // Calculate unread count based on user type
            const readByField = (currentUser?.is_support && conversationType === 'support') ? 1 : currentUser?.id;
            const counter = querySnapshot.docs.length - querySnapshot.docs.filter((item) =>
              item.data().readBy.includes(readByField)
            ).length;

            // Update appropriate unread counter atom
            if (conversationType === 'verified') {
              setTotalCounterUnread((prev) => ({ ...(prev ?? {}), [conversationId]: counter }));
            } else if (conversationType === 'unverified') {
              setTotalOtherUnread((prev) => ({ ...(prev ?? {}), [conversationId]: counter }));
            } else if (conversationType === 'support') {
              setSupportUnreadCounter((prev) => ({ ...(prev ?? {}), [conversationId]: counter }));
            }

            // Process message content and call icons
            let lastMessage = null;
            let callIcon = null;

            if (messagesFirestore?.type === 'missed_video_call') {
              lastMessage = 'Missed video call';
              callIcon = {
                source: messagesFirestore?.sendBy === currentUser?.id ? images.video_out_icon : images.video_in_icon,
                tintColor: "#f44336"
              };
            } else if (messagesFirestore?.type === 'missed_voice_call') {
              lastMessage = 'Missed voice call';
              callIcon = {
                source: messagesFirestore?.sendBy === currentUser?.id ? images.call_out_icon : images.call_in_icon,
                tintColor: "#f44336"
              };
            } else if (messagesFirestore?.type === 'video_call') {
              lastMessage = `Video call\n${messagesFirestore.text}`;
              callIcon = {
                source: messagesFirestore?.sendBy === currentUser?.id ? images.video_out_icon : images.video_in_icon
              };
            } else if (messagesFirestore?.type === 'voice_call') {
              lastMessage = `Voice call\n${messagesFirestore.text}`;
              callIcon = {
                source: messagesFirestore?.sendBy === currentUser?.id ? images.call_out_icon : images.call_in_icon
              };
            } else {
              lastMessage = messagesFirestore ? messagesFirestore.text : null;
              callIcon = null;
            }

            // Update conversation messages state
            setConversationMessages(prev => ({
              ...prev,
              [conversationId]: { lastMessage, unreadCount: counter }
            }));
            
            // Update call icons (only for non-support conversations)
            if (conversationType !== 'support') {
              setConversationCallIcons(prev => ({
                ...prev,
                [conversationId]: callIcon
              }));
            }
          }
        });

      allUnsubscribers[conversationId] = unsubscribe;
    };

    // // Set up listeners for verified matches
    // matches.forEach(conversation => {
    //   createConversationListener(conversation.conversation_id, 'verified');
    // });

    // // Set up listeners for unverified matches
    // unverifyMatches.forEach(conversation => {
    //   createConversationListener(conversation.conversation_id, 'unverified');
    // });

    // // Set up listeners for support conversations
    const supportConversations = allUsers.filter(user => user.match_info?.conversation_id);
    // supportConversations.forEach(user => {
    //   createConversationListener(user.match_info.conversation_id, 'support');
    // });

    const MAX_LISTENERS_PER_TYPE = 10;
    const DELAY_BETWEEN_LISTENERS_MS = 100;

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const setupListenersWithDelay = async () => {
      let count = 0;

      // Verified
      for (const conversation of matches.slice(0, MAX_LISTENERS_PER_TYPE)) {
        await delay(count++ * DELAY_BETWEEN_LISTENERS_MS);
        createConversationListener(conversation.conversation_id, 'verified');
      }

      // Unverified
      for (const conversation of unverifyMatches.slice(0, MAX_LISTENERS_PER_TYPE)) {
        await delay(count++ * DELAY_BETWEEN_LISTENERS_MS);
        createConversationListener(conversation.conversation_id, 'unverified');
      }

      // Support
      const supportConversations = allUsers
        .filter(user => user.match_info?.conversation_id)
        .slice(0, MAX_LISTENERS_PER_TYPE);

      for (const user of supportConversations) {
        await delay(count++ * DELAY_BETWEEN_LISTENERS_MS);
        createConversationListener(user.match_info.conversation_id, 'support');
      }
    };

    // Call this inside useEffect
    setupListenersWithDelay();

    // Clean up old listeners for conversations that no longer exist
    const currentConversationIds = new Set([
      ...matches.map(m => m.conversation_id),
      ...unverifyMatches.map(m => m.conversation_id),
      ...supportConversations.map(u => u.match_info.conversation_id)
    ]);

    Object.keys(allUnsubscribers).forEach(conversationId => {
      if (!currentConversationIds.has(conversationId)) {
        allUnsubscribers[conversationId]?.();
        delete allUnsubscribers[conversationId];
        
        // Clean up state for removed conversations
        setConversationMessages(prev => {
          const newState = { ...prev };
          delete newState[conversationId];
          return newState;
        });
        setConversationCallIcons(prev => {
          const newState = { ...prev };
          delete newState[conversationId];
          return newState;
        });
      }
    });

    // Store unsubscribers for cleanup in the return function
    return () => {
      Object.values(allUnsubscribers).forEach(unsubscribe => unsubscribe?.());
    };
  }, [matches, unverifyMatches, allUsers, currentUser?.id, currentUser?.is_support]);

  
  useEffect(() => {
    try {
      let counter = 0;
      let otherCounter = 0;
      let supportCounter = 0;

      for (const match of matches) {
        try {
          counter += unreadCounterMessage[match.conversation_id] ?? 0;
        } catch (error) {
          console.log({ error });
        }
      }
      for (const match of unverifyMatches) {
        try {
          otherCounter += unreadOtherMessage[match.conversation_id] ?? 0;
        } catch (error) {
          console.log({ error });
        }
      }
      for (const match of allUsers) {
        try {
          supportCounter += supportUnreadCounter[match?.match_info?.conversation_id] ?? 0;
        } catch (error) {
          console.log({ error });
        }
      }
      setOtherUnreadCounter(otherCounter)
      setUnreadMessage(counter);
      setSupportUnread(supportCounter);
    } catch (error) {
      console.log({ error });
    }
  }, [matches, unreadCounterMessage, supportUnreadCounter, unreadOtherMessage, allUsers]);

  const loadSubscriptionInfo = async () => {
    try {
      if (currentUser?.is_premium_user || currentUser?.is_moderators) {
        return;
      }

      const customerInfo = await Purchases.getCustomerInfo();
      console.log({ customerInfo: JSON.stringify(customerInfo) });

      if (
        !(
          customerInfo &&
          customerInfo.entitlements &&
          customerInfo.entitlements.active &&
          (
            customerInfo.entitlements.active["pro"] ||
            customerInfo.entitlements.active["pro_3month"]
          )
        )
      ) {
        setIsPremium(false)
      } else {
        setIsPremium(true);
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const sendSupportRequest = (friend_id) => {
    apiClient.post("matches/send-support-request", { friend_id })
      .then((res) => {
        if (res && res.data && res.data.success) {
          navigation.push("MessageScreen", { conversation: res.data.data, is_support: true });
        } else {
          Toast.show({ text1: res.data.message, type: "error" });
        }
      })
      .catch((error) => {
        console.log({ error });
        Toast.show({ text1: error, type: "error" });
      });
  }

  const loadAllUsers = async () => {
    if (currentUser?.is_support) {
      apiClient
        .get("matches/get-all-users")
        .then((res) => {
          setFetching(false);
          console.log({ matches: res.data });
          if (res && res.data && res.data.success) {

            setAllUsers(res.data.data ?? []);
          } else {
            setAllUsers([]);
          }
        })
        .catch((error) => {
          setFetching(false);
          console.log({ error });
          setAllUsers([]);
        });
    } else {
      setAllUsers([])
    }
  }

  const onRefresh = () => {
    setFetching(true);
    loadSubscriptionInfo()
    apiClient
      .get("matches/matches-with-preminum")
      .then((res) => {
        setFetching(false);
        console.log({ matches: res.data });
        if (res && res.data && res.data.success) {

          setMatches(res.data.data.matches ?? []);
          setUnverifyMatches(res.data.data.unverifyMatches ?? []);
          setFreeTotal(res.data.data.freeTotal ?? 0);
          setFreeCount(res.data.data.freeCount ?? 0);
        } else {
          setMatches([]);
        }
      })
      .catch((error) => {
        setFetching(false);
        console.log({ error });
        setMatches([]);
      });

    apiClient
      .get("matches/recent-matches")
      .then((res) => {
        setFetching(false);
        console.log({ matches: res.data });
        if (res && res.data && res.data.success) {
          setRecentMatches(res.data.data);
        } else {
          setRecentMatches([]);
        }
      })
      .catch((error) => {
        setFetching(false);
        console.log({ error });
        setRecentMatches([]);
      });

    loadAllUsers()
  };

  const openChat = (item) => {
    navigation.push("MessageScreen", { conversation: item });
  };

  const openSupportChat = (item) => {
    console.log({ match: item?.match_info })
    if (item?.match_info) {
      navigation.push("MessageScreen", { conversation: item?.match_info, is_support: true });
    } else {
      sendSupportRequest(item.id)
    }
  };

  const renderEmpty = () => {
    return (
      <View
        style={{
          flex: 1,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: Dimensions.get("screen").height * 0.15,
        }}
      >
        <Text
          style={{
            color: "#725ED4",
            fontSize: 28,
            fontWeight: "bold",
            lineHeight: 35,
            textAlign: "center",
          }}
        >{`No Connections Yet?\nNo Worries!`}</Text>
        <Text
          style={{
            color: "#333333",
            fontSize: 16,
            fontWeight: "300",
            textAlign: "center",
            lineHeight: 20,
            marginBottom: Dimensions.get("screen").height * 0.1,
            marginTop: 16,
          }}
        >{`Explore people near you while you wait for your perfect connection`}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("ExploreScreen")}
          style={{
            width: "100%",
            height: 60,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#333333",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Explore Nearby</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const onDisconnect = async (item) => {
    await SheetManager.show("confirm-action-sheets", {
      payload: {
        onCancel: () => {
          apiClient
            .post("matches/disconnect", { friend_id: item.profile.id, id: item.id })
            .then(async (res) => {
              if (res && res.data && res.data.success) {
                Toast.show({ text1: res.data.message, type: "success" });
                onRefresh();
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

  const renderItem = ({ item, index }) => {
    const messageData = conversationMessages[item.conversation_id];
    const callIcon = conversationCallIcons[item.conversation_id];
    
    return (
      <ConversationListItem
        onPress={() => openChat(item)}
        key={`conversation-${item.id}`}
        conversation={item}
        marginBottom={index === matches.length - 1 ? insets.bottom + 70 : 0}
        onDisconnect={() => onDisconnect(item)}
        isPremium={isPremium}
        lastMessage={messageData?.lastMessage}
        unreadCount={messageData?.unreadCount || 0}
        callIcon={callIcon}
      />
    );
  };

  const renderSupportItem = ({ item, index }) => {
    const conversationId = item.match_info?.conversation_id;
    const messageData = conversationId ? conversationMessages[conversationId] : null;
    
    return (
      <SupportListItem
        onPress={() => openSupportChat(item)}
        key={`support-conversation-${item.id}`}
        user={item}
        marginBottom={index === allUsers.length - 1 ? insets.bottom + 70 : 0}
        lastMessage={messageData?.lastMessage}
        unreadCount={messageData?.unreadCount || 0}
      />
    );
  };

  const filterMatches = viewMode === 'connections' ? matches.filter(match => {
    if (keyword.length > 0) {
      return match.profile.full_name.toLowerCase().includes(keyword.toLowerCase())
    }
    return true;
  }
  ) : unverifyMatches.filter(match => {
    if (keyword.length > 0) {
      return match.profile.full_name.toLowerCase().includes(keyword.toLowerCase())
    }

    return true;
  });

  const filterUsers = allUsers.filter(user => {
    if (keyword.length > 0) {
      return user.full_name.toLowerCase().includes(keyword.toLowerCase())
    }
    return true;
  }
  );

  const recentMatchesFilter = !isPremium ? recentMatches.filter(conversation => conversation.is_free) : recentMatches

  const renderHeader = () => {
    if (viewMode === 'others' || viewMode === 'support') return null
    if(recentMatches.length === 0) return null

    return (
      <View style={{ paddingBottom: 3, gap: 8, backgounrcColor: 'transparent' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "black", flex: 1 }}>{`Connections `}
            {!isPremium && <Text style={{ fontSize: 13, color: '#333333' }}>{`(${freeCount}/${freeTotal})`}</Text>}
          </Text>
          {!isPremium &&
            <TouchableOpacity onPress={() => navigation.navigate('PremiumRequestScreen')} style={{ alignItems: 'center', justifyContent: 'center', height: 24, borderRadius: 12, paddingHorizontal: 8, backgroundColor: colors.mainColor }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white' }}>Manage Connections</Text>
            </TouchableOpacity>
          }
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header showLogo rightText="Invite Your Friends" rightAction={() => navigation.navigate('InviteFriendScreen')} />
      <View style={{ paddingTop: 16, paddingBottom: 8, gap: 8, paddingHorizontal: 16, backgounrcColor: 'transparent' }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 10, borderRadius: 5, paddingVertical: 5, alignItems: 'center', backgroundColor: '#E1E1E1' }}>
          <FontAwesome6 name='magnifying-glass' size={16} color='#8C8C8C' />
          <TextInput
            value={keyword}
            onChangeText={text => setKeyword(text)}
            style={{ flex: 1, fontSize: 15, lineHeight: 20, color: '#333333', paddingVertical: 5 }}
            underlineColorAndroid="#00000000"
            placeholder="Search for conversation"
            placeholderTextColor="#8C8C8C"
            clearButtonMode="always"
          />
        </View>
      </View>
      <View style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'white' }}>
        <TouchableOpacity onPress={() => setViewMode('connections')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderBottomWidth: viewMode === 'connections' ? 2 : 0, borderBottomColor: colors.mainColor }}>
          <Text style={{ fontSize: 14, color: "#79797A", fontWeight: 'bold' }}>Connections</Text>
          {!!unreadMessage && unreadMessage > 0 &&
              <View style={{ position: 'absolute', top: -5, right: 0, backgroundColor: '#FFD2D2', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 10, color: 'black', fontWeight: 'bold' }}>{unreadMessage}</Text>
              </View>
            }
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode('others')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderBottomWidth: viewMode === 'others' ? 2 : 0, borderBottomColor: colors.mainColor }}>
          <Text style={{ fontSize: 14, color: "#79797A", fontWeight: 'bold' }}>Others</Text>
          {!!otherUnread && otherUnread > 0 &&
            <View style={{ position: 'absolute', top: -5, right: 0, backgroundColor: '#FFD2D2', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 10, color: 'black', fontWeight: 'bold' }}>{otherUnread}</Text>
            </View>
          }
        </TouchableOpacity>
        {
          currentUser?.is_support &&
          <TouchableOpacity onPress={() => setViewMode('support')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderBottomWidth: viewMode === 'support' ? 2 : 0, borderBottomColor: colors.mainColor }}>
            <Text style={{ fontSize: 14, color: "#79797A", fontWeight: 'bold' }}>Support</Text>
            {!!supportUnread && supportUnread > 0 &&
              <View style={{ position: 'absolute', top: -5, right: 0, backgroundColor: '#FFD2D2', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 10, color: 'black', fontWeight: 'bold' }}>{supportUnread}</Text>
              </View>
            }
          </TouchableOpacity>
        }
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, backgroundColor: 'transparent' }}>
        {
          recentMatchesFilter && recentMatchesFilter.length > 0 && viewMode === 'connections' &&
          <View style={{ paddingTop: 8, paddingBottom: 3, gap: 8, backgounrcColor: 'transparent' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "black", flex: 1 }}>{`Recent Matches`}</Text>
            </View>

            <FlatList
              horizontal
              data={recentMatchesFilter}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ marginRight: 8 }}
                  onPress={() => openChat(item)}>
                  <AvatarImage avatar={item?.profile?.avatar} full_name={item?.profile?.full_name} style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: colors.mainColor }} />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => `recent-${item.id}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}

            />
          </View>
        }
      </View>
      <View style={{ paddingHorizontal: 16, flex: 1, alignItems: 'center' }}>
        {
          (viewMode === 'connections' || viewMode === 'others') &&
          <FlatList
            data={filterMatches}
            renderItem={renderItem}
            style={{ width: Platform.isPad ? 600 : '100%', flex: 1 }}
            ListEmptyComponent={renderEmpty}
            onRefresh={onRefresh}
            refreshing={isFetching}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader}
          />
        }
        {
          (viewMode === 'support') &&
          <FlatList
            data={filterUsers}
            renderItem={renderSupportItem}
            style={{ width: Platform.isPad ? 600 : '100%', flex: 1 }}
            onRefresh={onRefresh}
            refreshing={isFetching}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader}
          />
        }
      </View>
    </View>
  );
};

export default MatchesScreen;
