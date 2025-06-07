import { userAtom } from '@/actions/global'
import Text from '@/components/Text'
import colors from '@/utils/colors'
import images from '@/utils/images'
import dayjs from 'dayjs'
import { Image } from 'expo-image'
import { useAtomValue } from 'jotai'
import React, { useRef } from 'react'
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SwipeRow } from 'react-native-swipe-list-view'
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

const ConversationListItem = ({ onPress, isPremium, conversation, marginBottom, onDisconnect, lastMessage: lastMessageProp, unreadCount: unreadCountProp, callIcon: callIconProp }) => {
    const openRowRef = useRef(null);
    const currentUser = useAtomValue(userAtom)

    // Use props if available, otherwise fall back to conversation data
    const unreadCount = unreadCountProp ?? 0;
    const lastMessageCloud = lastMessageProp ?? conversation?.last_message;
    const callIcon = callIconProp ? (
        <Image 
            source={callIconProp.source} 
            style={{ 
                width: 16, 
                height: 16, 
                ...(callIconProp.tintColor && { tintColor: callIconProp.tintColor })
            }} 
        />
    ) : null;

    const openDetail = () => {
        if (openRowRef.current) {
            openRowRef.current.closeRow()
        }

        onPress && onPress()
    }

    const onRemove = () => {
        if (openRowRef.current) {
            openRowRef.current.closeRow()
        }

        onDisconnect && onDisconnect()
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
            lastDate = dayjs(conversation.response_date).fromNow(true)
        } else if (conversation.sent_date) {
            lastDate = dayjs(conversation.sent_date).fromNow(true)
        }
    } else {
        lastDate = dayjs(lastDate).fromNow(true)
    }

    if (!isPremium && !conversation.is_free) {
        return (
            <Pressable onPress={openDetail} style={{ backgroundColor: '#F1F1F3', marginBottom: marginBottom, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#78787977', paddingVertical: 16 }}>
                <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: colors.mainColor, alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        style={{ width: 40, height: 40 }}
                        source={images.happy_cloud}
                        contentFit='contain'
                    />
                </View>
                <View style={{ flex: 1, gap: 8, marginHorizontal: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>{'Kuky'}</Text>
                    <Text numberOfLines={2} style={{ fontSize: 12, lineHeight: 18, color: colors.mainColor, fontWeight: 'bold' }}>{'Unlock to see the message'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 5 }}>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ opacity: unreadCount > 0 ? 1 : 0, backgroundColor: colors.mainColor, paddingHorizontal: 12, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10, color: 'white', fontWeight: '700', fontStyle: 'italic' }}>{`${unreadCount} unread`}</Text>
                        </View>
                        {
                            !lastMessageCloud && <View style={{ backgroundColor: '#FF8B8B', height: 10, width: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }} />
                        }
                    </View>
                    <Text style={{ fontSize: 10, color: '#726E70' }}>{lastDate}</Text>
                </View>
            </Pressable>
        )
    }

    if (conversation?.profile?.id === 1) {
        return (
            <Pressable onPress={openDetail} style={{ backgroundColor: '#F1F1F3', marginBottom: marginBottom, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#78787977', paddingVertical: 16 }}>
                <View style={{ gap: 3, alignItems: 'center' }}>

                    <Image source={{ uri: conversation?.profile?.avatar }} style={{ width: 70, height: 70, borderRadius: 5 }} />
                    {/* <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.mainColor }}>OFFICIAL</Text> */}
                </View>
                <View style={{ flex: 1, gap: 8, marginHorizontal: 12 }}>
                    <View style={{ gap: 2 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.mainColor }}>{conversation?.profile?.full_name}</Text>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.mainColor }}>OFFICIAL</Text>
                    </View>
                    <Text numberOfLines={2} style={{ fontSize: 12, lineHeight: 18, color: !lastMessageCloud ? colors.mainColor : '#6C6C6C', fontWeight: unreadCount > 0 || !lastMessageCloud ? 'bold' : '300' }}>{lastMessage}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 5 }}>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ opacity: unreadCount > 0 ? 1 : 0, backgroundColor: colors.mainColor, paddingHorizontal: 12, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10, color: 'white', fontWeight: '700', fontStyle: 'italic' }}>{`${unreadCount} unread`}</Text>
                        </View>
                        {
                            !lastMessageCloud && <View style={{ backgroundColor: '#FF8B8B', height: 10, width: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }} />
                        }
                    </View>
                    <Text style={{ fontSize: 10, color: '#726E70' }}>{lastDate}</Text>
                </View>
            </Pressable>
        )
    } else {
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

                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5, width: '100%' }}>
                            {callIcon}
                            <Text numberOfLines={2} style={{ fontSize: 12, lineHeight: 18, color: !lastMessageCloud ? colors.mainColor : '#6C6C6C', fontWeight: unreadCount > 0 || !lastMessageCloud ? 'bold' : '300' }}>{lastMessage}</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 5 }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ opacity: unreadCount > 0 ? 1 : 0, backgroundColor: colors.mainColor, paddingHorizontal: 12, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 10, color: 'white', fontWeight: '700', fontStyle: 'italic' }}>{`${unreadCount} unread`}</Text>
                            </View>
                            {
                                !lastMessageCloud && <View style={{ backgroundColor: '#FF8B8B', height: 10, width: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }} />
                            }
                        </View>
                        <Text style={{ fontSize: 10, color: '#726E70' }}>{lastDate}</Text>
                    </View>
                </Pressable>
            </SwipeRow>
        )
    }


}

export default ConversationListItem