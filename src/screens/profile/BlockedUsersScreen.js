import AvatarImage from '@/components/AvatarImage'
import { Header } from '@/components/Header'
import Text from '@/components/Text'
import apiClient from '@/utils/apiClient'
import images from '@/utils/images'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})

const BlockedUsersScreen = ({ navigation }) => {
    const [blockedUser, setBlockedUsers] = useState([])

    useEffect(() => {
        apiClient.get('users/blocked-users')
            .then((res) => {
                if (res && res.data && res.data.success) {
                    setBlockedUsers(res.data.data)
                }
            })
            .catch((error) => {
                console.log({error})
                setBlockedUsers([])
            })
    }, [])

    const unBlockUser = (user, index) => {
        apiClient.post('users/unblock-user', {friend_id: user.blocked_id})
            .then((res) => {
                if (res && res.data && res.data.success) {
                    const newUsers = [...blockedUser]
                    newUsers.splice(index, 1)
                    setBlockedUsers(newUsers)
                }
            })
            .catch((error) => {
                console.log({error})
            })
    }

    const renderItem = ({ item, index }) => {
        console.log({item})
        return (
            <View key={`blocked-${item.id}`} style={{ flexDirection: 'row', gap: 16, alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#78787988' }}>
                {/* <Image source={{ uri: item?.blockedUser?.avatar }} style={{ width: 60, height: 60, borderRadius: 30 }} /> */}
                <AvatarImage avatar={item?.blockedUser?.avatar } full_name={item?.blockedUser?.full_name} style={{ width: 60, height: 60, borderRadius: 30 }} />
                <Text style={{ flex: 1, fontSize: 16, color: 'black', fontSize: 16, fontWeight: 'bold' }}>{item?.blockedUser?.full_name}</Text>
                <TouchableOpacity onPress={() => unBlockUser(item, index)} style={{ paddingHorizontal: 5, paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, color: '#6900D3', fontWeight: 'bold' }}>Unblock</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Header leftIcon={images.back_icon} leftAction={() => navigation.goBack()} showLogo />
            <View style={{ flex: 1 }}>
                <FlatList
                    data={blockedUser}
                    renderItem={renderItem}
                    ListEmptyComponent={() => {
                        return(
                            <View style={{width: '100%', minHeight: 200, alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={{fontSize: 14, color: '#aaaaaa'}}>{'There is no blocked accounts'}</Text>
                            </View>
                        )
                    }}
                />
            </View>
        </View>
    )
}

export default BlockedUsersScreen