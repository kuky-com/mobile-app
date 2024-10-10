import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import { Dimensions, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
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
        width: '100%',
        paddingHorizontal: 16
    },
    closeButton: {
        width: 30, height: 30, backgroundColor: '#333333',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 15,
        position: 'absolute', top: 8, right: 8
    },
    textInput: {
        fontWeight: 'bold',
        fontSize: 18,
        width: '100%',
        backgroundColor: '#00000000',
        color: '#333333'
    },
})

const NameUpdateScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false)

    const onContinue = () => {
        if (name.length > 0) {
            Keyboard.dismiss()
            try {
                setLoading(true)
                apiClient.post('users/update', { full_name: name })
                    .then((res) => {
                        setLoading(false)
                        console.log({ res })
                        if (res && res.data && res.data.success) {
                            NavigationService.reset('BirthdayUpdateScreen')
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

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
            <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }}>
                <View style={{ flex: 1, gap: 16, width: '100%' }}>
                    <Image source={images.logo_with_text} style={{ width: 120, height: 40, marginBottom: 32 }} contentFit='contain' />
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>{`What is your name?`}</Text>
                    <View style={{ flex: 1, paddingVertical: 16, gap: 10, width: '100%', alignItems: 'center', justifyContent: 'flex-start' }}>
                        <View style={styles.itemContainer}>
                            <TextInput
                                style={styles.textInput}
                                underlineColorAndroid={'#00000000'}
                                value={name}
                                onChangeText={setName}
                                placeholder='Enter your full name'
                                autoFocus
                                onEndEditing={onContinue}
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>

            <ButtonWithLoading
                text='Continue'
                onPress={onContinue}
                disabled={(name.length === 0)}
                loading={loading}
            />
        </View>
    )
}

export default NameUpdateScreen