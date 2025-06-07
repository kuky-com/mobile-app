import { userAtom } from '@/actions/global'
import Text from '@/components/Text'
import colors from '@/utils/colors'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import React from 'react'
import { Pressable, View } from 'react-native'
import AvatarImage from '@/components/AvatarImage'

const SupportListItem = ({ onPress, user, marginBottom, lastMessage: lastMessageProp, unreadCount: unreadCountProp }) => {
    const currentUser = useAtomValue(userAtom)    // Use props if available, otherwise fall back to user data
    const unreadCount = unreadCountProp ?? 0;
    const lastMessageCloud = lastMessageProp ?? (user?.match_info ? (user?.match_info?.last_message ?? 'Not started yet') : 'Not started yet');

    const openDetail = () => {
        onPress && onPress()
    }

    let lastMessage = lastMessageCloud ?? 'Not started yet'
    let lastDate = user?.match_info?.last_message_date
    if (!lastMessage) {
        if (user?.match_info?.status === 'sent') {
            if (user?.match_info?.sender?.id === currentUser?.id) {
                lastMessage = `You have sent a connection request!`
            } else {
                lastMessage = `${user?.match_info?.sender?.full_name} wants to connect with you!`
            }

        }
        if (user?.match_info?.status === 'accepted') {
            lastMessage = `New match!`
        }
    }
    if (!lastDate) {
        if (user?.match_info?.response_date) {
            lastDate = dayjs(user?.match_info?.response_date).fromNow()
        } else if (user?.match_info?.sent_date) {
            lastDate = dayjs(user?.match_info?.sent_date).fromNow()
        }
    } else {
        lastDate = dayjs(lastDate).fromNow()
    }

    return (
        <Pressable onPress={openDetail} style={{ backgroundColor: '#F1F1F3', marginBottom: marginBottom, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#78787977', paddingVertical: 16 }}>
            {/* <Image source={{ uri: conversation?.profile?.avatar }} style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: colors.mainColor }} /> */}
            <AvatarImage avatar={user?.avatar} full_name={user?.full_name} style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: colors.mainColor }} />
            <View style={{ flex: 1, gap: 8, marginHorizontal: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>{user?.full_name}</Text>
                <Text numberOfLines={2} style={{ fontSize: 12, lineHeight: 18, color: !lastMessageCloud ? colors.mainColor : '#6C6C6C', fontWeight: unreadCount > 0 || !lastMessageCloud ? 'bold' : '300' }}>{user?.match_info ? lastMessage : 'Not started yet'}</Text>
            </View>
            {user?.match_info &&
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
            }
        </Pressable>
    )
}

export default SupportListItem