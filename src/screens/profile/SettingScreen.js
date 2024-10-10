import { tokenAtom, userAtom } from '@/actions/global'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import Text from '@/components/Text'
import apiClient from '@/utils/apiClient'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'expo-image'
import { StatusBar } from 'expo-status-bar'
import { useSetAtom } from 'jotai'
import React, { useState } from 'react'
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    buttonContainer: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
        flexDirection: 'row',
        paddingVertical: 20, paddingHorizontal: 16, gap: 10, backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center'
    }
})

const SettingScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const setToken = useSetAtom(tokenAtom)
    const setUser = useSetAtom(userAtom)
    const [loading, setLoading] = useState(false)

    const onSupport = () => {
        Linking.openURL('https://www.kuky.com/')
    }

    const onPrivacy = () => {
        Linking.openURL('https://www.kuky.com/')
    }

    const onLogout = async () => {
        setLoading(true)
        apiClient.get('auth/logout')
            .then(async (res) => {
                setLoading(false)

                await AsyncStorage.removeItem('ACCESS_TOKEN')
                setToken(null)
                setUser(null)
                NavigationService.reset('GetStartScreen')
                console.log({ res })
            })
            .catch(async (error) => {
                setLoading(false)

                await AsyncStorage.removeItem('ACCESS_TOKEN')
                setToken(null)
                setUser(null)
                NavigationService.reset('GetStartScreen')
                console.log({ error })
            })

    }

    const openInterest = () => {
        navigation.navigate('InterestUpdateScreen', { onboarding: false })
    }

    const openBlocked = () => {
        navigation.navigate('BlockedUsersScreen')
    }

    const onDeleteAccount = async (reason) => {
        await SheetManager.show('confirm-action-sheets', {
            payload: {
                onCancel: () => { },
                onConfirm: () => {
                    apiClient.post('users/delete-account', { reason: reason })
                        .then(async (res) => {
                            if (res && res.data && res.data.success) {
                                Toast.show({ text1: res.data.message, type: 'success' })
                                await AsyncStorage.removeItem('ACCESS_TOKEN')
                                setToken(null)
                                setUser(null)
                                NavigationService.reset('GetStartScreen')
                            } else {
                                Toast.show({ text1: res?.data?.message ?? 'Block action failed!', type: 'error' })
                            }
                        })
                        .catch((error) => {
                            Toast.show({ text1: error, type: 'error' })
                        })
                },
                cancelText: "Cancel",
                confirmText: "Delete Account",
                header: 'DELETE ACCOUNT',
                title: `Are you sure you want to delete your account?`,
                message: `Deleting your account means you will no longer have access to your profile, matches, messages or account permanently.`
            },
        });
    }

    const deleteReason = async () => {
        const options = [
            { text: 'I met someone' },
            { text: 'I need a break' },
            { text: 'Other' },
        ]

        await SheetManager.show('action-sheets', {
            payload: {
                actions: options,
                title: 'Are you sure you want to delete your account?',
                onPress(index) {
                    if (index < options.length) {
                        onDeleteAccount(options[index].text)
                    }
                },
            },
        });
    }

    const editProfile = () => {
        navigation.navigate('UpdateProfileScreen')
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent style='dark' />
            <View style={{ gap: 12, borderBottomLeftRadius: 45, borderBottomRightRadius: 45, backgroundColor: '#725ED4', paddingHorizontal: 16, paddingBottom: 24, paddingTop: insets.top + 32, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Image source={images.setting_icon} style={{ width: 22, height: 22 }} contentFit='contain' />
                <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>{'Setting'}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 35, height: 35, alignItems: 'center', justifyContent: 'center', position: 'absolute', top: insets.top + 8, left: 16 }}>
                <Image source={images.back_icon} style={{ width: 25, height: 25 }} contentFit='contain' />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16, paddingTop: 24 }}>
                    <View style={{ flex: 1, gap: 16, marginBottom: insets.bottom + 120 }}>
                        {/* <TouchableOpacity style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>My Subscription</Text>
                            <Image source={images.next_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={editProfile} style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>Account Information</Text>
                            <Image source={images.next_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={openInterest} style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>Interests & Hobbies</Text>
                            <Image source={images.next_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={openBlocked} style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>Blocked List</Text>
                            <Image source={images.next_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onSupport} style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>Support</Text>
                            <Image source={images.next_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onPrivacy} style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>Privacy Policy & Conditions</Text>
                            <Image source={images.next_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>Deactivate my account</Text>
                            <Image source={images.next_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={deleteReason} style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>Delete Account</Text>
                            <Image source={images.delete_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity>

                        <ButtonWithLoading 
                            text='Logout'
                            onPress={onLogout}
                            loading={loading}
                        />
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

export default SettingScreen