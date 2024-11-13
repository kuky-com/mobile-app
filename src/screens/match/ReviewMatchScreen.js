import { userAtom } from '@/actions/global'
import AvatarImage from '@/components/AvatarImage'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import Text from '@/components/Text'
import TextInput from '@/components/TextInput'
import apiClient from '@/utils/apiClient'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image, ImageBackground } from 'expo-image'
import { useAtomValue } from 'jotai'
import React, { useEffect, useState } from 'react'
import { Dimensions, Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: 'white',
        padding: 16,
        gap: 16
    }
})

const ReviewMatchScreen = ({ navigation, route }) => {
    const { profile } = route.params
    const currentUser = useAtomValue(userAtom)
    const insets = useSafeAreaInsets()
    const [reason, setReason] = useState([])
    const [note, setNote] = useState('')
    const [rating, setRating] = useState(0)
    const [loading, setLoading] = useState(false)

    const onSubmit = () => {
        Keyboard.dismiss()
        setLoading(true)
        apiClient.post('users/review-user', {
            rating,
            reason: reason.join(', '),
            friend_id: profile.id,
            note,
        })
            .then((res) => {
                setLoading(false)
                console.log({res})
                Toast.show({ type: 'review_sent' })
                setTimeout(() => {
                    navigation.goBack()
                }, 2000);
            })
            .catch((error) => {
                console.log({error})
                Toast.show({ type: 'review_sent' })
                setTimeout(() => {
                    navigation.goBack()
                }, 2000);
                setLoading(false)
            })
    }

    const onRetake = () => {
        navigation.goBack()
    }

    const addReason = (item) => {
        const newReason = [...reason]
        const index = reason.indexOf(item)
        if (index >= 0) {
            newReason.splice(index, 1)
        } else {
            newReason.push(item)
        }

        setReason(newReason)
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, width: '100%' }}>
                <View style={{ flex: 1, width: '100%', gap: 16, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'black' }}>Share your feedback!</Text>
                    <AvatarImage avatar={profile?.avatar} style={{ width: 90, height: 90, borderRadius: 45 }} contentFit='contain' />
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black', textAlign: 'center' }}>How Was Your Conversation?</Text>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => setRating(1)}>
                            <Image source={rating > 0 ? images.star_fill : images.star_empty}
                                style={{ width: 45, height: 45 }} contentFit='contain' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setRating(2)}>
                            <Image source={rating > 1 ? images.star_fill : images.star_empty}
                                style={{ width: 45, height: 45 }} contentFit='contain' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setRating(3)}>
                            <Image source={rating > 2 ? images.star_fill : images.star_empty}
                                style={{ width: 45, height: 45 }} contentFit='contain' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setRating(4)}>
                            <Image source={rating > 3 ? images.star_fill : images.star_empty}
                                style={{ width: 45, height: 45 }} contentFit='contain' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setRating(5)}>
                            <Image source={rating > 4 ? images.star_fill : images.star_empty}
                                style={{ width: 45, height: 45 }} contentFit='contain' />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <TouchableOpacity onPress={() => addReason('Supportive')} style={{
                            borderColor: '#D6D4E4', borderWidth: 1, borderRadius: 10,
                            flex: 1, height: 50, alignItems: 'center', justifyContent: 'center',
                            backgroundColor: reason.indexOf('Supportive') >= 0 ? 'rgba(181, 171, 226, 0.5)' : 'rgba(181, 171, 226, 0.1)'
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }}>Supportive</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => addReason('Empathic')} style={{
                            borderColor: '#D6D4E4', borderWidth: 1, borderRadius: 10,
                            flex: 1, height: 50, alignItems: 'center', justifyContent: 'center',
                            backgroundColor: reason.indexOf('Empathic') >= 0 ? 'rgba(181, 171, 226, 0.5)' : 'rgba(181, 171, 226, 0.1)'
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }}>Empathic</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <TouchableOpacity onPress={() => addReason('Reliable')} style={{
                            borderColor: '#D6D4E4', borderWidth: 1, borderRadius: 10,
                            flex: 1, height: 50, alignItems: 'center', justifyContent: 'center',
                            backgroundColor: reason.indexOf('Reliable') >= 0 ? 'rgba(181, 171, 226, 0.5)' : 'rgba(181, 171, 226, 0.1)'
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }}>Reliable</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => addReason('Inspiring')} style={{
                            borderColor: '#D6D4E4', borderWidth: 1, borderRadius: 10,
                            flex: 1, height: 50, alignItems: 'center', justifyContent: 'center',
                            backgroundColor: reason.indexOf('Inspiring') >= 0 ? 'rgba(181, 171, 226, 0.5)' : 'rgba(181, 171, 226, 0.1)'
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }}>Inspiring</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ width: '100%', color: '#333333', fontSize: 15 }}>Write your ( optional )</Text>
                    <View style={{ width: '100%', backgroundColor: 'rgba(181, 171, 226, 0.3)', padding: 16, borderRadius: 10 }}>
                        <TextInput
                            style={{ flex: 1, fontSize: 14, color: '#333333', height: 120 }}
                            multiline
                            placeholder='Write your review here…'
                            placeholderTextColor='#555555'
                            underlineColorAndroid='#00000000'
                            value={note}
                            onChangeText={setNote}
                        />
                    </View>
                    <ButtonWithLoading
                        text='Submit Review'
                        loading={loading}
                        disabled={reason.length === 0 || rating === 0}
                        onPress={onSubmit}
                    />
                    <TouchableOpacity onPress={onRetake} style={{ width: '100%', height: 30, alignItems: 'center', justifyContent: 'center', }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#333333' }}>Back</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}

export default ReviewMatchScreen