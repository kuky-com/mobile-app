import AvatarImage from '@/components/AvatarImage'
import { Header } from '@/components/Header'
import Text from '@/components/Text'
import apiClient from '@/utils/apiClient'
import constants from '@/utils/constants'
import images from '@/utils/images'
import dayjs from 'dayjs'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { DeviceEventEmitter, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import Toast from 'react-native-toast-message'
import analytics from '@react-native-firebase/analytics'

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})

const NotificationListScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([])
    const [isFetching, setFetching] = useState(false)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'NotificationListScreen',
            screen_class: 'NotificationListScreen',
        })
    }, [])

    const onRefresh = () => {
        setFetching(true)
        apiClient.get('notifications/list')
            .then((res) => {
                setFetching(false)
                console.log({ res: res.data })
                if (res && res.data && res.data.success) {
                    setNotifications(res.data.data)
                } else {
                    setNotifications([])
                }
            })
            .catch((error) => {
                console.log({error})
                setFetching(false)
                setNotifications([])
            })
    }

    useEffect(() => {
        onRefresh()
    }, [])

    const renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity onPress={() => openDetail(item, index)} key={`notification-${item.id}`} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#78787988' }}>
                {/* <Image source={{ uri: item?.sender?.avatar }} style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#E9E5FF' }} /> */}
                <AvatarImage avatar={item?.sender?.avatar} full_name={item?.sender?.full_name} style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#E9E5FF' }} />
                <View style={{ flex: 1, gap: 8 }}>
                    <Text style={{ fontSize: 14, color: 'black', fontWeight: 'bold' }}>{item.title}</Text>
                    <Text style={{ fontSize: 11, color: '#333333' }}>{item.content}</Text>
                </View>
                <View style={{alignItems: 'flex-end', gap: 8}}>
                <Text style={{fontSize: 10, fontWeight: 'bold', color: '#666666'}}>{dayjs(item.notification_date).fromNow()}</Text>
                {
                    !item.seen &&
                    <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF8B8B'}}/>
                }
                </View>
            </TouchableOpacity>
        )
    }

    const openDetail = (item, index) => {
        seenItem(item, index)
    }

    const seenItem = (item, index) => {
        const newItem = {...item, seen: true}
        const newNotications = [...notifications]
        newNotications.splice(index, 1, newItem)
        setNotifications(newNotications)

        apiClient.post('notifications/seen', {notification_id: item.id})
        .then((res) => {
            if (res && res.data && res.data.success) {
                DeviceEventEmitter.emit(constants.REFRESH_NOTIFICATION_COUNTER)
            }
        })
        .catch((error) => {
            Toast.show({ text1: error, type: 'error' })
        })


        if((item.notification_type === 'message' || 
            item.notification_type === 'new_request' ||
            item.notification_type === 'new_match') && item.match && item.match.conversation_id
        ) {
            navigation.push('MessageScreen', {conversation: {conversation_id: item.match.conversation_id}})
        } else if (item.notification_type === 'new_suggestions') {
            navigation.push('ConnectProfileScreen', { profile: {id: item.suggest_id} });
        } else if (item.notification_type === 'profile_approved') {
            navigation.push('ProfileApprovedScreen');
        }else if (item.notification_type === 'profile_rejected') {
            navigation.push('ProfileRejectScreen');
        }
    }

    const askSeenAll = async () => {
        const options = [
            { text: 'Mark All as Read', image: images.seen_icon, }
        ]

        await SheetManager.show('action-sheets', {
            payload: {
                actions: options,
                onPress(index) {
                    console.log({index})
                    if (index === 0) {
                        apiClient.get('notifications/seen-all')
                            .then((res) => {
                                if (res && res.data && res.data.success) {
                                    DeviceEventEmitter.emit(constants.REFRESH_NOTIFICATION_COUNTER)
                                    onRefresh()
                                }
                            })
                            .catch((error) => {
                                Toast.show({ text1: error, type: 'error' })
                            })
                    }
                },
            },
        });
    }

    return (
        <View style={styles.container}>
            <Header leftIcon={images.back_icon} leftAction={() => navigation.goBack()} showLogo 
                    rightIcon={images.more_icon}
                    rightAction={askSeenAll}
                    rightIconColor='#333333'
                />
            <View style={{ flex: 1 }}>
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    onRefresh={onRefresh}
                    refreshing={isFetching}
                    ListEmptyComponent={() => {
                        return(
                            <View style={{width: '100%', minHeight: 200, alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={{fontSize: 14, color: '#aaaaaa'}}>{'There is no notifications'}</Text>
                            </View>
                        )
                    }}
                />
            </View>
        </View>
    )
}

export default NotificationListScreen