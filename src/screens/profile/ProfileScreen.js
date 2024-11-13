import { userAtom } from '@/actions/global'
import AvatarImage from '@/components/AvatarImage'
import Text from '@/components/Text'
import apiClient from '@/utils/apiClient'
import colors from '@/utils/colors'
import constants from '@/utils/constants'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import dayjs from 'dayjs'
import { Image } from 'expo-image'
import { StatusBar } from 'expo-status-bar'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import React, { useEffect, useRef, useState } from 'react'
import { DeviceEventEmitter, Dimensions, Linking, Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import Purchases from 'react-native-purchases'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Share from 'react-native-share'
import { ResizeMode, Video } from 'expo-av'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
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
    },
    subscriptionButton: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        elevation: 1,
        shadowColor: '#FFAB48',
    }
})

const ProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const [mode, setMode] = useState('view') //view, edit
    const [likes, setLikes] = useState([])
    const [dislikes, setDislikes] = useState([])
    const [purposes, setPurposes] = useState([])

    const [currentUser, setCurrentUser] = useAtom(userAtom)
    const [expiredDate, setExpiredDate] = useState(null)

    const [playing, setPlaying] = useState(false)
    const videoRef = useRef(null)

    useEffect(() => {
        onRefresh()
    }, [])

    useEffect(() => {
        let eventListener = DeviceEventEmitter.addListener(constants.REFRESH_PROFILE, event => {
            onRefresh()
        });

        return () => {
            eventListener.remove();
        };
    }, [])

    const openSetting = () => {
        navigation.push('SettingScreen')
    }

    const onRefresh = () => {
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

        apiClient.get('interests/purposes')
            .then((res) => {
                if (res && res.data && res.data.success) {
                    setPurposes(res.data.data)
                }
            })
            .catch((error) => {
                console.log({ error })
            })

        apiClient.get('users/user-info')
            .then((res) => {
                if (res && res.data && res.data.success) {
                    setCurrentUser(res.data.data)
                }
            })
            .catch((error) => {
                console.log({ error })
            })

        // getSubscriptionInfo()
    }

    const onAddDislikes = () => {
        navigation.push('DislikeUpdateScreen', { dislikes: dislikes, onUpdated: (newList) => setDislikes(newList) })
    }

    const onAddLikes = () => {
        navigation.push('InterestUpdateScreen', { likes: likes, onUpdated: (newList) => setLikes(newList) })
    }

    const onEditPurposes = () => {
        navigation.push('PurposeProfileScreen', { purposes: purposes, onUpdated: (newList) => setPurposes(newList) })
    }

    const openNameEdit = () => {
        navigation.push('UpdateProfileScreen')
    }

    const openEditAvatar = () => {
        navigation.push('AvatarProfileScreen')
    }

    const openSubscription = () => {
        navigation.push('PremiumRequestScreen')
    }

    const onShare = () => {
        Share.open({ url: Platform.OS === 'ios' ? 'https://apps.apple.com/au/app/kuky/id6711341485' : 'https://play.google.com/store/apps/details?id=com.kuky.android', })
            .then(() => { })
            .catch((error) => {
                console.log({ error })
            })
    }
    const playVideo = () => {
        if (videoRef && videoRef) {
            videoRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 0 })
        }
    }

    const pauseVideo = () => {
        if (videoRef && videoRef) {
            videoRef.current.setStatusAsync({ shouldPlay: false })
        }
    }

    const openEditVideo = () => {
        navigation.push('VideoUpdateScreen')
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent style='dark' />
            <View style={{ gap: 8, borderBottomLeftRadius: 45, borderBottomRightRadius: 45, backgroundColor: '#725ED4', paddingHorizontal: 16, paddingBottom: 12, paddingTop: insets.top, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                {/* <View style={{ width: '100%', height: 30, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={openSetting} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={images.setting_icon} style={{ width: 22, height: 22 }} contentFit='contain' />
                    </TouchableOpacity>
                </View> */}
                <View style={{ gap: 8, paddingTop: 16, paddingBottom: 8, width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>

                    <View style={{ width: 40, height: 40 }}></View>
                    {/* <View style={{alignItems: 'center', gap: 8}}>
                        <Text style={{ fontSize: 16, color: expiredDate ? '#FFAB48' : 'white', fontWeight: 'bold' }}>{expiredDate ? `Membership` : 'Free user'}</Text>
                        <TouchableOpacity onPress={openSubscription} style={[styles.subscriptionButton, { paddingHorizontal: 16, height: 24, borderRadius: 12, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ fontSize: 12, color: 'black', fontWeight: 'bold' }}>{expiredDate ? `Subscription end at: ${expiredDate}` : 'Upgrade now'}</Text>
                        </TouchableOpacity>
                    </View> */}
                    <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, color: 'white', fontWeight: 'bold' }}>{`${currentUser?.full_name}`}</Text>
                    <TouchableOpacity onPress={openSetting} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={images.setting_icon} style={{ width: 22, height: 22 }} contentFit='contain' />
                    </TouchableOpacity>
                </View>
                <View style={{ height: 30, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => setMode('edit')} style={{ borderBottomWidth: 1, borderBottomColor: mode === 'edit' ? '#E8FF58' : 'transparent', height: 30, alignItems: 'center', width: 50, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, color: mode === 'edit' ? '#E8FF58' : 'rgba(232, 255, 88, 0.5)' }}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => setMode('view')} style={{ borderBottomWidth: 1, borderBottomColor: mode === 'view' ? '#E8FF58' : 'transparent', height: 30, alignItems: 'center', width: 50, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, color: mode === 'view' ? '#E8FF58' : 'rgba(232, 255, 88, 0.5)' }}>View</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {
                mode === 'edit' &&
                <View style={{ flex: 1 }}>
                    <ScrollView
                        refreshControl={<RefreshControl
                            refreshing={false}
                            onRefresh={onRefresh} />}
                        showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16, paddingTop: 24 }}>
                        <View style={{ flex: 1, width: Platform.isPad ? 600 : '100%', alignSelf: 'center', gap: 16, marginBottom: insets.bottom + 120 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
                                    <TouchableOpacity onPress={openNameEdit} style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.mainColor }}>
                                        <Image source={images.edit_icon} style={{ width: 12, height: 12, tintColor: '#E8FF58' }} />
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 24, color: 'black', fontWeight: 'bold', flex: 1 }}>{`${currentUser?.full_name}`}</Text>
                                </View>
                                <View style={{ maxWidth: '50%', backgroundColor: '#7B65E8', height: 30, borderRadius: 15, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: '#E8FF58', textAlign: 'center', fontSize: (currentUser?.tag?.name ?? '').length > 20 ? 12 : 14, fontWeight: 'bold' }}>{currentUser?.tag?.name}</Text>
                                </View>
                            </View>
                            <View style={{ backgroundColor: '#725ED4', paddingHorizontal: 24, paddingVertical: 8, justifyContent: 'space-between', width: Math.min(Dimensions.get('screen').width - 32, 600), height: Math.min(Dimensions.get('screen').width + 60, 750), borderRadius: 20, overflow: 'hidden' }}>
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
                                    <Image source={images.update_video} style={{ width: 18, height: 18, tintColor: 'white' }} contentFit='contain' />
                                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Update my video</Text>
                                </View>
                                <View style={{ width: '100%', backgroundColor: '#9889E1', height: 1 }} />
                                <View style={{  flex: 1, marginTop: 16, marginBottom: 8, alignItems: 'center', justifyContent: 'center' }}>
                                    {
                                        currentUser?.video_intro &&
                                        <Video
                                            style={{ borderWidth: 2, borderColor: '#CDB8E2', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 20 }}
                                            ref={videoRef}
                                            source={{ uri: currentUser?.video_intro }}
                                            resizeMode={ResizeMode.COVER}
                                            onPlaybackStatusUpdate={status => {
                                                setPlaying(status.isPlaying)
                                            }}
                                            positionMillis={500}
                                        />
                                    }
                                    <TouchableOpacity onPress={openEditVideo} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.mainColor, borderWidth: 1, borderColor: '#E8FF58' }}>
                                        <Image source={images.edit_icon} style={{ width: 15, height: 15, tintColor: '#E8FF58' }} />
                                    </TouchableOpacity>
                                    {
                                        !playing && currentUser?.video_intro &&
                                        <TouchableOpacity onPress={playVideo} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={images.play_button} style={{ width: 40, height: 40 }} />
                                        </TouchableOpacity>
                                    }
                                    {
                                        playing && currentUser?.video_intro &&
                                        <TouchableOpacity onPress={pauseVideo} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                            <View style={{ backgroundColor: '#725ED4', position: 'absolute', top: 10, left: 10, right: 10, bottom: 10 }} />
                                            <Image source={images.pause_icon} style={{ width: 40, height: 40 }} />
                                        </TouchableOpacity>
                                    }
                                    {
                                        !currentUser?.video_intro &&
                                        <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>No profile video.</Text>
                                    }
                                </View>
                            </View>
                            <View style={{ backgroundColor: '#725ED4', paddingHorizontal: 24, paddingVertical: 8, justifyContent: 'space-between', width: Math.min(Dimensions.get('screen').width - 32, 600), height: Math.min(Dimensions.get('screen').width + 60, 750), borderRadius: 20, overflow: 'hidden' }}>
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
                                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Profile picture</Text>
                                </View>
                                <View style={{ width: '100%', backgroundColor: '#9889E1', height: 1 }} />
                                <View style={{ flex: 1, marginTop: 16, marginBottom: 8 }}>
                                    <AvatarImage avatar={currentUser?.avatar} full_name={currentUser?.full_name} style={{ borderWidth: 2, borderColor: '#CDB8E2', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 20 }} />
                                    <TouchableOpacity onPress={openEditAvatar} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.mainColor, borderWidth: 1, borderColor: '#E8FF58' }}>
                                        <Image source={images.edit_icon} style={{ width: 15, height: 15, tintColor: '#E8FF58' }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                <View style={{ flexDirection: 'row', flex: 1, gap: 5, alignItems: 'center', justifyContent: 'flex-start' }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#726F70', backgroundColor: 'white' }}>
                                        <Image source={images.birthday_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                                    </View>
                                    <Text style={{ fontSize: 14, color: 'black' }}>{`${dayjs().diff(dayjs(currentUser?.birthday, 'MM-DD-YYYY'), 'years')} yrs`}</Text>
                                </View>

                                <View style={{ flexDirection: 'row', flex: 1, gap: 5, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#726F70', backgroundColor: 'white' }}>
                                        <Image source={images.gender_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                                    </View>
                                    <Text style={{ fontSize: 14, color: 'black' }}>{`${(currentUser?.pronouns ?? '').split('/ ')[0]}`}</Text>
                                </View>

                                <View style={{ flexDirection: 'row', flex: 1, gap: 5, alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#726F70', backgroundColor: 'white' }}>
                                        <Image source={images.location_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                                    </View>
                                    <Text style={{ fontSize: 14, color: 'black' }}>{`${currentUser?.location ?? ''}`}</Text>
                                </View>
                            </View>

                            <View style={{ backgroundColor: '#725ED4', width: '100%', borderRadius: 10, paddingHorizontal: 16 }}>
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
                                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Your purposes</Text>
                                </View>
                                <View style={{ width: '100%', backgroundColor: '#9889E1', height: 1 }} />
                                <View style={{ paddingVertical: 16, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 16 }}>
                                    {
                                        purposes.map((item) => {
                                            return (
                                                <TouchableOpacity key={item.name} style={{ flexDirection: 'row', gap: 5, paddingHorizontal: 16, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F0FF' }}>
                                                    <Text style={{ fontSize: 14, color: 'black', fontWeight: '700' }}>{item.name}</Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                    <TouchableOpacity onPress={onEditPurposes} style={{ width: 68, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8FF58' }}>
                                        <Image style={{ width: 20, height: 20 }} source={images.edit_icon} contentFit='contain' />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ backgroundColor: '#725ED4', width: '100%', borderRadius: 10, paddingHorizontal: 16 }}>
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
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
                                                    {/* <TouchableOpacity style={{ backgroundColor: '#E8FF58', borderWidth: 1, borderColor: '#333333', width: 16, height: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image source={images.close_icon} style={{ width: 10, height: 10, tintColor: '#333333' }} contentFit='contain' />
                                                </TouchableOpacity> */}
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                    <TouchableOpacity onPress={onAddLikes} style={{ width: 68, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8FF58' }}>
                                        <Image style={{ width: 20, height: 20 }} source={images.edit_icon} contentFit='contain' />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ backgroundColor: '#725ED4', width: '100%', borderRadius: 10, paddingHorizontal: 16 }}>
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
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
                                                    {/* <TouchableOpacity style={{ backgroundColor: '#E8FF58', borderWidth: 1, borderColor: '#333333', width: 16, height: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image source={images.close_icon} style={{ width: 10, height: 10, tintColor: '#333333' }} contentFit='contain' />
                                                </TouchableOpacity> */}
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                    <TouchableOpacity onPress={onAddDislikes} style={{ width: 68, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8FF58' }}>
                                        <Image style={{ width: 20, height: 20 }} source={images.edit_icon} contentFit='contain' />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* <TouchableOpacity onPress={onSave} disabled={(newLikes !== likes || newDislikes !== dislikes) && newLikes.length + newDislikes.length === 0} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: ((newLikes !== likes || newDislikes !== dislikes) && newLikes.length + newDislikes.length === 0) ? '#9A9A9A' : '#333333', }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Save</Text>
                        </TouchableOpacity> */}
                        </View>
                    </ScrollView>
                </View>
            }
            {
                mode === 'view' &&
                <View style={{ flex: 1 }}>
                    <ScrollView
                        refreshControl={<RefreshControl
                            refreshing={false}
                            onRefresh={onRefresh} />}
                        showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16, paddingTop: 24 }}>
                        <View style={{ flex: 1, width: Platform.isPad ? 600 : '100%', alignSelf: 'center', gap: 16, marginBottom: insets.bottom + 120 }}>
                            <View style={{ borderWidth: 1, borderRadius: 10, borderColor: colors.mainColor, padding: 16, gap: 16 }}>
                                <Text style={{ color: '#333333', fontSize: 14, textAlign: 'center' }}>Let your friends know you found a great match on Kuky!</Text>
                                <TouchableOpacity onPress={onShare} style={{ paddingHorizontal: 32, justifyContent: 'center', height: 40, alignItems: 'center', borderRadius: 20, backgroundColor: colors.mainColor }}>
                                    <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>Invite a friend</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
                                    <Text style={{ fontSize: 24, color: 'black', fontWeight: 'bold' }}>{`${currentUser?.full_name}`}</Text>
                                </View>
                                <View style={{ maxWidth: '50%', backgroundColor: '#7B65E8', height: 30, borderRadius: 15, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: '#E8FF58', textAlign: 'center', fontSize: (currentUser?.tag?.name ?? '').length > 20 ? 12 : 14, fontWeight: 'bold' }}>{currentUser?.tag?.name}</Text>
                                </View>
                            </View>
                            <View style={{ justifyContent: 'flex-end', width: Math.min(Dimensions.get('screen').width - 32, 600), height: Math.min(Dimensions.get('screen').width + 60, 750), borderRadius: 20, overflow: 'hidden' }}>
                                {!playing && <AvatarImage avatar={currentUser?.avatar} full_name={currentUser?.full_name} style={{ borderWidth: 2, borderColor: '#CDB8E2', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 20 }} />}
                                {
                                    currentUser?.video_intro &&
                                    <Video
                                        style={{ borderWidth: 2, borderColor: '#CDB8E2', display: playing ? 'flex' : 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10 }}
                                        ref={videoRef}
                                        source={{ uri: currentUser?.video_intro }}
                                        resizeMode={ResizeMode.COVER}
                                        onPlaybackStatusUpdate={status => {
                                            console.log({ status, url: currentUser?.video_intro })
                                            setPlaying(status.isPlaying)
                                        }}
                                    />
                                }
                                {currentUser?.video_intro &&
                                    <View style={{ alignItems: 'center', gap: 3, marginBottom: 16 }}>
                                        {!playing &&
                                            <TouchableOpacity onPress={playVideo} style={{ alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={images.play_icon} style={{ width: 80, height: 80 }} contentFit='contain' />
                                            </TouchableOpacity>
                                        }
                                        {playing &&
                                            <TouchableOpacity onPress={pauseVideo} style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
                                                <View style={{ position: 'absolute', top: 20, right: 20, bottom: 20, left: 20, backgroundColor: '#E8FF58' }} />
                                                <Image source={images.pause_icon} style={{ tintColor: '#7B65E8', width: 80, height: 80, borderRadius: 40, }} contentFit='contain' />
                                            </TouchableOpacity>
                                        }
                                        <Text style={{ color: '#949494', fontSize: 10, fontWeight: 'bold' }}>Watch video</Text>
                                    </View>
                                }
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                <View style={{ flexDirection: 'row', flex: 1, gap: 5, alignItems: 'center', justifyContent: 'flex-start' }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#726F70', backgroundColor: 'white' }}>
                                        <Image source={images.birthday_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                                    </View>
                                    <Text style={{ fontSize: 14, color: 'black' }}>{`${dayjs().diff(dayjs(currentUser?.birthday, 'MM-DD-YYYY'), 'years')} yrs`}</Text>
                                </View>

                                <View style={{ flexDirection: 'row', flex: 1, gap: 5, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#726F70', backgroundColor: 'white' }}>
                                        <Image source={images.gender_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                                    </View>
                                    <Text style={{ fontSize: 14, color: 'black' }}>{`${(currentUser?.pronouns ?? '').split('/ ')[0]}`}</Text>
                                </View>

                                <View style={{ flexDirection: 'row', flex: 1, gap: 5, alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#726F70', backgroundColor: 'white' }}>
                                        <Image source={images.location_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                                    </View>
                                    <Text style={{ fontSize: 14, color: 'black' }}>{`${currentUser?.location ?? ''}`}</Text>
                                </View>
                            </View>
                            <View>
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
                                    <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }}>Your purposes</Text>
                                </View>
                                <View style={{ backgroundColor: '#E9E5FF', width: '100%', borderRadius: 10, paddingHorizontal: 16 }}>

                                    <View style={{ paddingVertical: 16, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 16 }}>
                                        {
                                            purposes.map((item) => {
                                                return (
                                                    <TouchableOpacity key={item.name} style={{ flexDirection: 'row', gap: 5, paddingHorizontal: 16, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#725ED4' }}>
                                                        <Text style={{ fontSize: 14, color: '#E8FF58', fontWeight: '700' }}>{item.name}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                </View>
                            </View>
                            <View>
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
                                    <Image source={images.interest_icon} style={{ width: 18, height: 18, tintColor: 'black' }} contentFit='contain' />
                                    <Text style={{ color: 'black', fontSize: 16, fontWeight: '600' }}>Interests and hobbies</Text>
                                </View>
                                <View style={{ backgroundColor: '#E9E5FF', width: '100%', borderRadius: 10, paddingHorizontal: 16 }}>

                                    <View style={{ paddingVertical: 16, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 16 }}>
                                        {
                                            likes.map((item) => {
                                                return (
                                                    <TouchableOpacity key={item.name} style={{ flexDirection: 'row', gap: 5, paddingHorizontal: 16, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#725ED4' }}>
                                                        <Text style={{ fontSize: 14, color: '#E8FF58', fontWeight: '700' }}>{item.name}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                </View>
                            </View>
                            <View>
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
                                    <Image source={images.dislike_icon} style={{ width: 18, height: 18, tintColor: 'black' }} contentFit='contain' />
                                    <Text style={{ color: 'black', fontSize: 16, fontWeight: '600' }}>Dislike</Text>
                                </View>
                                <View style={{ backgroundColor: '#E9E5FF', width: '100%', borderRadius: 10, paddingHorizontal: 16 }}>

                                    <View style={{ paddingVertical: 16, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 16 }}>
                                        {
                                            dislikes.map((item) => {
                                                return (
                                                    <TouchableOpacity key={item.name} style={{ flexDirection: 'row', gap: 5, paddingHorizontal: 16, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF8B8B' }}>
                                                        <Text style={{ fontSize: 14, color: 'black', fontWeight: '700' }}>{item.name}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            }
        </View>
    )
}

export default ProfileScreen