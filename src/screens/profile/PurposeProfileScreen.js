import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import { DeviceEventEmitter, Dimensions, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import Toast from 'react-native-toast-message'
import axios from 'axios'
import { capitalize } from '@/utils/utils'
import DoubleSwitch from '@/components/DoubleSwitch'
import SwitchWithText from '@/components/SwitchWithText'
import apiClient from '@/utils/apiClient'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useSetAtom } from 'jotai'
import { userAtom } from '@/actions/global'
import constants from '@/utils/constants'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 16,
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 24
    },
    itemContainer: {
        backgroundColor: '#ECECEC',
        alignItems: 'center',
        justifyContent: 'center',
        height: 55, borderRadius: 20,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
        flexDirection: 'row',
        paddingHorizontal: 22,
        width: '100%'
    },
    closeButton: {
        width: 30, height: 30, backgroundColor: '#333333',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 15,
        position: 'absolute', top: 8, right: 8
    }
})

const PurposeProfileScreen = ({ navigation, route }) => {
    const { purposes, onUpdated } = route.params
    const insets = useSafeAreaInsets()
    const [tagName, setTagName] = useState('')
    const [tags, setTags] = useState(purposes);
    const inputRef = useRef()
    const setCurrentUser = useSetAtom(userAtom)

    useEffect(() => {
        apiClient.get('interests/purposes')
            .then((res) => {
                console.log({ res })
                if (res && res.data && res.data.success) {
                    setTags(res.data.data)
                }
            })
            .catch((error) => {
                console.log({ error })
                setTags([])
            })
    }, [])

    const onSave = () => {
        const purposeNames = tags.map((item) => item.name)
        apiClient.post('interests/update-purposes', { purposes: purposeNames })
            .then((res) => {
                console.log({ res })
                if (res && res.data && res.data.success) {
                    Toast.show({ text1: 'Your purposes has been updated!', type: 'success' })

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
                    Toast.show({ text1: res.data.message, type: 'error' })
                }
            })
            .catch((error) => {
                console.log({ error })
                Toast.show({ text1: error, type: 'error' })
            })
    }

    const removePurpose = (index) => {
        const newPurposes = [...tags]
        newPurposes.splice(index, 1)
        setTags(newPurposes)
    }

    const onAddTag = () => {
        if (tagName.length > 3) {
            setTags((old) => ([{ name: tagName }, ...old]))
            setTagName('')
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus()
                }
            }, 200);
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
            <View style={{ flex: 1, gap: 16, width: '100%' }}>
                <Image source={images.logo_with_text} style={{ width: 120, height: 40, marginBottom: 32 }} contentFit='contain' />
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>{`What are you battling?`}</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black', lineHeight: 20 }}>This will be your <Text style={{ color: '#5E30C1' }}>{` main profile tag `}</Text> and will help us connect you with others who share similar experiences.</Text>
                <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View style={{ flex: 1, width: '100%', paddingHorizontal: 8, paddingVertical: 24, gap: 16, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                        <Text style={{ fontSize: 16, color: 'black' }}>Your purpose</Text>
                        <View style={{ width: '100%', paddingHorizontal: 16, borderWidth: 2, borderColor: '#726E70', borderRadius: 15, height: 54, alignItems: 'center' }}>
                            <TextInput
                                ref={inputRef}
                                style={{ flex: 1, width: '100%', fontWeight: '600', fontSize: 18, color: 'black' }}
                                underlineColorAndroid='#00000000'
                                placeholder='e.g., Dealing with seperation'
                                placeholderTextColor='#AAAAAA'
                                value={tagName}
                                onChangeText={setTagName}
                                onEndEditing={onAddTag}
                            />
                        </View>
                        <View style={{ width: '100%', alignItems: 'flex-end' }}>
                            <TouchableOpacity onPress={onAddTag} style={{ height: 34, borderRadius: 17, alignItems: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 16, backgroundColor: '#FFAB48' }}>
                                <Image style={{ width: 16, height: 16 }} source={images.add_tag} contentFit='contain' />
                                <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 14 }}>Add tag</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '100%', gap: 5 }}>
                            {
                                tags.map((item, index) => (
                                    <View key={item.name} style={{ paddingVertical: 16, width: '100%', borderRadius: 20, backgroundColor: '#CDB8E2', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 }}>
                                        <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: 'black' }}>{item.name}</Text>
                                        <TouchableOpacity onPress={() => removePurpose(index)} style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={images.close_icon} style={{ width: 20, height: 20, tintColor: 'black' }} contentFit='contain' />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </View>
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

export default PurposeProfileScreen