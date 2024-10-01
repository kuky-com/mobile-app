import { Header } from '@/components/Header'
import Text from '@/components/Text'
import images from '@/utils/images'
import { Image } from 'expo-image'
import React from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})

const sampleData = [
    {
        name: 'Harry',
        lastMessage: 'Hi again, How was your day?',
        time: '2 mins ago',
        unread: true,
        image: 'https://i.pravatar.cc/301'
    },
    {
        name: 'David',
        lastMessage: 'Hi again, How was your day?',
        time: '32 mins ago',
        unread: true,
        image: 'https://i.pravatar.cc/300'
    },
    {
        name: 'Eden',
        lastMessage: 'Hi again, How was your day?',
        time: '2 mins ago',
        unread: false,
        image: 'https://i.pravatar.cc/303'
    }
]

const BlockedUsersScreen = ({ navigation }) => {
    const renderItem = ({ item, index }) => {
        return (
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#78787988' }}>
                <Image source={{ uri: item.image }} style={{ width: 60, height: 60, borderRadius: 30 }} />
                <Text style={{ flex: 1, fontSize: 16, color: 'black', fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
                <TouchableOpacity style={{ paddingHorizontal: 5, paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
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
                    data={sampleData}
                    renderItem={renderItem}
                />
            </View>
        </View>
    )
}

export default BlockedUsersScreen