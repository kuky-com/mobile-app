import { Header } from "@/components/Header";
import Text from "@/components/Text";
import apiClient from "@/utils/apiClient";
import colors from "@/utils/colors";
import images from "@/utils/images";
import dayjs from "dayjs";
import { Image } from "expo-image";
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
import { useAtomValue, useSetAtom } from "jotai";
import { totalMessageCounterAtom, totalMessageUnreadAtom, userAtom } from "@/actions/global";
import analytics from '@react-native-firebase/analytics'
import Purchases from "react-native-purchases";
import TextInput from "../../components/TextInput";
import { FontAwesome6 } from "@expo/vector-icons";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F1F3",
    },
});

const UnverifiedMatchesScreen = ({ navigation }) => {
    const currentUser = useAtomValue(userAtom);
    const insets = useSafeAreaInsets();
    const [matches, setMatches] = useState([]);
    const [isFetching, setFetching] = useState(false);
    const unreadMessage = useAtomValue(totalMessageCounterAtom);
    const setUnreadCounter = useSetAtom(totalMessageUnreadAtom);
    const [isPremium, setIsPremium] = useState(true);
    const appState = useRef(AppState.currentState);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'UnverifiedMatchesScreen',
            screen_class: 'UnverifiedMatchesScreen'
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
                loadSubscriptionInfo();
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
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

    const loadSubscriptionInfo = async () => {
        try {
            if (currentUser?.is_premium_user || currentUser?.is_moderators) {
                return;
            }

            const customerInfo = await Purchases.getCustomerInfo();

            if (
                !(
                    customerInfo &&
                    customerInfo.entitlements &&
                    customerInfo.entitlements.active &&
                    customerInfo.entitlements.active["pro"]
                )
            ) {
                setIsPremium(false)
            }
        } catch (error) {
            console.log({ error });
        }
    };

    const onRefresh = () => {
        setFetching(true);
        loadSubscriptionInfo()
        apiClient
            .get("matches/unverified-matches")
            .then((res) => {
                setFetching(false);
                console.log({ matches: res.data });
                if (res && res.data && res.data.success) {

                    setMatches(res.data.data.matches ?? []);
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

    const renderEmpty = () => {
        return (
            <View
                style={{
                    flex: 1,
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: Dimensions.get("screen").height * 0.15,
                    gap: 48
                }}
            >
                <Text
                    style={{
                        color: "#725ED4",
                        fontSize: 22,
                        fontWeight: "bold",
                        lineHeight: 35,
                        textAlign: "center",
                    }}
                >{`There is no unverifed matches conversation`}</Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        width: "100%",
                        height: 60,
                        borderRadius: 30,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#333333",
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Go Back</Text>
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
        return (
            <ConversationListItem
                onPress={() => openChat(item)}
                key={`conversation-${item.id}`}
                conversation={item}
                marginBottom={index === matches.length - 1 ? insets.bottom + 70 : 0}
                onDisconnect={() => onDisconnect(item)}
                isPremium={isPremium}
            />
        );
    };

    const filterMatches = matches.filter(match => {
        if (keyword.length > 0) {
            return match.profile.full_name.toLowerCase().includes(keyword.toLowerCase())
        }
        return true;
    }
    )

    const renderHeader = () => {
        return (
            <View style={{ paddingBottom: 8, gap: 8, backgounrcColor: 'transparent' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                    <Text style={{ fontSize: 20, fontWeight: "700", color: "black", flex: 1 }}>{`Unverified Matches`}</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Header showLogo leftIcon={images.back_icon} leftAction={() => navigation.goBack()} />
            <View style={{ paddingTop: 16, paddingBottom: 8, gap: 8, paddingHorizontal: 16, backgounrcColor: 'transparent' }}>
                <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 10, borderRadius: 5, paddingVertical: 5, alignItems: 'center', backgroundColor: '#E1E1E1' }}>
                    <FontAwesome6 name='magnifying-glass' size={16} color='#8C8C8C' />
                    <TextInput
                        value={keyword}
                        onChangeText={text => setKeyword(text)}
                        style={{ flex: 1, fontSize: 15, lineHeight: 20, color: '#333333', paddingVertical: 5 }}
                        underlineColorAndroid="#00000000"
                        placeholder="Search for keyword"
                        placeholderTextColor="#8C8C8C"
                        clearButtonMode="always"
                    />
                </View>
            </View>
            <View style={{ paddingHorizontal: 16, flex: 1, alignItems: 'center' }}>
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
            </View>
        </View>
    );
};

export default UnverifiedMatchesScreen;
