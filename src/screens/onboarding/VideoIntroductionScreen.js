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
    Linking,
    Pressable,
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
    Actions,
} from "react-native-gifted-chat";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import { userAtom } from "@/actions/global";
import dayjs from "dayjs";
import TypingBubble from "../../components/TypingBubble";
import analytics from '@react-native-firebase/analytics'
import OnlineStatus from "../../components/OnlineStatus";
import Hyperlink from 'react-native-hyperlink'
import ButtonWithLoading from "../../components/ButtonWithLoading";
import NavigationService from '@/utils/NavigationService'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#725ED4",
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
        flex: 1
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
        backgroundColor: "#333333",
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


const VideoIntroductionScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const currentUser = useAtomValue(userAtom);
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'VideoIntroductionScreen',
            screen_class: 'VideoIntroductionScreen'
        })
    }, [])

    const renderMessage = (props) => {
        const { currentMessage, previousMessage } = props
        let contentView = null

        if (isTyping) {
            contentView = (<TypingBubble />)
        } else {
            contentView = (
                <View style={{ gap: 1, alignItems: 'flex-end', paddingVertical: 8, paddingHorizontal: 8 }}>
                    <Hyperlink
                        onPress={(url) => Linking.openURL(url)}
                        linkStyle={{ color: "#2980b9" }}>
                        <Text selectable style={{ fontSize: 13, color: currentMessage?.user?._id !== currentUser?.id ? '#f0f0f0' : 'black', lineHeight: 20 }}>{currentMessage?.text}</Text>
                    </Hyperlink>
                    {/* <Text style={{ color: currentMessage?.user?._id !== currentUser?.id ? '#cccccc' : '#A2A2A2', fontSize: 10, lineHeight: 20 }}>{dayjs(currentMessage.createdAt).format('hh:mmA')}</Text> */}
                </View>
            )
        }

        return (
            <View>
                <View style={{
                    width: '100%', paddingHorizontal: 8,
                    flexDirection: 'row', alignItems: 'center',
                    justifyContent: currentMessage?.user?._id === currentUser?.id ? 'flex-end' : 'flex-start',
                    gap: 8, paddingBottom: 2, paddingTop: 2
                }}>
                    <View style={{ width: 45 }}>
                        {
                            ((currentMessage.showUserAvatar || currentMessage.isTyping) && currentMessage?.user?._id !== currentUser?.id) &&
                            <View style={{
                                width: 30, height: 30, borderRadius: 15, backgroundColor: '#333333',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                {renderAvatar(props)}
                            </View>
                        }
                    </View>
                    <View style={[currentMessage?.user?._id === currentUser?.id ? styles.rightMessageContainer : (currentMessage?.user?._id === 0 ? styles.botMessageContainer : styles.leftMessageContainer), {
                        maxWidth: Dimensions.get('screen').width - 28 - (currentMessage?.user?._id !== currentUser?.id ? 45 : 0)
                    }, currentMessage.type === 'image' ? { backgroundColor: 'transparent' } : {}]}>
                        {contentView}
                    </View>
                </View>
            </View>
        )
    }

    const renderAvatar = (props) => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate("BotProfileScreen")}>
                <Image
                    style={{ width: 18, height: 18 }}
                    source={images.happy_cloud}
                    contentFit="contain"
                />
            </TouchableOpacity>

        )
    };

    useEffect(() => {
        setIsTyping(true)

        setMessages([
            {
                text: ``,
                user: {
                    _id: 0,
                    name: 'Kuky',
                    avatar: images.happy_cloud,
                },
                showUserAvatar: true,
                createdAt: dayjs(),
                _id: 1,
            }
        ])

        if (!currentUser?.video_intro) {
            setTimeout(() => {

                setIsTyping(false)
                setMessages([
                    {
                        text: `Ready to share your story?\nWe’ll ask you a few fun questions. Just be yourself 😊`,
                        user: {
                            _id: 0,
                            name: 'Kuky',
                            avatar: images.happy_cloud,
                        },
                        showUserAvatar: true,
                        createdAt: dayjs(),
                        _id: 1,
                    }
                ])
            }, 1000);
    
            setTimeout(() => {
                setMessages([
                    {
                        text: `Ready to share your story?\nWe’ll ask you a few fun questions. Just be yourself 😊`,
                        user: {
                            _id: 0,
                            name: 'Kuky',
                            avatar: images.happy_cloud,
                        },
                        showUserAvatar: true,
                        createdAt: dayjs(),
                        _id: 1,
                    },
                    {
                        text: 'Let’s Start 🚀',
                        user: {
                            _id: 0,
                            name: 'Kuky',
                            avatar: images.happy_cloud,
                        },
                        createdAt: dayjs().add(1, 'second'),
                        _id: 2,
                    },
                ].reverse())
            }, 2000);
        } else if (!currentUser?.video_why) {
            setTimeout(() => {

                setIsTyping(false)
                setMessages([
                    {
                        text: `Why did you join Kuky? \nWhat are you hoping to get from this?`,
                        user: {
                            _id: 0,
                            name: 'Kuky',
                            avatar: images.happy_cloud,
                        },
                        showUserAvatar: true,
                        createdAt: dayjs(),
                        _id: 1,
                    }
                ])
            }, 1000);
        } else if (!currentUser?.video_challenge) {
            setTimeout(() => {

                setIsTyping(false)
                setMessages([
                    {
                        text: `Now, let’s go a little deeper. \nWhat’s a challenge you’ve been facing?`,
                        user: {
                            _id: 0,
                            name: 'Kuky',
                            avatar: images.happy_cloud,
                        },
                        showUserAvatar: true,
                        createdAt: dayjs(),
                        _id: 1,
                    }
                ])
            }, 1000);
        } else if (!currentUser?.video_purpose) {
            setTimeout(() => {

                setIsTyping(false)
                setMessages([
                    {
                        text: `What’s something you’re working towards? Let’s hear your aspirations!`,
                        user: {
                            _id: 0,
                            name: 'Kuky',
                            avatar: images.happy_cloud,
                        },
                        showUserAvatar: true,
                        createdAt: dayjs(),
                        _id: 1,
                    }
                ])
            }, 1000);
        } else if (!currentUser?.video_interests) {
            setTimeout(() => {

                setIsTyping(false)
                setMessages([
                    {
                        text: `What’s something unique about you? A hobby, fun fact, or favorite quote?`,
                        user: {
                            _id: 0,
                            name: 'Kuky',
                            avatar: images.happy_cloud,
                        },
                        showUserAvatar: true,
                        createdAt: dayjs(),
                        _id: 1,
                    }
                ])
            }, 1000);
        }
    }, [])

    const onContinue = () => {
        if(!currentUser?.video_intro) {
            NavigationService.reset('OnboardingVideoScreen', {recording_type: 'intro'})
        } else if (!currentUser?.video_why) {
            NavigationService.reset('OnboardingVideoScreen', {recording_type: 'why'})
        } else if (!currentUser?.video_challenge) {
            NavigationService.reset('OnboardingVideoScreen', {recording_type: 'challenge'})
        } else if (!currentUser?.video_purpose) {
            NavigationService.reset('OnboardingVideoScreen', {recording_type: 'purpose'})
        } else if (!currentUser?.video_interests) {
            NavigationService.reset('OnboardingVideoScreen', {recording_type: 'interests'})
        }
        
    }

    let title = 'This is What Makes Kuky Special!'

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar translucent style="dark" />
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 16 }}>
                <Image
                    source={images.happy_cloud}
                    style={{ width: 60, height: 60 }}
                    contentFit="contain"
                />
                <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>{title}</Text>
            </View>

            <GiftedChat
                messages={messages}
                renderInputToolbar={() => <View />}
                renderMessage={renderMessage}
                user={{
                    _id: currentUser?.id,
                    name: currentUser?.full_name ?? "",
                }}
                listViewProps={{ contentContainerStyle: { flexGrow: 1, justifyContent: "flex-end" } }}
                forceGetKeyboardDismissed={() => false}
            />

            <View style={{width: '100%', paddingHorizontal: 16, gap: 16}}>
            <ButtonWithLoading
                text={!currentUser?.video_intro ? 'I’m Ready!' : 'Let’s Do This!'} 
                onPress={onContinue}
            />
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', padding: 8 }}
                    onPress={() => NavigationService.reset('Dashboard')}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#F1F1F3' }}>I’ll do this later</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
    )
};

export default VideoIntroductionScreen;
