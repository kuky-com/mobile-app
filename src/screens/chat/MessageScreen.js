import Text from '@/components/Text'
import images from '@/utils/images'
import { Image } from 'expo-image'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GiftedChat, Bubble, InputToolbar, Actions, Send, Composer } from 'react-native-gifted-chat'
import { SheetManager } from 'react-native-actions-sheet'
import { StatusBar } from 'expo-status-bar'
import firestore from '@react-native-firebase/firestore'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/actions/global'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    headerContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 16,
        // height: 60,
        alignItems: 'center',
        width: '100%'
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        gap: 3,
        justifyContent: 'center',
    },
    nameContainer: {
        alignItems: 'center',
        gap: 3,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    backButton: {
        width: 30, height: 30, alignItems: 'center',
        justifyContent: 'center'
    },
    backIcon: {
        width: 20, height: 20,
    },
    nameText: {
        fontSize: 16,
        color: '#696969',
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    moreButton: {
        width: 30, height: 30, alignItems: 'center',
        justifyContent: 'center'
    },
    moreIcon: {
        width: 20, height: 20,
    },
    memberAvatar: {
        width: 18, height: 18, backgroundColor: 'white',
        borderRadius: 9, marginRight: -4,
        alignItems: 'center', justifyContent: 'center'
    },
    emojiButton: {
        width: 30, height: 30, alignItems: 'center',
        justifyContent: 'center'
    },
    emojiIcon: {
        width: 16, height: 16
    },
    sendIcon: {
        width: 20, height: 20, tintColor: '#725ED4'
    },
    sendButton: {
        width: 30, height: 30, alignItems: 'center',
        justifyContent: 'center'
    },
    toolbarContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'black',
        paddingHorizontal: 16, marginLeft: 16, marginRight: 16
    },
    inputContainer: {
        flex: 1,
        paddingVertical: 0,
    },
    inputText: {
        fontSize: 16,
        color: 'black',
        textAlignVertical: 'top'
    }
})

const MessageScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const currentUser = useAtomValue(userAtom)
    const { conversation } = route.params
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('conversations')
            .doc(conversation.conversation_id)
            .collection('messages')
            .orderBy('createdAt', 'desc')
            .onSnapshot(querySnapshot => {
                const messagesFirestore = querySnapshot.docs.map(doc => {
                    const firebaseData = doc.data();

                    const data = {
                        _id: doc.id,
                        text: firebaseData.text,
                        createdAt: firebaseData.createdAt.toDate(),
                        user: {
                            _id: firebaseData.user._id,
                            name: firebaseData.user.name
                        },
                        readBy: firebaseData.readBy || [],
                    };

                    if (!data.readBy.includes(currentUser.id)) {
                        firestore()
                            .collection('conversations')
                            .doc(conversation.conversation_id)
                            .collection('messages')
                            .doc(doc.id)
                            .update({
                                readBy: firestore.FieldValue.arrayUnion(currentUser.id),
                            });

                        firestore()
                            .collection('users')
                            .doc(currentUser.id)
                            .collection('readStatus')
                            .doc(conversation.conversation_id)
                            .set({ lastRead: firestore.FieldValue.serverTimestamp() }, { merge: true });
                    }

                    return data;
                });

                setMessages(messagesFirestore);
            });

        return () => unsubscribe();
    }, [conversation.conversation_id, currentUser.phoneNumber]);

    const renderBubble = (bubbleProps) => {
        return (
            <Bubble
                {...bubbleProps}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#E0E1DD',
                        borderBottomRightRadius: 2.5,
                        borderBottomLeftRadius: 25,
                        borderTopRightRadius: 25,
                        borderTopLeftRadius: 25,
                        paddingHorizontal: 16,
                        paddingVertical: 8
                    },
                    left: {
                        backgroundColor: '#CFC7F7',
                        borderBottomRightRadius: 25,
                        borderBottomLeftRadius: 2.5,
                        borderTopRightRadius: 25,
                        borderTopLeftRadius: 25,
                        paddingHorizontal: 16,
                        paddingVertical: 8
                    }
                }}
                textStyle={{
                    right: {
                        color: 'black',
                    },
                    left: {
                        color: 'black',
                    }
                }}
                tickStyle={{color: 'red',}}
            />
        )
    }

    const renderInputToolbar = (props) => {
        return (
            <InputToolbar
                {...props}
                containerStyle={[styles.toolbarContainer, {marginBottom: insets.bottom + 16}]}
                primaryStyle={{ alignItems: 'center' }}
            />
        )
    }

    const renderComposer = (props) => {
        return (
            <Composer
                {...props}
                textInputStyle={styles.inputText}
                placeholder='Type here ...'
            />
        )
    }

    const renderSend = (props) => {
        return (
            <Send
                {...props}
                disabled={!props.text}
                containerStyle={styles.sendButton}
            >
                <Image source={images.sent_icon} style={styles.sendIcon} contentFit='contain' />
            </Send>
        )
    }

    const onSend = useCallback((messages = []) => {
        const { _id, createdAt, text, user } = messages[0];

        firestore()
            .collection('conversations')
            .doc(conversation.conversation_id)
            .collection('messages')
            .add({
                _id,
                text,
                createdAt,
                user,
                readBy: [user._id],
            });
    }, [conversation.conversation_id]);

    const moreAction = async () => {
        const options = [
            {text: 'Block Users', image: images.delete_icon,}
        ]
      
          await SheetManager.show('action-sheets', {
            payload: {
              actions: options,
              onPress(index) {
                if(index === 0) {
                    
                }
              },
            },
          });
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent style='dark' />
            <View style={{ gap: 8, height: 80 + insets.top, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, backgroundColor: '#725ED4', paddingHorizontal: 16, paddingTop: insets.top, width: '100%', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 35, height: 35, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.back_icon_no_border} style={{ width: 20, height: 20 }} contentFit='contain' />
                </TouchableOpacity>
                <View>
                    <Image source={{ uri: conversation.image }} style={{ width: 50, height: 50, borderWidth: 2, borderColor: 'white', borderRadius: 25, }} />
                </View>
                <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>{conversation.name}</Text>
                <View style={{flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <TouchableOpacity onPress={moreAction} style={{width: 30, height: 30, alignItems: 'center', justifyContent: 'center'}}>
                        <Image source={images.more_icon} style={{width: 20, height: 20}} contentFit='contain'/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{width: '100%', padding: 16, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#D2D2D2', gap: 16}}>
                <Text style={{color: 'black', fontSize: 16}}>{'You matched on June 25th'}</Text>
                <View style={{width: '100%', flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 8}}>
                            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center', padding: 8, borderRadius: 10, backgroundColor: '#7B65E8'}}>
                                <Image source={images.category_icon} style={{width: 16, height: 16}} contentFit='contain'/>
                                <Text style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>Art & Crafts</Text>
                            </View>
                            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center', padding: 8, borderRadius: 10, backgroundColor: '#7B65E8'}}>
                                <Image source={images.category_icon} style={{width: 16, height: 16}} contentFit='contain'/>
                                <Text style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>Cooking</Text>
                            </View>
                            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center', padding: 8, borderRadius: 10, backgroundColor: '#7B65E8'}}>
                                <Image source={images.category_icon} style={{width: 16, height: 16}} contentFit='contain'/>
                                <Text style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>Yoga</Text>
                            </View>
                        </View>
            </View>
            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                renderInputToolbar={renderInputToolbar}
                minInputToolbarHeight={66}
                renderComposer={renderComposer}
                renderSend={renderSend}
                renderBubble={renderBubble}
                user={{
                    _id: 1,
                    name: 'John'
                }}
                alwaysShowSend
            />
        </View>
    )
}

export default MessageScreen