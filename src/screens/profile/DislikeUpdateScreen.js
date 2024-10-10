import { userAtom } from '@/actions/global'
import Text from '@/components/Text'
import apiClient from '@/utils/apiClient'
import constants from '@/utils/constants'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import { StatusBar } from 'expo-status-bar'
import { useAtom } from 'jotai'
import React, { useRef, useState } from 'react'
import { DeviceEventEmitter, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#725ED4',
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24
    }
})

const DislikeUpdateScreen = ({ navigation, route }) => {
    const { dislikes, onUpdated } = route.params
    const insets = useSafeAreaInsets()
    const [keyword, setKeyword] = useState('')
    const [tags, setTags] = useState(dislikes ?? [])
    const inputRef = useRef()
    const [currentUser, setCurrentUser] = useAtom(userAtom)

    const onAddNewTag = () => {
        Keyboard.dismiss()
        if (keyword.length > 1) {
            if (!tags.includes(keyword)) {
                setTags((old) => [...old, { name: keyword }])
                setKeyword('')

                setTimeout(() => {
                    if (inputRef && inputRef.current) {
                        inputRef.current.focus()
                    }
                }, 100);
            }
        } else {
            Toast.show({ text1: 'Your interest should be at least 2 characters long. Please try again!', type: 'error' })
        }
    }

    const onRemove = (index) => {
        const newTags = [...tags]
        newTags.splice(index, 1)
        setTags(newTags)
    }

    const onSave = async () => {
        try {
            const dislikeNames = tags.map((item) => item.name)

            const res = await apiClient.post('interests/update-dislikes', { dislikes: dislikeNames })

            if (res && res.data && res.data.success) {
                Toast.show({ text1: 'Your dislike information has been updated!', type: 'success' })

                apiClient.get('interests/profile-tag')
                    .then((res) => {
                        console.log({ res })
                        if (res && res.data && res.data.success) {
                            setCurrentUser(res.data.data)
                            DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS)
                        }

                        if (onUpdated) {
                            onUpdated(tags)
                        }
                        navigation.goBack()
                    })
                    .catch((error) => {
                        console.log({ error })
                    })
            } else {
                Toast.show({ text1: 'Your request failed. Please try again!', type: 'error' })
            }
        } catch (error) {
            console.log({ error })
            Toast.show({ text1: 'Your request failed. Please try again!', type: 'error' })
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
            {
                false &&
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 16, top: insets.top + 16, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.back_icon_no_border} style={{ width: 25, height: 25 }} contentFit='contain' />
                </TouchableOpacity>
            }
            <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }}>
                <View style={{ flex: 1, width: '100%', gap: 24 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                        <Image source={images.dislike_icon} style={{ width: 20, height: 20 }} contentFit='contain' />
                        <Text style={{ color: '#FF8B8B', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>Dislikes</Text>
                    </View>
                    <Text style={{ color: '#F5F5F5', fontSize: 18, textAlign: 'center', lineHeight: 25, paddingHorizontal: 20 }}>Add dislikes to avoid matching with people who share them, helping us find better matches for you.</Text>
                    <View style={{ width: '100%', gap: 8, flexDirection: 'row', backgroundColor: 'white', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
                        <Image source={images.search_icon} style={{ width: 22, height: 22 }} contentFit='contain' />
                        <TextInput
                            style={{ fontSize: 18, fontWeight: '600', flex: 1, padding: 8, color: 'black' }}
                            underlineColorAndroid='#00000000'
                            placeholder='Search for dislikes'
                            placeholderTextColor='#9a9a9a'
                            value={keyword}
                            onChangeText={setKeyword}
                            onSubmitEditing={onAddNewTag}
                            maxLength={50}
                            ref={inputRef}
                        />
                        <TouchableOpacity onPress={onAddNewTag} style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={images.plus_icon} style={{ width: 20, height: 20, tintColor: '#725ED4' }} contentFit='contain' />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, flexDirection: 'row' }}>
                        {
                            tags.map((item, index) => {
                                return (
                                    <View key={`tags-${index}`} style={{ paddingHorizontal: 12, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: '#FF8B8B' }}>
                                        <Image source={images.category_icon} style={{ width: 15, height: 15, tintColor: 'black' }} contentFit='contain' />
                                        <Text style={{ fontSize: 14, color: 'black', fontWeight: 'bold' }}>{item.name}</Text>
                                        <TouchableOpacity onPress={() => onRemove(index)} style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8FF58', borderWidth: 1, borderColor: '#333333' }}>
                                            <Image source={images.close_icon} style={{ width: 10, height: 10, tintColor: '#333333' }} contentFit='contain' />
                                        </TouchableOpacity>
                                    </View>
                                )
                            })
                        }
                    </View>
                </View>
            </KeyboardAwareScrollView>
            <View style={{ flexDirection: 'row', width: '100%', gap: 16, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flex: 1, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF8B8B' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onSave} disabled={tags.length === 0} style={{ flex: 1, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: tags.length === 0 ? '#9A9A9A' : '#333333', }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default DislikeUpdateScreen