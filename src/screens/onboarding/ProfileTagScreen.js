import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, DeviceEventEmitter, Dimensions, Platform, ScrollView, StyleSheet, View } from 'react-native'
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
import { userAtom } from '@/actions/global'
import { LinearGradient } from 'expo-linear-gradient'
import { useAtom, useAtomValue } from 'jotai'
import constants from '@/utils/constants'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import AvatarImage from '@/components/AvatarImage'

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
    },
    name: {
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'left',
        color: 'white',
        padding: 16
    },
    nameContainer: {
        position: 'absolute',
        bottom: 0, left: 0,
        height: '50%',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingBottom: 16, paddingLeft: 10,
        width: '100%'
    },
    nameBackground: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0
    }
})

const ProfileTagScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const [currentUser, setCurrentUser] = useAtom(userAtom)
    const [loading, setLoading] = useState(false)


    const getNewTag = () => {
        setLoading(true)
        apiClient.get('interests/profile-tag')
            .then((res) => {
                console.log({ res })
                setLoading(false)
                if (res && res.data && res.data.success) {
                    setCurrentUser(res.data.data)
                    DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS)
                }
            })
            .catch((error) => {
                console.log({ error })
                setLoading(false)
            })
    }

    useEffect(() => {
        getNewTag()
    }, [])

    const onContinue = () => {
        if (currentUser?.tag) {
            NavigationService.reset('DisclaimeScreen')
        } else {
            getNewTag()
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
            <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center', alignItems: 'center' }}>
                <Image source={images.logo_with_text} style={{ width: 120, height: 40, marginBottom: 32 }} contentFit='contain' />
                <Text style={{ fontSize: 13, fontWeight: '600', color: 'black' }}>{`Your Profile Tag`}</Text>
                <Text style={{ fontSize: 18, fontWeight: '600', color: 'black', lineHeight: 21, textAlign: 'center' }}>Based on your preferences, we’ve created a profile tag for you:</Text>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <View style={{ justifyContent: 'space-between', width: (Platform.isPad ? 600 : Dimensions.get('screen').width) - 64, height: (Platform.isPad ? 600 : Dimensions.get('screen').width) - 64, borderRadius: 20, overflow: 'hidden' }}>
                        {/* <Image source={{ uri: currentUser?.avatar }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 20 }} contentFit='cover' /> */}
                        <AvatarImage full_name={currentUser?.full_name} avatar={currentUser?.avatar} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 20 }} />
                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', padding: 8 }}>
                            <View style={{ backgroundColor: '#7B65E8', height: 30, borderRadius: 15, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>
                                {!loading && <Text style={{ color: '#E8FF58', fontSize: 14, fontWeight: 'bold' }}>{currentUser?.tag?.name}</Text>}
                                {loading && <ActivityIndicator color='white' size='small' />}
                            </View>
                        </View>
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.79)']}
                            style={styles.nameBackground}
                        />
                        {/* <Text style={styles.name}>{`${currentUser?.full_name}, ${dayjs().diff(dayjs(currentUser?.birthday, 'DD/MM/YYYY'), 'years')}`}</Text> */}

                        {currentUser?.birthday && currentUser?.birthday.includes('-') && <Text style={styles.name}>{`${currentUser?.full_name}, ${dayjs().diff(dayjs(currentUser?.birthday, 'MM-DD-YYYY'), 'years')}`}</Text>}
                        {currentUser?.birthday && currentUser?.birthday.includes('/') && <Text style={styles.name}>{`${currentUser?.full_name}, ${dayjs().diff(dayjs(currentUser?.birthday, 'DD/MM/YYYY'), 'years')}`}</Text>}
                        {!currentUser?.birthday && <Text style={styles.name}>{`${currentUser?.full_name}`}</Text>}
                    </View>
                </View>
                <View style={{ width: Platform.isPad ? 600 : '100%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                    <View style={{ backgroundColor: '#7B65E8', height: 30, borderRadius: 15, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>
                        {!loading && <Text style={{ color: '#E8FF58', fontSize: 14, fontWeight: 'bold' }}>{currentUser?.tag?.name}</Text>}
                        {loading && <ActivityIndicator color='white' size='small' />}
                    </View>
                </View>
                <Text style={{ fontSize: 14, color: 'black', textAlign: 'center' }}>{'This tag will represent your main interests and preferences. It helps others understand who you are and what you’re looking for.'}</Text>
            </View>

            <ButtonWithLoading
                onPress={onContinue}
                text={currentUser?.tag ? 'Continue' : 'Refresh'}
                loading={loading}
            />
        </View>
    )
}

export default ProfileTagScreen