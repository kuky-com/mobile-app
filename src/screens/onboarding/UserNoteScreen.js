import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Dimensions, Keyboard, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import Toast from 'react-native-toast-message'
import axios from 'axios'
import apiClient from '@/utils/apiClient'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import { getAuthenScreen } from '@/utils/utils'
import TextInput from '@/components/TextInput'
import analytics from '@react-native-firebase/analytics'
import { useAtom, useAtomValue } from 'jotai'
import { userAtom } from '../../actions/global'
import { FontAwesome6 } from '@expo/vector-icons'

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
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: 120, borderRadius: 20,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 16
    },
    closeButton: {
        width: 30, height: 30, backgroundColor: '#333333',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 15,
        position: 'absolute', top: 8, right: 8
    },
    textInput: {
        fontWeight: 'bold',
        fontSize: 16,
        width: '100%',
        lineHeight: 24,
        backgroundColor: '#00000000',
        color: '#333333',
        flex: 1
    },
})

const UserNoteScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const [currentUser, setUser] = useAtom(userAtom)
    const [user_note, setNote] = useState(currentUser?.user_note || '');
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'UserNoteScreen',
            screen_class: 'UserNoteScreen'
        })
    }, [])

    const onContinue = () => {
        if (user_note.length > 0) {
            Keyboard.dismiss()
            try {
                console.log({user_note})
                setLoading(true)
                apiClient.post('users/update', { user_note: user_note.trim() })
                    .then((res) => {
                        setLoading(false)
                        console.log({ res })
                        if (res && res.data && res.data.success) {
                            setUser(res.data.data)
                            navigation.goBack()
                        } else {
                            Toast.show({ text1: res.data.message, type: 'error' })
                        }
                    })
                    .catch((error) => {
                        setLoading(false)
                        console.log({ error })
                        Toast.show({ text1: error, type: 'error' })
                    })
            } catch (error) {
                setLoading(false)
            }
        }
    }

    const onClearNote = () => {
        Keyboard.dismiss()
        try {
            setLoading(true)
            apiClient.post('users/update', { user_note: '' })
                .then((res) => {
                    setLoading(false)
                    console.log({ res })
                    if (res && res.data && res.data.success) {
                        setUser(res.data.data)
                        navigation.goBack()
                    } else {
                        Toast.show({ text1: res.data.message, type: 'error' })
                    }
                })
                .catch((error) => {
                    setLoading(false)
                    console.log({ error })
                    Toast.show({ text1: error, type: 'error' })
                })
        } catch (error) {
            setLoading(false)
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
            <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }}>
                <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                    <Image source={images.logo_icon} style={{ width: 40, height: 40, marginBottom: 8 }} contentFit='contain' />
                    <Text style={{ fontSize: 24, lineHeight: 30, maxWidth: '80%', fontWeight: 'bold', color: 'black' }}>{`Let others understand what you’re going through`}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: 'black', lineHeight: 20 }}>{`What’s something you're currently navigating or want support with?`}</Text>
                    <View style={{ flex: 1, paddingVertical: 16, gap: 10, width: '100%', alignItems: 'center', justifyContent: 'flex-start' }}>
                        <View style={styles.itemContainer}>
                            <TextInput
                                style={styles.textInput}
                                underlineColorAndroid={'#00000000'}
                                value={user_note}
                                onChangeText={setNote}
                                placeholder='I’ve been feeling anxious lately and want to connect with someone about relationships.'
                                autoFocus
                                multiline={true}
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>


            <TouchableOpacity style={{
                position: 'absolute', top: insets.top + 5, right: 16,
                width: 25, height: 25, alignItems: 'center', justifyContent: 'center'
            }}
                onPress={() => {
                    navigation.goBack()
                }}>
                <FontAwesome6 name='xmark' size={20} color='#333333' />
            </TouchableOpacity>

            <ButtonWithLoading
                text='Continue'
                onPress={onContinue}
                disabled={(user_note.length === 0)}
                loading={loading}
            />

            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity onPress={onClearNote} style={{ alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333333' }}>Clear note</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default UserNoteScreen