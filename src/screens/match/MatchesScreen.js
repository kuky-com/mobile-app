import { Header } from '@/components/Header'
import Text from '@/components/Text'
import apiClient from '@/utils/apiClient'
import colors from '@/utils/colors'
import images from '@/utils/images'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F1F3'
    }
})

const MatchesScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const [matches, setMatches] = useState([])
    const [isFetching, setFetching] = useState(false)

    useEffect(() => {
        onRefresh()
    }, [])

    const onRefresh = () => {
        setFetching(true)
        apiClient.post('matches/list', {})
            .then((res) => {
                setFetching(false)
                if (res && res.data && res.data.success) {
                    setMatches(res.data.matches)
                } else {
                    setMatches([])
                }
            })
            .catch((error) => {
                setFetching(false)
                console.log({ error })
                setMatches([])
            })
    }

    const openChat = (item) => {
        navigation.push('MessageScreen', { conversation: item })
    }

    const renderHeader = () => {
        return (
            <View style={{ paddingVertical: 16 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: 'black' }}>Connections</Text>
            </View>
        )
    }

    const renderEmpty = () => {
        return (
            <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingTop: Dimensions.get('screen').height * 0.15 }}>
                <Text style={{ color: '#725ED4', fontSize: 28, fontWeight: 'bold', lineHeight: 35, textAlign: 'center' }}>{`No Connections Yet?\nNo Worries!`}</Text>
                <Text style={{ color: '#333333', fontSize: 16, fontWeight: '300', textAlign: 'center', lineHeight: 20, marginBottom: Dimensions.get('screen').height * 0.1, marginTop: 16 }}>{`Explore people near you while you wait for your perfect connection`}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('LikeScreen')} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Explore Nearby</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => openChat(item)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#78787977', paddingVertical: 16 }}>
                <Image source={{ uri: item.image }} style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: colors.mainColor }} />
                <View style={{ flex: 1, gap: 8, marginHorizontal: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'black' }}>{item.name}</Text>
                    <Text style={{ fontSize: 14, color: '#6C6C6C', fontWeight: '300' }}>{item.lastMessage}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 10, color: '#726E70' }}>{item.time}</Text>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        {item.unread &&
                            <View style={{ backgroundColor: colors.mainColor, paddingHorizontal: 12, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 10, color: 'white', fontWeight: '700', fontStyle: 'italic' }}>{`unread`}</Text>
                            </View>
                        }
                    </View>
                </View>
            </TouchableOpacity>
        )
    }


    return (
        <View style={styles.container}>
            <Header showLogo />
            <FlatList
                data={matches}
                renderItem={renderItem}
                style={{ paddingHorizontal: 16, flex: 1 }}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                onRefresh={onRefresh}
                refreshing={isFetching}
            />
        </View>
    )
}

export default MatchesScreen