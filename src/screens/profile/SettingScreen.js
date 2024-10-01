import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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

    const onSupport = () => {
        Linking.openURL('https://www.kuky.com/')
    }

    const onPrivacy = () => {
        Linking.openURL('https://www.kuky.com/')
    }

    const onLogout = () => {
        NavigationService.reset('GetStartScreen')
    }

    const openInterest = () => {
        navigation.navigate('InterestUpdateScreen', { onboarding: false })
    }

    const openBlocked = () => {
        navigation.navigate('BlockedUsersScreen')
    }

    const onDeleteAccount = async () => {
        await SheetManager.show('confirm-action-sheets', {
            payload: {
                onCancel: () => { },
                onConfirm: () => {
                },
                title: 'DELETE ACCOUNT',
                message: `Are you sure you want to delete your account?\n\nDeleting your account means you will no longer have access to your profile, matches, messages or account permanently.`
            },
        });
    }

    const editProfile = () => {
        navigation.navigate('UpdateProfileScreen')
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent style='dark' />
            <View style={{ gap: 8, borderBottomLeftRadius: 45, borderBottomRightRadius: 45, backgroundColor: '#725ED4', paddingHorizontal: 16, paddingBottom: 24, paddingTop: insets.top + 16, width: '100%', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', }}>
                <View>
                    <Image source={{ uri: 'https://i.pravatar.cc/303' }} style={{ width: 80, height: 80, borderWidth: 2, borderColor: 'white', borderRadius: 40, }} />
                </View>
                <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>{'Username, 33'}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16, paddingTop: 24 }}>
                    <View style={{ flex: 1, gap: 16, marginBottom: insets.bottom + 120 }}>
                        <TouchableOpacity style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>My Subscription</Text>
                            <Image source={images.next_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={editProfile} style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>Account Information</Text>
                            <Image source={images.next_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openInterest} style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>Interests & Hobbies</Text>
                            <Image source={images.next_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity>
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
                        <TouchableOpacity onPress={onDeleteAccount} style={[styles.buttonContainer]}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>Delete Account</Text>
                            <Image source={images.delete_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onLogout} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333' }}>
                            <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>{'Logout'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

export default SettingScreen