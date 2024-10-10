import { Header } from '@/components/Header'
import Text from '@/components/Text'
import apiClient from '@/utils/apiClient'
import constants from '@/utils/constants'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import dayjs from 'dayjs'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { DeviceEventEmitter, StyleSheet, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    tagContainer: {
        backgroundColor: '#7B65E8',
        height: 30, borderRadius: 15,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tagText: {
        color: '#E8FF58',
        fontSize: 15,
        fontWeight: 'bold',
    },
    nameBackground: {
        position: 'absolute',
        height: '50%', left: 0, right: 0, bottom: 0,
        borderRadius: 10
    }
})

const ConnectProfileScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const { profile, showAcceptReject = true } = route.params

    const likeAction = () => {
        Toast.show({
            type: 'sent',
            position: 'top',
            text1: 'Connection Sent!',
            text2: `Your invitation to connect has been sent to ${profile?.full_name}.`,
            visibilityTime: 3000,
            autoHide: true,
        });

        apiClient.post('matches/accept', { friend_id: profile.id })
            .then((res) => {
                console.log({ res })
                DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS)
                if (res && res.data && res.data.success && res.data.data && res.data.data.status === 'accepted') {
                    NavigationService.replace('GetMatchScreen', { match: res.data.data })
                } else {
                    setTimeout(() => {
                        navigation.goBack()
                    }, 3000)
                }
            })
            .catch((error) => {
                console.log({ error })
                // Toast.show({text1: 'Fail to send your interaction.', type: 'error'})
                setTimeout(() => {
                    navigation.goBack()
                }, 3000)
            })
    }

    const rejectAction = () => {
        apiClient.post('matches/reject', { friend_id: profile?.id })
            .then((res) => {
                console.log({ res })
                DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS)
            })
            .catch((error) => {
                console.log({ error })
            })
        Toast.show({
            type: 'deny',
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
        });
        setTimeout(() => {
            navigation.goBack()
        }, 3000)
    }

    const moreAction = async () => {
        const options = [
            { text: 'Block Users', image: images.delete_icon }
        ]

        await SheetManager.show('action-sheets', {
            payload: {
                actions: options,
                onPress(index) {
                    if (index === 0) {
                        apiClient.post('users/block-user', { friend_id: profile.id })
                            .then((res) => {
                                if (res && res.data && res.data.success) {
                                    DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS)
                                    Toast.show({ text1: res.data.message, type: 'success' })
                                    setTimeout(() => {
                                        navigation.goBack()
                                    }, 200);
                                } else {
                                    Toast.show({ text1: res?.data?.message ?? 'Block action failed!', type: 'error' })
                                }
                            })
                            .catch((error) => {
                                Toast.show({ text1: error, type: 'error' })
                            })
                    }
                },
            },
        });
    }

    console.log({ profile: profile.interests[0] })

    return (
        <View style={[styles.container]}>
            <Header
                showLogo
                leftIcon={images.back_icon}
                leftAction={() => navigation.goBack()}
                rightIcon={images.more_icon}
                rightAction={moreAction}
                rightIconColor='black'
            />
            <View style={{ flex: 1, margin: 16, marginBottom: 16, borderWidth: 8, borderColor: 'white', borderRadius: 15 }}>
                <Image source={{ uri: profile?.avatar }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10 }} contentFit='cover' />

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.79)']}
                    style={styles.nameBackground}
                />
                <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ width: '100%', alignItems: 'flex-end', padding: 16 }}>
                        <View style={styles.tagContainer}>
                            <Text style={styles.tagText}>{profile?.tag?.name}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end', paddingBottom: 25, paddingHorizontal: 16, gap: 16 }}>
                        <Text style={{ fontSize: 32, color: 'white', fontWeight: 'bold' }}>{profile.full_name}</Text>
                        <View style={{ width: '100%', flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {
                                profile?.interests.map((interest) => (
                                    <View key={`interest-${interest.id}`} style={{ flexDirection: 'row', gap: 5, alignItems: 'center', padding: 8, borderRadius: 10, backgroundColor: interest?.user_interests?.interest_type !== 'dislike' ? 'rgba(123, 101,232,0.75)' : 'rgba(250, 139, 139,0.75)' }}>
                                        <Image source={images.category_icon} style={{ width: 16, height: 16 }} contentFit='contain' />
                                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>{interest.name}</Text>
                                    </View>
                                ))
                            }
                        </View>
                        {showAcceptReject &&
                            <View style={{ marginTop: 32, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 9 }}>
                                <View style={{ alignItems: 'center', gap: 13 }}>
                                    <TouchableOpacity onPress={rejectAction} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#6C6C6C', alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={images.close_icon} style={{ width: 15, height: 15, tintColor: '#E8FF58' }} contentFit='contain' />
                                    </TouchableOpacity>
                                    <Text style={{ color: '#949494', fontSize: 12, fontWeight: 'bold' }}>Pass</Text>
                                </View>
                                <View style={{ alignItems: 'center', gap: 13 }}>
                                    <TouchableOpacity onPress={likeAction} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#6C6C6C', alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={images.like_icon} style={{ width: 15, height: 15, tintColor: '#E8FF58' }} contentFit='contain' />
                                    </TouchableOpacity>
                                    <Text style={{ color: '#949494', fontSize: 12, fontWeight: 'bold' }}>Connect</Text>
                                </View>
                            </View>
                        }
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingBottom: insets.bottom + 16, paddingHorizontal: 16 }}>
                <View style={{ flexDirection: 'row', flex: 1, gap: 5, alignItems: 'center', justifyContent: 'flex-start' }}>
                    <View style={{ width: 30, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#726F70', backgroundColor: 'white' }}>
                        <Image source={images.birthday_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                    </View>
                    <Text style={{ fontSize: 14, color: 'black' }}>{`${dayjs().diff(dayjs(profile.birthday, 'MM-DD-YYYY'), 'years')} yrs`}</Text>
                </View>

                <View style={{ flexDirection: 'row', flex: 1, gap: 5, alignItems: 'center' }}>
                    <View style={{ width: 30, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#726F70', backgroundColor: 'white' }}>
                        <Image source={images.gender_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                    </View>
                    <Text style={{ fontSize: 14, color: 'black' }}>{`${profile.pronouns}`}</Text>
                </View>

                <View style={{ flexDirection: 'row', flex: 1, gap: 5, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <View style={{ width: 30, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#726F70', backgroundColor: 'white' }}>
                        <Image source={images.location_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                    </View>
                    <Text style={{ fontSize: 14, color: 'black' }}>{`${profile.location}`}</Text>
                </View>
            </View>
        </View>
    )
}

export default ConnectProfileScreen