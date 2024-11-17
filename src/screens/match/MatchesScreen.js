import { Header } from "@/components/Header";
import Text from "@/components/Text";
import apiClient from "@/utils/apiClient";
import colors from "@/utils/colors";
import images from "@/utils/images";
import dayjs from "dayjs";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConversationListItem from "./components/ConversationListItem";
import { SheetManager } from "react-native-actions-sheet";
import Toast from "react-native-toast-message";
import constants from "@/utils/constants";
import { useAtomValue, useSetAtom } from "jotai";
import { totalMessageCounterAtom, totalMessageUnreadAtom, userAtom } from "@/actions/global";

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
  const [isFetching, setFetching] = useState(false);
  const unreadMessage = useAtomValue(totalMessageCounterAtom);
  const setUnreadCounter = useSetAtom(totalMessageUnreadAtom);

  useEffect(() => {
    onRefresh();
  }, []);

  useEffect(() => {
    let eventListener = DeviceEventEmitter.addListener(constants.REFRESH_SUGGESTIONS, (event) => {
      onRefresh();
    });

    return () => {
      eventListener.remove();
    };
  }, []);

  useEffect(() => {
    try {
      let counter = 0;
      for (const match of matches) {
        try {
          counter += unreadMessage[match.conversation_id] ?? 0;
        } catch (error) {
          console.log({ error });
        }
      }
      setUnreadCounter(counter);
    } catch (error) {
      console.log({ error });
    }
  }, [matches, unreadMessage]);

  const onRefresh = () => {
    setFetching(true);
    apiClient
      .get("matches/matches")
      .then((res) => {
        setFetching(false);
        if (res && res.data && res.data.success) {
          setMatches(res.data.data);
        } else {
          setMatches([]);
        }
      })
      .catch((error) => {
        setFetching(false);
        console.log({ error });
        setMatches([]);
      });
  };

  const openChat = (item) => {
    navigation.push("MessageScreen", { conversation: item });
  };

  const renderHeader = () => {
    return (
      <View style={{ paddingVertical: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "black" }}>Connections</Text>
      </View>
    );
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
        onConfirm: () => {},
        cancelText: "End Connection",
        confirmText: "Cancel",
        header: "Do you want to end the connection with this user?",
        title: `Ending the connection will delete all previous messages, and both users will no longer be shown to each other.`,
      },
    });
  };

  const renderItem = ({ item, index }) => {
    return (
      <ConversationListItem
        onPress={() => openChat(item)}
        key={`conversation-${item.id}`}
        conversation={item}
        marginBottom={index === matches.length - 1 ? insets.bottom + 70 : 0}
        onDisconnect={() => onDisconnect(item)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header showLogo />
      <FlatList
        data={matches}
        renderItem={renderItem}
        style={{ paddingHorizontal: 16, flex: 1 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        onRefresh={onRefresh}
        refreshing={isFetching}
      />
    </View>
  );
};

export default MatchesScreen;
