import { userAtom } from '@/actions/global'
import Text from '@/components/Text'
import apiClient from '@/utils/apiClient'
import colors from '@/utils/colors'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import axios from 'axios'
import { Image, ImageBackground } from 'expo-image'
import { useAtomValue } from 'jotai'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16
    }
})

const ReviewProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const currentUser = useAtomValue(userAtom)
    const [likes, setLikes] = useState([])
    const [dislikes, setDislikes] = useState([])

    useEffect(() => {
        apiClient.get('interests/likes')
            .then((res) => {
                if (res && res.data && res.data.success) {
                    setLikes(res.data.data)
                }
            })
            .catch((error) => {
                console.log({ error })
            })

        apiClient.get('interests/dislikes')
            .then((res) => {
                if (res && res.data && res.data.success) {
                    setDislikes(res.data.data)
                }
            })
            .catch((error) => {
                console.log({ error })
            })
    }, [])

    const onAddDislikes = () => {
        navigation.push('DislikeSelectScreen', { dislikes: dislikes, onUpdated: (newList) => setDislikes(newList) })
    }

    const onAddLikes = () => {
        navigation.push('InterestSelectScreen', { likes: likes, onUpdated: (newList) => setLikes(newList) })
    }

    const onContinue = async () => {
        try {
            const likeNames = likes.map((item) => item.name)
            const dislikeNames = dislikes.map((item) => item.name)

            const updateLikesRequest = await apiClient.post('interests/update-likes', { likes: likeNames })
            const updateDislikesRequest = await apiClient.post('interests/update-dislikes', { dislikes: dislikeNames })

            if(updateLikesRequest && updateLikesRequest.data && updateLikesRequest.data.success &&
                updateDislikesRequest && updateDislikesRequest.data && updateDislikesRequest.data.success
            ) {
                // Toast.show({text1: 'Your interest information has been updated!', type: 'success'})
                NavigationService.reset('ProfileTagScreen')
            } else {
                Toast.show({text1: 'Your request failed. Please try again!', type: 'error'})
            }
        } catch (error) {
            
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 16 }}>
                <Image source={images.logo_with_text} style={{ width: 80, height: 30 }} contentFit='contain' />
            </View>
            <ScrollView style={{ flex: 1, paddingHorizontal: 16, width: '100%' }}>
                <View style={{ flex: 1, gap: 16, width: '100%' }}>
                    <View style={{ width: '100%', paddingVertical: 16, alignItems: 'center', gap: 8 }}>
                        <Image source={{ uri: currentUser?.avatar }} contentFit='cover' style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.mainColor }} />
                        <Text style={{ color: 'black', fontSize: 22, fontWeight: 'bold' }}>{currentUser?.full_name}</Text>
                    </View>
                    <View style={{ backgroundColor: '#725ED4', width: '100%', borderRadius: 10, paddingHorizontal: 16 }}>
                        <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12 }}>
                            <Image source={images.interest_icon} style={{ width: 18, height: 18, tintColor: 'white' }} contentFit='contain' />
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Interests and hobbies</Text>
                        </View>
                        <View style={{ width: '100%', backgroundColor: '#9889E1', height: 1 }} />
                        <View style={{ paddingVertical: 16, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 16 }}>
                            {
                                likes.map((item) => {
                                    return (
                                        <TouchableOpacity key={item.name} style={{ flexDirection: 'row', gap: 5, paddingHorizontal: 16, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F0FF' }}>
                                            <Image style={{ width: 22, height: 22 }} contentFit='contain' source={images.seen_icon} />
                                            <Text style={{ fontSize: 14, color: 'black', fontWeight: '700' }}>{item.name}</Text>
                                            <TouchableOpacity style={{ backgroundColor: '#E8FF58', borderWidth: 1, borderColor: '#333333', width: 16, height: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={images.close_icon} style={{ width: 10, height: 10, tintColor: '#333333' }} contentFit='contain' />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                            <TouchableOpacity onPress={onAddLikes} style={{ width: 68, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8FF58' }}>
                                <Image style={{ width: 20, height: 20 }} source={images.plus_icon} contentFit='contain' />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ backgroundColor: '#725ED4', width: '100%', borderRadius: 10, paddingHorizontal: 16 }}>
                        <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12 }}>
                            <Image source={images.dislike_icon} style={{ width: 18, height: 18, tintColor: 'white' }} contentFit='contain' />
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Dislike</Text>
                        </View>
                        <View style={{ width: '100%', backgroundColor: '#9889E1', height: 1 }} />
                        <View style={{ paddingVertical: 16, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 16 }}>
                            {
                                dislikes.map((item) => {
                                    return (
                                        <TouchableOpacity key={item.name} style={{ flexDirection: 'row', gap: 5, paddingHorizontal: 16, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF8B8B' }}>
                                            <Image style={{ width: 22, height: 22 }} contentFit='contain' source={images.seen_icon} />
                                            <Text style={{ fontSize: 14, color: 'black', fontWeight: '700' }}>{item.name}</Text>
                                            <TouchableOpacity style={{ backgroundColor: '#E8FF58', borderWidth: 1, borderColor: '#333333', width: 16, height: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={images.close_icon} style={{ width: 10, height: 10, tintColor: '#333333' }} contentFit='contain' />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                            <TouchableOpacity onPress={onAddDislikes} style={{ width: 68, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8FF58' }}>
                                <Image style={{ width: 20, height: 20 }} source={images.plus_icon} contentFit='contain' />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onContinue} disabled={likes.length + dislikes.length === 0} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: (likes.length + dislikes.length === 0) ? '#9A9A9A' : '#333333', }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Confirm & Continue</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default ReviewProfileScreen