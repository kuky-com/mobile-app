import React, { useEffect, useState } from 'react'
import apiClient from '../utils/apiClient';
import { Linking, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import Text from './Text';
import dayjs from 'dayjs';
import colors from '../utils/colors';

const MessageUrlPreview = ({currentMessage, currentUser}) => {
    const [linkPreview, setLinkPreview] = useState(null)

    useEffect(() => {
        const fetchLinkPreview = async () => {
            try {
                const response = await apiClient.get(`matches/url-preview?url=${currentMessage?.text}`)
                setLinkPreview(response.data);
            } catch (error) {
                console.log({error});
            }
        };

        fetchLinkPreview();
    }, [currentMessage?.text]);

    return (
        <View style={{ gap: 1, alignItems: 'flex-end' }}>
            {linkPreview ? (
                <TouchableOpacity onPress={() => Linking.openURL(currentMessage?.text)}>
                    <View style={{
                        // borderWidth: 1,
                        // borderColor: '#ccc',
                        // borderRadius: 8,
                        // padding: 8,
                        // backgroundColor: currentMessage?.user?._id !== currentUser?.id ? '#f0f0f0' : '#e0e0e0',
                        width: '100%'
                    }}>
                        {linkPreview.image && (
                            <Image
                                source={{ uri: linkPreview.image }}
                                style={{ width: 100, height: 100, borderRadius: 8, marginBottom: 8 }}
                            />
                        )}
                        <Text numberOfLines={2} style={{ fontSize: 14, lineHeight: 21, fontWeight: 'bold', color: currentMessage?.user?._id !== currentUser?.id ? 'white' : '#333', marginBottom: 4 }}>
                            {linkPreview.title}
                        </Text>
                        <Text numberOfLines={2} style={{ fontSize: 12, lineHeight: 18, color: currentMessage?.user?._id !== currentUser?.id ? '#ccc' : '#666' }}>
                            {linkPreview.description}
                        </Text>
                        <Text style={{ fontSize: 13, color: currentMessage?.user?._id !== currentUser?.id ? colors.purple2 : colors.purple, lineHeight: 20, marginTop: 3 }}>
                            {currentMessage?.text}
                        </Text>
                    </View>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={() => Linking.openURL(currentMessage?.text)}>
                    <View style={{
                        // borderWidth: 1,
                        // borderColor: '#ccc',
                        // borderRadius: 8,
                        // padding: 8,
                        // backgroundColor: currentMessage?.user?._id !== currentUser?.id ? '#f0f0f0' : '#e0e0e0',
                    }}>
                        <Text style={{ fontSize: 13, color: currentMessage?.user?._id !== currentUser?.id ? colors.purple2 : colors.purple, lineHeight: 20 }}>
                            {currentMessage?.text}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
            <Text style={{ color: currentMessage?.user?._id !== currentUser?.id ? '#cccccc' : '#A2A2A2', fontSize: 10, lineHeight: 20 }}>
                {dayjs(currentMessage.createdAt).format('hh:mmA')}
            </Text>
        </View>
    );
}

export default MessageUrlPreview