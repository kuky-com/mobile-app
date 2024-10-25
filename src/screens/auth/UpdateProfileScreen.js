import { userAtom } from '@/actions/global'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import Text from '@/components/Text'
import apiClient from '@/utils/apiClient'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import { useAtom } from 'jotai'
import React, { useState } from 'react'
import { Keyboard, Linking, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F1F3'
    },
    inputContainer: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center'
    }
})

const UpdateProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const [currentUser, setUser] = useAtom(userAtom)
    const [fullName, setFullName] = useState(currentUser?.full_name)
    const [loading, setLoading] = useState(false)

    const moreAction = async () => {
        const options = currentUser?.login_type === 'email' ? [
            { text: 'Update Password' }
        ] : []

        await SheetManager.show('action-sheets', {
            payload: {
                actions: options,
                onPress(index) {
                    if (index === 0) {
                        navigation.push('UpdatePasswordScreen')
                    }
                },
            },
        });
    }

    const updateProfile = async () => {
        try {
            Keyboard.dismiss()
            setLoading(true)

            apiClient.post('users/update', { full_name: fullName })
                .then((res) => {
                    console.log({ res })
                    setLoading(false)
                    if (res && res.data && res.data.success) {
                        setUser(res.data.data)
                        Toast.show({ text1: res.data.message, type: 'success' })
                    } else {
                        Toast.show({ text1: res.data.message, type: 'error' })
                    }
                })
                .catch((error) => {
                    console.log({ error })
                    setLoading(false)
                    Toast.show({ text1: error, type: 'error' })
                })
        } catch (error) {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <View style={{ zIndex: 2, gap: 8, borderBottomLeftRadius: 45, borderBottomRightRadius: 45, backgroundColor: '#725ED4', paddingHorizontal: 16, paddingBottom: 24, paddingTop: insets.top + 16, width: '100%', alignItems: 'center', justifyContent: 'center', }}>
                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={images.back_icon} style={{ width: 25, height: 25 }} contentFit='contain' />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={moreAction} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={images.more_icon} style={{ width: 25, height: 25 }} contentFit='contain' />
                    </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Account Information</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'white', marginTop: -40, paddingTop: 40 }}>
                <KeyboardAwareScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16, paddingTop: 24 }}>
                    <View style={{ flex: 1, gap: 16 }}>
                        <Text style={{ fontSize: 14, color: '#646464' }}>Edit your name</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={{ fontSize: 16, fontWeight: '500', color: 'black', fontWeight: 'bold', padding: 16, width: '100%', fontFamily: 'Comfortaa-Bold' }}
                                underlineColorAndroid='#000000'
                                placeholder='Your first & last name'
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>
                    </View>
                </KeyboardAwareScrollView>

                <View style={{ width: '100%', paddingHorizontal: 16, marginBottom: insets.bottom + 20, }}>
                    <ButtonWithLoading
                        text='Save'
                        onPress={updateProfile}
                        loading={loading}
                    />
                </View>
            </View>
        </View>
    )
}

export default UpdateProfileScreen