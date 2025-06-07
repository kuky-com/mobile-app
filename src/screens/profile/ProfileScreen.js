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
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DeviceEventEmitter, Dimensions, Linking, Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import Purchases from 'react-native-purchases'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Share from 'react-native-share'
import { ResizeMode, Video } from 'expo-av'
import CustomVideo from '@/components/CustomVideo'
import { FontAwesome6 } from '@expo/vector-icons'
import ShareModal from '../../components/ShareModal'
import analytics from '@react-native-firebase/analytics'
import { capitalize, formatSeconds, getStatusColor } from '../../utils/utils'
import { head } from 'axios'
import OnlineStatus from '../../components/OnlineStatus'
import MonthYearPickerSheet from '../../components/sheets/MonthYearSheets'
import VideoManager from '../../components/VideoManager'

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
    },
    shadow: {
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
    }
})

const ProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const [mode, setMode] = useState('view') //view, edit
    const [likes, setLikes] = useState([])
    const [dislikes, setDislikes] = useState([])
    const [purposes, setPurposes] = useState([])

    const [currentUser, setCurrentUser] = useAtom(userAtom)
    const [showShare, setShowShare] = useState(null);

    const [moderatorData, setModeratorData] = useState(null)

    const [playing, setPlaying] = useState(false)
    const videoRef = useRef(null)

    const actionSheetRef = useRef();
    const [reportDate, setReportDate] = React.useState(dayjs().format());
    const [halfMonth, setHalfMonth] = React.useState(dayjs().date() <= 15 ? 'first' : 'second');

    const handleOpenPicker = () => {
        actionSheetRef.current?.show();
    };

    const handleSelect = ({ year, month, half }) => {
        console.log({ year, month, half })
        setReportDate(dayjs(`01-${String(month).padStart(2, '0')}-${year}`, 'DD-MM-YYYY').format())
        setHalfMonth(half);
    };

    // const openMonthYearSelector = async () => {
    //     const result = await SheetManager.show('month-year-selector');
    //     if (result?.payload) {
    //       console.log('Selected:', result.payload); // { month, year }
    //       const { month, year } = result.payload

    //       setReportDate(dayjs(`01-${month}-${year}`, 'DD-MM-YYYY').format())
    //     }
    //   }

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'ProfileScreen',
            screen_class: 'ProfileScreen'
        })
    }, [])

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

        refreshModeratorData()
        // getSubscriptionInfo()
    }

    const refreshModeratorData = () => {
        if (currentUser?.is_moderators) {
            setModeratorData({})
            let startDate, endDate;

            if (halfMonth === 'first') {
                startDate = dayjs(reportDate).startOf('month');
                endDate = dayjs(reportDate).date(15);
            } else {
                startDate = dayjs(reportDate).date(16);
                endDate = dayjs(reportDate).endOf('month');
            }

            console.log({ startDate: startDate.format('DD/MM/YYYY'), endDate: endDate.format('DD/MM/YYYY') })

            apiClient.get(`users/stats?start_date=${startDate.format('DD/MM/YYYY')}&end_date=${endDate.format('DD/MM/YYYY')}`)
                .then((res) => {
                    if (res && res.data && res.data.success) {
                        setModeratorData(res.data.data.data)
                    }
                })
                .catch((error) => {
                    console.log({ error })
                })
        }
    }

    useEffect(() => {
        refreshModeratorData()
    }, [reportDate, halfMonth])

    const openModeratorFAQs = () => {
        navigation.push('ModeratorFAQsScreen')
    }

    const onAddDislikes = () => {
        // navigation.push('DislikeUpdateScreen', { dislikes: dislikes, onUpdated: (newList) => setDislikes(newList) })
        // navigation.push('MatchingInfoUpdateScreen', { canClose: true })
        navigation.push('InterestVideoScreen', { canClose: true })
    }

    const onAddLikes = () => {
        // navigation.push('InterestUpdateScreen', { likes: likes, onUpdated: (newList) => setLikes(newList) })
        // navigation.push('MatchingInfoUpdateScreen', { canClose: true })
        navigation.push('InterestVideoScreen', { canClose: true })
    }

    const onEditPurposes = () => {
        // navigation.push('PurposeProfileScreen', { purposes: purposes, onUpdated: (newList) => setPurposes(newList) })
        navigation.push('InterestVideoScreen', { canClose: true })
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
    const playVideo = async () => {
        if (videoRef && videoRef.current) {

            await VideoManager.stopCurrent();
            videoRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 })
            VideoManager.setCurrent(videoRef.current);
        }
    }

    const pauseVideo = () => {
        if (videoRef && videoRef.current) {
            videoRef.current.setStatusAsync({ shouldPlay: false })
        }
    }

    const openEditVideo = async () => {
        navigation.push('VideoListEditScreen')

        // const options = [
        //     { text: 'Update profile Video' },
        //     { text: 'Remove profile video', color: '#FF8B8B' }
        // ]

        // await SheetManager.show('cmd-action-sheets', {
        //     payload: {
        //         actions: options,
        //         onPress(index) {
        //             console.log({ index })
        //             if (index === 0) {
        //                 // navigation.push('ProfileVideoUpdateScreen')

        //                 navigation.push('VideoListEditScreen')
        //             } else {
        //                 apiClient
        //                     .post("users/update", { video_intro: null })
        //                     .then((res) => {
        //                         if (res && res.data && res.data.success) {
        //                             setCurrentUser(res.data.data)
        //                         } else {
        //                             Toast.show({ text1: res.data.message, type: "error" });
        //                         }
        //                     })
        //                     .catch((error) => {
        //                         console.log({ error });
        //                     });
        //             }
        //         },
        //     },
        // });
    }

    const onSetStatus = () => {
        navigation.navigate('OnlineStatusScreen')
    }

    const reapplyProfileReview = () => {
        apiClient.get(`users/reapply-profile-review`)
            .then((res) => {
                if (res && res.data && res.data.data) {
                    setCurrentUser(res.data.data)
                }
            })
            .catch((error) => {
                console.log({ error })
            })
    }

    const startChatSupport = () => {
        apiClient.get(`matches/start-chat-support`)
            .then((res) => {
                if (res && res.data && res.data.data) {
                    navigation.push('MessageScreen', { conversation: res.data.data })
                }
            })
            .catch((error) => {
                console.log({ error })
            })
    }

    const onShareProfile = () => {
        apiClient
            .get(`users/${currentUser.id}/share-link`)
            .then((res) => {
                console.log({ res: res.data.data });

                setShowShare(res.data.data);
            })
            .catch((error) => {
                console.log({ error });
            });
    }

    const onUpdateJourney = () => {
        navigation.push('JourneySelectionScreen', { isUpdate: true })
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent style='dark' />
            <View style={{ borderBottomWidth: 0.5, borderBottomColor: 'white', backgroundColor: '#725ED4', paddingHorizontal: 16, paddingBottom: 8, paddingTop: insets.top, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                {/* <View style={{ width: '100%', height: 30, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={openSetting} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={images.setting_icon} style={{ width: 22, height: 22 }} contentFit='contain' />
                    </TouchableOpacity>
                </View> */}
                <View style={{ gap: 8, paddingBottom: 3, width: '100%', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={onShareProfile} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome6 name='share-from-square' color='white' size={22} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={openSetting} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={images.setting_icon} style={{ width: 22, height: 22 }} contentFit='contain' />
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', gap: 16, paddingBottom: 16 }}>
                    <View>
                        <AvatarImage
                            avatar={currentUser?.avatar}
                            style={{ width: 80, height: 80, borderRadius: 40 }}
                            full_name={currentUser?.full_name}
                        />
                        <TouchableOpacity onPress={openEditAvatar}
                            style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.mainColor, borderWidth: 1, borderColor: 'white' }}>
                            <Image source={images.edit_icon} style={{ width: 15, height: 15, tintColor: '#E8FF58' }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, gap: 5, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>{`${currentUser?.full_name}`}</Text>
                        {currentUser?.login_type !== 'apple' &&
                            <Text style={{ fontSize: 12, color: '#eeeeee', fontWeight: '500' }}>{`${currentUser?.email}`}</Text>
                        }
                        <TouchableOpacity onPress={onSetStatus} style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white' }}>{capitalize(currentUser?.online_status)}</Text>
                            <FontAwesome6 name='chevron-down' size={12} color='white' />
                        </TouchableOpacity>
                    </View>
                    <View style={{ position: "absolute", gap: 1, left: 60, top: -35, flexDirection: 'column-reverse' }}>
                        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#E8FF58' }} />
                        <View style={{ marginLeft: 3, width: 10, height: 10, borderRadius: 5, backgroundColor: '#E8FF58' }} />
                        <TouchableOpacity
                            onPress={() => navigation.navigate('UserNoteScreen')}
                            style={{
                                marginLeft: 6, paddingHorizontal: 16, height: 26, borderRadius: 13, alignItems: 'center',
                                justifyContent: 'center', backgroundColor: '#E8FF58'
                            }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'black' }}>Share a note</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {
                    currentUser?.is_moderators && moderatorData &&
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', gap: 5 }}>
                        <TouchableOpacity onPress={() => setMode('view')} style={{ backgroundColor: mode === 'view' ? '#F1F1F3' : '#D3CEEA20', height: 30, borderRadius: 4, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 14, color: mode === 'view' ? '#725ED4' : '#FFFFFF' }}>My Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setMode('moderator')} style={{ backgroundColor: mode === 'moderator' ? '#F1F1F3' : '#D3CEEA20', height: 30, borderRadius: 4, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 14, color: mode === 'moderator' ? '#725ED4' : '#FFFFFF' }}>Moderator</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setMode('edit')} style={{ backgroundColor: mode === 'edit' ? '#F1F1F3' : '#D3CEEA20', height: 30, borderRadius: 4, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 14, color: mode === 'edit' ? '#725ED4' : '#FFFFFF' }}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                }
                {
                    !(currentUser?.is_moderators && moderatorData) &&
                    <View style={{ height: 25, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => setMode('view')} style={{ borderBottomWidth: 1, borderBottomColor: mode === 'view' ? '#E8FF58' : 'transparent', height: 25, alignItems: 'center', width: 50, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 14, color: mode === 'view' ? '#E8FF58' : 'rgba(232, 255, 88, 0.5)' }}>View</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => setMode('edit')} style={{ borderBottomWidth: 1, borderBottomColor: mode === 'edit' ? '#E8FF58' : 'transparent', height: 25, alignItems: 'center', width: 50, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 14, color: mode === 'edit' ? '#E8FF58' : 'rgba(232, 255, 88, 0.5)' }}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
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
                            <View>
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
                                    <Image source={images.update_video} style={{ width: 18, height: 18, tintColor: 'black' }} contentFit='contain' />
                                    <Text style={{ color: 'black', fontSize: 16, fontWeight: '600' }}>Update my video</Text>
                                </View>
                                <View style={{
                                    width: Math.min(Dimensions.get('screen').width - 32, 600), height: Math.min(Dimensions.get('screen').width + 60, 750),
                                    backgroundColor: colors.mainColor, borderRadius: 20, marginBottom: 8, alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {
                                        currentUser?.video_intro &&
                                        <CustomVideo
                                            style={{ borderWidth: 2, borderColor: '#CDB8E2', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 20 }}
                                            ref={videoRef}
                                            sources={[
                                                currentUser?.video_intro,
                                                currentUser?.video_purpose,
                                                currentUser?.video_interests,
                                            ]}
                                            subtitles={[
                                                currentUser?.subtitle_intro,
                                                currentUser?.subtitle_purpose,
                                                currentUser?.subtitle_interests,
                                            ]}
                                            resizeMode={ResizeMode.COVER}
                                            onPlaybackStatusUpdate={status => {
                                                setPlaying(status.isPlaying || status.isBuffering || status.shouldPlay);
                                            }}
                                        />
                                    }
                                    <TouchableOpacity onPress={openEditVideo} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.mainColor, borderWidth: 1, borderColor: '#E8FF58' }}>
                                        <Image source={images.edit_icon} style={{ width: 15, height: 15, tintColor: '#E8FF58' }} />
                                    </TouchableOpacity>
                                    {
                                        !playing && currentUser?.video_intro &&
                                        <TouchableOpacity onPress={playVideo} style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={images.play_button} style={{ width: 50, height: 50 }} />
                                        </TouchableOpacity>
                                    }
                                    {
                                        playing && currentUser?.video_intro &&
                                        <TouchableOpacity onPress={pauseVideo} style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={images.pause_icon} style={{ width: 50, height: 50 }} />
                                        </TouchableOpacity>
                                    }
                                    {
                                        !currentUser?.video_intro &&
                                        <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>No profile video.</Text>
                                    }
                                </View>
                            </View>
                            {/* <View style={{ backgroundColor: '#725ED4', paddingHorizontal: 24, paddingVertical: 8, justifyContent: 'space-between', width: Math.min(Dimensions.get('screen').width - 32, 600), height: Math.min(Dimensions.get('screen').width + 60, 750), borderRadius: 20, overflow: 'hidden' }}>
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
                            </View> */}
                            {/* <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                <View style={{ flexDirection: 'row', flex: 1, gap: 5, alignItems: 'center', justifyContent: 'flex-start' }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#726F70', backgroundColor: 'white' }}>
                                        <Image source={images.birthday_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                                    </View>
                                    {currentUser?.birthday && currentUser?.birthday.includes('/') && <Text style={{ fontSize: 14, color: 'black' }}>{`${dayjs().diff(dayjs(currentUser?.birthday, 'DD/MM/YYYY'), 'year')} yrs`}</Text>}
                                    {currentUser?.birthday && currentUser?.birthday.includes('-') && <Text style={{ fontSize: 14, color: 'black' }}>{`${dayjs().diff(dayjs(currentUser?.birthday, 'MM-DD-YYYY'), 'year')} yrs`}</Text>}
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
                            </View> */}

                            {/* <View>
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
                                    <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }}>My profile tag</Text>
                                </View>
                                <View style={{
                                    gap: 8, borderRadius: 15, height: 53, paddingHorizontal: 16, backgroundColor: '#E9E5FF',
                                    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#000000',
                                    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.25, elevation: 1
                                }}>
                                    <View style={{ flex: 1, gap: 5 }}>
                                        <Text style={{ fontSize: 11, color: '#333333aa' }}>My profile tag</Text>
                                        {
                                            currentUser?.journey ?
                                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>{currentUser?.journey?.name}</Text>
                                                :
                                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>{currentUser?.tag?.name}</Text>
                                        }
                                    </View>
                                </View>
                            </View> */}

                            <View style={{ width: "100%" }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 8,
                                        paddingVertical: 12,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{ color: "black", fontSize: 14, fontWeight: "bold" }}>
                                        Journey
                                    </Text>
                                </View>

                                <View style={[styles.shadow, { alignItems: 'center', backgroundColor: '#E9E5FF', borderRadius: 15, paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexDirection: 'row' }]}
                                >
                                    <View style={{ flex: 1, gap: 10 }}>
                                        <Text style={{ fontSize: 14, color: 'black', fontWeight: 'bold' }}>{currentUser?.journey_category?.name}</Text>
                                        {
                                            currentUser?.journey &&
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#725ED4' }} />
                                                <Text style={{ flex: 1, color: '#333333', fontSize: 14, fontWeight: '400' }}>{currentUser?.journey?.name}</Text>
                                            </View>
                                        }
                                    </View>
                                    {/* <FontAwesome6 name='chevron-right' size={20} color={colors.mainColor} /> */}
                                </View>
                            </View>

                            {/* <View >
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
                                    <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }}>Your purposes</Text>

                                    <TouchableOpacity onPress={onEditPurposes} style={{ width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#725ED4' }}>
                                        <Image style={{ width: 10, height: 10, tintColor: '#CDB8E2' }} source={images.edit_icon} contentFit='contain' />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ paddingHorizontal: 16, paddingVertical: 16, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 16, backgroundColor: '#E9E5FF', borderRadius: 10 }}>
                                    {
                                        purposes.map((item) => {
                                            return (
                                                <TouchableOpacity key={item.name} style={{ flexDirection: 'row', gap: 5, paddingHorizontal: 16, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#725ED4' }}>
                                                    <Text style={{ fontSize: 14, color: 'white', fontWeight: '700' }}>{item.name}</Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                </View>
                            </View> */}
                            <View>
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
                                    <Image source={images.interest_icon} style={{ width: 18, height: 18, tintColor: '#000000' }} contentFit='contain' />
                                    <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>Interests and hobbies</Text>

                                    <TouchableOpacity onPress={onAddLikes} style={{ width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#725ED4' }}>
                                        <Image style={{ width: 10, height: 10, tintColor: '#CDB8E2' }} source={images.edit_icon} contentFit='contain' />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ paddingVertical: 16, paddingHorizontal: 16, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, paddingBottom: 16, backgroundColor: '#E9E5FF' }}>
                                    {
                                        likes.map((item) => {
                                            return (
                                                <TouchableOpacity key={item.name} style={{ flexDirection: 'row', gap: 5, paddingHorizontal: 16, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#725ED4' }}>
                                                    <Text style={{ fontSize: 14, color: 'white', fontWeight: '700' }}>{item.name}</Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                </View>
                            </View>
                            <View >
                                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center' }}>
                                    <Image source={images.dislike_icon} style={{ width: 18, height: 18, tintColor: 'black' }} contentFit='contain' />
                                    <Text style={{ color: 'black', fontSize: 16, fontWeight: '600' }}>Dislike</Text>

                                    <TouchableOpacity onPress={onAddDislikes} style={{ width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#725ED4' }}>
                                        <Image style={{ width: 10, height: 10, tintColor: '#CDB8E2' }} source={images.edit_icon} contentFit='contain' />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#E9E5FF', paddingVertical: 16, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 16 }}>
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

                            <TouchableOpacity
                                onPress={() => navigation.navigate('NameUpdateScreen', { isUpdate: true })}
                                style={{
                                    gap: 8, borderRadius: 15, height: 55, paddingHorizontal: 16, backgroundColor: 'white',
                                    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#000000',
                                    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.25, elevation: 1
                                }}>
                                <View style={{ flex: 1, gap: 5 }}>
                                    <Text style={{ fontSize: 11, color: '#333333aa' }}>Name</Text>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>{currentUser?.full_name}</Text>
                                </View>
                                <FontAwesome6 name='chevron-right' size={20} color='#725ED4' />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('BirthdayUpdateScreen', { isUpdate: true })}
                                style={{
                                    gap: 8, borderRadius: 15, height: 55, paddingHorizontal: 16, backgroundColor: 'white',
                                    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#000000',
                                    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.25, elevation: 1
                                }}>
                                <View style={{ flex: 1, gap: 5 }}>
                                    <Text style={{ fontSize: 11, color: '#333333aa' }}>Age</Text>
                                    {currentUser?.birthday && currentUser?.birthday.includes('/') && <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>{`${dayjs().diff(dayjs(currentUser?.birthday, 'DD/MM/YYYY'), 'year')} yrs`}</Text>}
                                    {currentUser?.birthday && currentUser?.birthday.includes('-') && <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>{`${dayjs().diff(dayjs(currentUser?.birthday, 'MM-DD-YYYY'), 'year')} yrs`}</Text>}
                                </View>
                                <FontAwesome6 name='chevron-right' size={20} color='#725ED4' />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('GenderUpdateScreen', { isUpdate: true })}
                                style={{
                                    gap: 8, borderRadius: 15, height: 55, paddingHorizontal: 16, backgroundColor: 'white',
                                    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#000000',
                                    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.25, elevation: 1
                                }}>
                                <View style={{ flex: 1, gap: 5 }}>
                                    <Text style={{ fontSize: 11, color: '#333333aa' }}>Your gender</Text>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>{currentUser?.gender ?? ''}</Text>
                                </View>
                                <FontAwesome6 name='chevron-right' size={20} color='#725ED4' />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('PronounsUpdateScreen', { isUpdate: true })}
                                style={{
                                    gap: 8, borderRadius: 15, height: 55, paddingHorizontal: 16, backgroundColor: 'white',
                                    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#000000',
                                    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.25, elevation: 1
                                }}>
                                <View style={{ flex: 1, gap: 5 }}>
                                    <Text style={{ fontSize: 11, color: '#333333aa' }}>Your pronouns</Text>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>{currentUser?.pronouns ?? ''}</Text>
                                </View>
                                <FontAwesome6 name='chevron-right' size={20} color='#725ED4' />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('LocationUpdateScreen', { isUpdate: true })}
                                style={{
                                    gap: 8, borderRadius: 15, height: 55, paddingHorizontal: 16, backgroundColor: 'white',
                                    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#000000',
                                    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.25, elevation: 1
                                }}>
                                <View style={{ flex: 1, gap: 5 }}>
                                    <Text style={{ fontSize: 11, color: '#333333aa' }}>City you live</Text>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>{currentUser?.location ?? ''}</Text>
                                </View>
                                <FontAwesome6 name='chevron-right' size={20} color='#725ED4' />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            }

            {
                mode === 'moderator' &&
                <View style={{ flex: 1 }}>
                    <ScrollView
                        refreshControl={<RefreshControl
                            refreshing={false}
                            onRefresh={onRefresh} />}
                        showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16, paddingTop: 24 }}>
                        <View style={{ flex: 1, width: Platform.isPad ? 600 : '100%', alignSelf: 'center', gap: 16, marginBottom: insets.bottom + 120 }}>
                            <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Text style={{ fontSize: 16, color: 'black', fontWeight: "bold" }}>
                                    {`${dayjs(reportDate).format('MMMM, YYYY')} (${halfMonth === 'first' ? '1st-15th' : '16th-31st'})`}
                                </Text>

                                <TouchableOpacity onPress={handleOpenPicker} style={{ borderRadius: 5, gap: 5, backgroundColor: '#725ED4', flexDirection: "row", paddingHorizontal: 12, paddingVertical: 6 }}>
                                    <Text style={{ fontSize: 12, color: 'white' }}>View Stats by</Text>
                                    <FontAwesome6 size={12} color='white' name='chevron-down' />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={{ backgroundColor: '#D0E2B8', borderRadius: 10, padding: 16, gap: 5, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                    <Text style={{ fontSize: 11, fontWeight: '400', color: 'black' }} >Active</Text>
                                    <Text style={{ fontSize: 20, fontWeight: "bold", color: 'black' }}>{currentUser?.is_active ? 'Active' : 'Inactive'}</Text>
                                </View>
                                <View style={{ backgroundColor: '#E2D7B8', borderRadius: 10, padding: 16, gap: 5, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                    <Text style={{ fontSize: 11, fontWeight: '400', color: 'black' }} >Joined on</Text>
                                    <Text style={{ fontSize: 20, fontWeight: "bold", color: 'black' }}>{dayjs(currentUser?.createdAt).format('MMM, DD')}</Text>
                                </View>
                                <View style={{ backgroundColor: '#CCECFA', borderRadius: 10, padding: 16, gap: 5, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                    <Text style={{ fontSize: 11, fontWeight: '400', color: 'black' }} >Earnings</Text>
                                    <Text style={{ fontSize: `$${moderatorData?.earning?.total ?? 0}`.length > 10 ? 18 : 20, fontWeight: "bold", color: 'black' }}>{`$${moderatorData?.earning?.total ?? 0}`}</Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={openModeratorFAQs} style={{ flexDirection: 'row', gap: 16, backgroundColor: 'white', borderWidth: 2, borderColor: '#725ED4', borderRadius: 10, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 14, color: '#725ED4', fontWeight: "bold" }}>Frequently Asked Questions</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={startChatSupport} style={{ flexDirection: 'row', gap: 16, backgroundColor: '#725ED4', borderRadius: 10, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
                                <FontAwesome6 name='headset' size={18} color='white' />
                                <Text style={{ fontSize: 14, color: 'white', fontWeight: "bold" }}>Kuky Support</Text>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>Statistics</Text>
                                {/* <Text style={{ fontSize: 12, fontWeight: '400', color: 'black' }}>{`${dayjs().startOf('month').format('MMM, DD')} - ${dayjs().format('MMM, DD')}`}</Text> */}
                            </View>
                            <View style={{ width: '100%', gap: 6 }}>
                                <View style={{
                                    backgroundColor: '#D3CEEA', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
                                    flexDirection: "row", alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: "400", color: '#494949' }}>Messages Sent:</Text>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>{moderatorData.messages_count ?? 0}</Text>
                                </View>

                                <View style={{
                                    backgroundColor: '#D3CEEA', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
                                    flexDirection: "row", alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: "400", color: '#494949' }}>Matches Participated In:</Text>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>{moderatorData.matches_count ?? 0}</Text>
                                </View>

                                <View style={{
                                    backgroundColor: '#D3CEEA', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
                                    flexDirection: "row", alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: "400", color: '#494949' }}>Calls Attended:</Text>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>{moderatorData.total_call ?? 0}</Text>
                                </View>

                                <View style={{
                                    backgroundColor: '#D3CEEA', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
                                    flexDirection: "row", alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: "400", color: '#494949' }}>Total Call Duration:</Text>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>{formatSeconds(moderatorData.total_call_duration ?? 0)}</Text>
                                </View>

                                {moderatorData.total_session_time &&
                                    <View style={{
                                        backgroundColor: '#D3CEEA', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
                                        flexDirection: "row", alignItems: 'center', justifyContent: 'space-between'
                                    }}>
                                        <Text style={{ fontSize: 12, fontWeight: "400", color: '#494949' }}>App Usage Time:</Text>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>{formatSeconds(moderatorData.total_session_time)}</Text>
                                    </View>
                                }

                                <View style={{
                                    backgroundColor: '#D3CEEA', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
                                    flexDirection: "row", alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: "400", color: '#494949' }}>Response Rate:</Text>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>{`${moderatorData.response_rate ?? 0}%`}</Text>
                                </View>
                            </View>

                            {!!moderatorData.earning &&
                                <>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>Statistics</Text>
                                    <View style={{ padding: 16, borderRadius: 10, backgroundColor: '#DEDEDE50', gap: 8 }}>
                                        {/* <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                            <Text>Bonuses: </Text>
                                            <Text>{moderatorData.earning.bonuses}</Text>
                                        </View> */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                            <Text>Next payout date: </Text>
                                            <Text>{moderatorData.earning.next_payment_date}</Text>
                                        </View>
                                    </View>
                                </>
                            }
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
                            <View style={{ backgroundColor: '#E9E5FF', gap: 16, borderWidth: 1, borderColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 16 }}>
                                {
                                    currentUser?.profile_approved === 'approved' &&
                                    <View style={{ width: '100%', flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                                        <Image source={images.profile_approved} style={{ width: 25, height: 25 }} contentFit='contain' />
                                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'black' }}>Your account has been approved.</Text>
                                    </View>
                                }
                                {
                                    (currentUser?.profile_approved === 'pending' || currentUser?.profile_approved === 'partially_approved' || currentUser?.profile_approved === 'resubmitted') &&
                                    <View style={{ width: '100%', flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                                        <Image source={images.profile_pending} style={{ width: 25, height: 25 }} contentFit='contain' />
                                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'black' }}>Your account is under review.</Text>
                                    </View>
                                }
                                {
                                    currentUser?.profile_approved === 'rejected' &&
                                    <View style={{ width: '100%', flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                                        <Image source={images.profile_rejected} style={{ width: 25, height: 25 }} contentFit='contain' />
                                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'black' }}>Your account was rejected.</Text>
                                    </View>
                                }
                                {
                                    currentUser?.profile_approved === 'rejected' &&
                                    <View style={{ width: '100%', gap: 8 }}>
                                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#00000077' }}>Here is why:</Text>
                                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'black', paddingLeft: 8, lineHeight: 18 }}>{currentUser?.profile_rejected_reason}</Text>
                                    </View>
                                }
                                {
                                    currentUser?.profile_approved === 'rejected' &&
                                    <TouchableOpacity onPress={reapplyProfileReview} style={{ width: '100%', height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mainColor }}>
                                        <Text style={{ color: '#E8FF58', fontSize: 16, fontWeight: 'bold' }}>Re-apply for Review</Text>
                                    </TouchableOpacity>
                                }
                            </View>

                            {/* <TouchableOpacity onPress={onSetStatus} style={[{ flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'center', height: 40, gap: 8, alignItems: 'center', borderRadius: 20, backgroundColor: '#F5F5F5' }, styles.shadow]}>
                                <Text style={{ flex: 1, fontSize: 16, color: '#333333', fontWeight: 'bold' }}>Set your status</Text>
                                <View style={{ paddingHorizontal: 16, height: 20, borderRadius: 10, backgroundColor: '#333333', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: getStatusColor(currentUser?.online_status) }}>{capitalize(currentUser?.online_status)}</Text>
                                </View>
                                <FontAwesome6 name='chevron-right' color={colors.mainColor} size={16} />
                            </TouchableOpacity> */}

                            {/* <TouchableOpacity onPress={onShare} style={{ paddingHorizontal: 32, justifyContent: 'center', height: 40, alignItems: 'center', borderRadius: 20, backgroundColor: colors.mainColor }}>
                                    <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>Invite a friend</Text>
                                </TouchableOpacity> */}

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
                                    <Text style={{ fontSize: 24, color: 'black', fontWeight: 'bold' }}>{`${currentUser?.full_name}`}</Text>
                                    <OnlineStatus radius={20} status={currentUser?.online_status} isRecentOnline={true} />
                                </View>
                                {/* <View style={{ maxWidth: '50%', backgroundColor: '#7B65E8', height: 30, borderRadius: 15, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: '#E8FF58', textAlign: 'center', fontSize: (currentUser?.journey?.name ?? '').length > 20 ? 12 : 14, fontWeight: 'bold' }}>{currentUser?.journey?.name}</Text>
                                </View> */}
                            </View>
                            {
                                currentUser && ((currentUser?.is_avatar_blur && !currentUser?.avatar_blur) ||
                                    (currentUser?.is_video_intro_blur && !currentUser?.video_intro_blur) ||
                                    (currentUser?.is_video_purpose_blur && !currentUser?.video_purpose_blur) ||
                                    (currentUser?.is_video_interests_blur && !currentUser?.video_interests_blur)) &&
                                <View style={{ backgroundColor: '#FF8B8B', gap: 16, borderWidth: 1, borderColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 8 }}>
                                    <Text style={{ fontSize: 12, color: 'black', fontWeight: '600', lineHeight: 16 }}>{'Your blurred avatar/video is now processing and will be available shortly.'}</Text>
                                </View>
                            }
                            <View style={{ justifyContent: 'flex-end', width: Math.min(Dimensions.get('screen').width - 32, 600), height: Math.min(Dimensions.get('screen').width + 60, 750), borderRadius: 20, overflow: 'hidden' }}>
                                {!playing && <AvatarImage avatar={currentUser?.avatar} full_name={currentUser?.full_name} style={{ borderWidth: 2, borderColor: '#CDB8E2', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 20 }} />}
                                {
                                    currentUser?.video_intro &&
                                    <CustomVideo
                                        style={{ borderWidth: 2, borderColor: '#CDB8E2', display: playing ? 'flex' : 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10 }}
                                        ref={videoRef}
                                        sources={[
                                            currentUser?.video_intro,
                                            currentUser?.video_purpose,
                                        ]}
                                        subtitles={[
                                            currentUser?.subtitle_intro,
                                            currentUser?.subtitle_purpose,
                                        ]}
                                        resizeMode={ResizeMode.COVER}
                                        onPlaybackStatusUpdate={status => {
                                            // console.log({ status, url: currentUser?.video_intro })
                                            setPlaying(status.isPlaying || status.isBuffering || status.shouldPlay);
                                        }}
                                    />
                                }
                                {!playing && currentUser?.video_intro &&
                                    <View style={{ alignItems: 'center', gap: 3, marginBottom: 16 }}>
                                        {!playing &&
                                            <TouchableOpacity onPress={playVideo} style={{ alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={images.play_icon} style={{ width: 80, height: 80 }} contentFit='contain' />
                                            </TouchableOpacity>
                                        }

                                        <Text style={{ color: '#949494', fontSize: 10, fontWeight: 'bold' }}>Watch video</Text>
                                    </View>
                                }
                                {playing &&
                                    <TouchableOpacity onPress={pauseVideo} style={{ position: 'absolute', top: 16, left: 16, width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={images.pause_icon} style={{ width: 50, height: 50, borderRadius: 25, }} contentFit='contain' />
                                    </TouchableOpacity>
                                }
                                {
                                    !playing && currentUser?.user_note &&
                                    <View style={{
                                        position: 'absolute', top: 10, left: 16, right: 16, backgroundColor: '#7B65E8ee',
                                        paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10,
                                    }}>
                                        <Text style={{ color: '#E8FF58', width: '100%', textAlign: 'center', fontSize: 13, fontWeight: '600' }}>{currentUser?.user_note}</Text>
                                    </View>
                                }
                            </View>
                            {
                                (currentUser?.summary && currentUser?.summary.length > 0 && currentUser?.video_intro) ?
                                    <View style={{ gap: 12, alignItems: 'center', width: '100%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#E9E5FF' }}>
                                        <Text style={{
                                            fontSize: 12, fontWeight: '500', flex: 1, lineHeight: 18
                                        }}>{currentUser?.summary}</Text>
                                    </View>
                                    :
                                    <View style={{ gap: 12, alignItems: 'center', width: '100%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#E9E5FF' }}>
                                        <>
                                            <Text style={{
                                                fontSize: 12, fontWeight: '500', flex: 1, lineHeight: 18
                                            }}>{'Recording your video to see your profile transcript'}</Text>
                                            <TouchableOpacity onPress={() => navigation.push('IntroductionVideoScreen')} style={{ paddingHorizontal: 16, height: 30, borderRadius: 15, backgroundColor: '#333333', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ color: 'white', fontSize: 13, fontWeight: '500' }}>Tap to Introduce Yourself</Text>
                                            </TouchableOpacity>
                                        </>
                                    </View>
                            }
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                <View style={{ flexDirection: 'row', flex: 1, gap: 5, alignItems: 'center', justifyContent: 'flex-start' }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#726F70', backgroundColor: 'white' }}>
                                        <Image source={images.birthday_icon} style={{ width: 18, height: 18 }} contentFit='contain' />
                                    </View>
                                    {currentUser?.birthday && currentUser?.birthday.includes('/') && <Text style={{ fontSize: 14, color: 'black' }}>{`${dayjs().diff(dayjs(currentUser?.birthday, 'DD/MM/YYYY'), 'year')} yrs`}</Text>}
                                    {currentUser?.birthday && currentUser?.birthday.includes('-') && <Text style={{ fontSize: 14, color: 'black' }}>{`${dayjs().diff(dayjs(currentUser?.birthday, 'MM-DD-YYYY'), 'year')} yrs`}</Text>}
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
                            {/* <View>
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
                            </View> */}

                            <View style={{ width: "100%" }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 8,
                                        paddingVertical: 12,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{ color: "black", fontSize: 14, fontWeight: "bold" }}>
                                        Journey
                                    </Text>
                                </View>

                                <View style={[styles.shadow, { alignItems: 'center', backgroundColor: '#E9E5FF', borderRadius: 15, paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexDirection: 'row' }]}
                                >
                                    <View style={{ flex: 1, gap: 10 }}>
                                        <Text style={{ fontSize: 14, color: 'black', fontWeight: 'bold' }}>{currentUser?.journey_category?.name}</Text>
                                        {
                                            currentUser?.journey &&
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#725ED4' }} />
                                                <Text style={{ flex: 1, color: '#333333', fontSize: 14, fontWeight: '400' }}>{currentUser?.journey?.name}</Text>
                                            </View>
                                        }
                                    </View>
                                    {/* <FontAwesome6 name='chevron-right' size={20} color={colors.mainColor} /> */}
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

            <ShareModal
                visible={showShare !== null}
                onClose={() => setShowShare(null)}
                full_name={currentUser?.full_name}
                shareLink={showShare ?? ""}
                shareCode={currentUser?.referral_id ?? ''}
            />

            <MonthYearPickerSheet ref={actionSheetRef} onSelect={handleSelect} />
        </View>
    )
}

export default ProfileScreen