import { totalMessageCounterAtom, userAtom } from '@/actions/global'
import Text from '@/components/Text'
import colors from '@/utils/colors'
import images from '@/utils/images'
import dayjs from 'dayjs'
import { Image } from 'expo-image'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SwipeRow } from 'react-native-swipe-list-view'
import firestore from '@react-native-firebase/firestore';
import AvatarImage from '@/components/AvatarImage'

const styles = StyleSheet.create({
    standaloneRowBack: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 15,
    },
})

const ConversationListItem = ({ onPress, conversation, marginBottom, onDisconnect }) => {
    const openRowRef = useRef(null);
    const currentUser = useAtomValue(userAtom)

    const [unreadCount, setUnreadCount] = useState(0)
    const [lastMessageCloud, setLastMessage] = useState(conversation?.last_message)
    const [totalUnread, setTotalUnread] = useAtom(totalMessageCounterAtom)

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('conversations')
            .doc(conversation.conversation_id)
            .collection('messages')
            .orderBy('createdAt', 'desc')
            .onSnapshot(querySnapshot => {
                if (querySnapshot.empty) {
                    setTotalUnread((prev) => ({ ...(prev ?? {}), [conversation.conversation_id]: 1 }))
                } else {
                    const messagesFirestore = querySnapshot.docs.length > 0 ? querySnapshot.docs[0].data() : null

                    const counter = querySnapshot.docs.length - querySnapshot.docs.filter((item) => item.data().readBy.includes(currentUser?.id)).length
                    setUnreadCount(counter)
                    setTotalUnread((prev) => ({ ...(prev ?? {}), [conversation.conversation_id]: counter }))
                    setLastMessage(messagesFirestore ? messagesFirestore.text : null);
                }
            });

        return () => unsubscribe();
    }, [conversation.conversation_id]);

    const openDetail = () => {
        if (openRowRef.current) {
            openRowRef.current.closeRow()
            onPress && onPress()
        }
    }

    const onRemove = () => {
        if (openRowRef.current) {
            openRowRef.current.closeRow()
            onDisconnect && onDisconnect()
        }
    }

    let lastMessage = lastMessageCloud
    let lastDate = conversation.last_message_date
    if (!lastMessage) {
        if (conversation.status === 'sent') {
            if (conversation.sender?.id === currentUser?.id) {
                lastMessage = `You have sent a connection request!`
            } else {
                lastMessage = `${conversation.sender?.full_name} wants to connect with you!`
            }

        }
        if (conversation.status === 'accepted') {
            lastMessage = `New match!`
        }
    }
    if (!lastDate) {
        if (conversation.response_date) {
            lastDate = dayjs(conversation.response_date).fromNow()
        } else if (conversation.sent_date) {
            lastDate = dayjs(conversation.sent_date).fromNow()
        }
    } else {
        lastDate = dayjs(lastDate).fromNow()
    }

    return (
        <SwipeRow rightOpenValue={-75} ref={openRowRef}>
            <View style={styles.standaloneRowBack}>
                <TouchableOpacity onPress={onRemove} style={{ marginBottom: marginBottom, gap: 5, width: 47, height: 58, backgroundColor: 'white', borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.delete_icon} style={{ width: 23, height: 23 }} />
                    <Text style={{ color: '#A2A2A2', fontSize: 10 }}>Delete</Text>
                </TouchableOpacity>
            </View>
            <Pressable onPress={openDetail} style={{ backgroundColor: '#F1F1F3', marginBottom: marginBottom, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#78787977', paddingVertical: 16 }}>
                {/* <Image source={{ uri: conversation?.profile?.avatar }} style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: colors.mainColor }} /> */}
                <AvatarImage avatar={conversation?.profile?.avatar} full_name={conversation?.profile?.full_name} style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: colors.mainColor }} />
                <View style={{ flex: 1, gap: 8, marginHorizontal: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>{conversation?.profile?.full_name}</Text>
                    <Text style={{ fontSize: 12, color: !lastMessageCloud ? colors.mainColor : '#6C6C6C', fontWeight: unreadCount > 0 || !lastMessageCloud ? 'bold' : '300' }}>{lastMessage}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 5 }}>
                    <Text style={{ fontSize: 10, color: '#726E70' }}>{lastDate}</Text>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        {unreadCount > 0 &&
                            <View style={{ backgroundColor: colors.mainColor, paddingHorizontal: 12, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 10, color: 'white', fontWeight: '700', fontStyle: 'italic' }}>{`${unreadCount} unread`}</Text>
                            </View>
                        }
                        {
                            !lastMessageCloud && <View style={{ backgroundColor: '#FF8B8B', height: 10, width: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }} />
                        }
                    </View>
                </View>
            </Pressable>
        </SwipeRow>
    )
}

export default ConversationListItem