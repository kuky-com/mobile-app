import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react'
import { userAtom } from '../../../actions/global';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../components/Text';
import { FontAwesome5 } from '@expo/vector-icons';

const MessageHeader = ({ conversation, rejectAction, likeAction }) => {
    const currentUser = useAtomValue(userAtom)
    const [expanded, setExpanded] = useState(false)

    let statusText = ''

    if (conversation.status === 'accepted') {
        statusText = `You connected on ${dayjs(conversation.response_date).format('MMMM Do')}`
    } else if (conversation.status === 'sent') {
        if (conversation?.sender?.id === currentUser?.id) {
            statusText = `You sent a matching request on ${dayjs(conversation.sent_date).format('MMMM Do')}`;
        } else {
            statusText = `You received a matching request on ${dayjs(conversation.sent_date).format('MMMM Do')}`;
        }
    }

    return (
        <View
            style={{
                padding: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: '#E3E1ED',
                marginHorizontal: 20,
                marginTop: 12,
                gap: 16,
                borderRadius: 10
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ flex: 1, color: "black", fontSize: 12, fontWeight: "600", textAlign: "left" }}>
                    {statusText}
                </Text>
                <TouchableOpacity onPress={() => setExpanded(old => !old)} style={{ borderWidth: 1, borderRadius: 5, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name={expanded ? 'chevron-up' : 'chevron-down'} size={13} color='#333333' />
                </TouchableOpacity>
            </View>

            {currentUser?.id === conversation.receiver_id && conversation.status === 'sent' && (
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 32,
                    }}
                >
                    <TouchableOpacity
                        onPress={rejectAction}
                        style={{
                            width: 120,
                            height: 36,
                            borderRadius: 18,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#333333",
                        }}
                    >
                        <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={likeAction}
                        style={{
                            width: 120,
                            height: 36,
                            borderRadius: 18,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#725ED4",
                        }}
                    >
                        <Text style={{ color: "#E8FF58", fontSize: 13, fontWeight: "bold" }}>Connect</Text>
                    </TouchableOpacity>
                </View>
            )}

            {expanded &&
                <View style={{ width: "100%", paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#D2D2D2' }}>
                    <Text style={{ fontSize: 13, fontWeight: '400', color: 'black' }}>{`• ${conversation?.profile?.full_name} is on a `}
                        <Text style={{ fontWeight: 'bold' }}>{`${conversation?.profile?.tag?.name}`}</Text>
                    </Text>
                </View>
            }
        </View>
    );
}

export default MessageHeader