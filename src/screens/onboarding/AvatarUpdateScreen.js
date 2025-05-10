import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { DeviceEventEmitter, Dimensions, Platform, StyleSheet, Switch, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import storage from '@react-native-firebase/storage'
import LoadingView from '@/components/LoadingView'
import apiClient from '@/utils/apiClient'
import Toast from 'react-native-toast-message'
import { useAtom, useSetAtom } from 'jotai'
import { userAtom } from '@/actions/global'
import { getAuthenScreen } from '@/utils/utils'
import analytics from '@react-native-firebase/analytics'
import { FontAwesome6 } from '@expo/vector-icons'
import constants from '../../utils/constants'
import Purchases from 'react-native-purchases'
import { BlurView } from 'expo-blur'
import CustomSwitch from '../../components/CustomSwitch'

const imageImage = `avatar${dayjs().unix()}.png`

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 16,
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 24
    },
    imageContainer: {
        backgroundColor: '#ECECEC', borderRadius: 20, alignItems: 'center',
        justifyContent: 'center',
        width: (Platform.isPad ? 600 : Dimensions.get('screen').width) - 48, height: (Platform.isPad ? 600 : Dimensions.get('screen').width) - 48,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
    },
    closeButton: {
        width: 30, height: 30, backgroundColor: '#333333',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 15,
        position: 'absolute', top: 8, right: 8
    }
})

const AvatarUpdateScreen = ({ navigation, route }) => {
    const { fromReview, fromUpdate } = route && route.params ? route.params : {}
    const insets = useSafeAreaInsets()
    const [currentUser, setUser] = useAtom(userAtom)
    const [image, setImage] = useState(currentUser?.avatar && currentUser?.avatar !== null ? { uri: currentUser?.avatar } : null)
    const reference = storage().ref(imageImage)
    const [imageUrl, setImageUrl] = useState(currentUser?.avatar ?? null)
    const [loading, setLoading] = useState(false)
    const [isBlur, setBlur] = useState(false)
    const [canBlur, setCanBlur] = useState(false)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'AvatarUpdateScreen',
            screen_class: 'AvatarUpdateScreen',
        })
    }, [])

    const loadSubscriptionInfo = async () => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            // console.log({ customerInfo: JSON.stringify(customerInfo) })

            if (
                customerInfo &&
                customerInfo.entitlements &&
                customerInfo.entitlements.active &&
                customerInfo.entitlements.active["blur_face"]
            ) {
                setCanBlur(true)
                setBlur(true)
            }
        } catch (error) {
            console.log({ error });
        }
    };

    useEffect(() => {
        loadSubscriptionInfo()

        const listener = DeviceEventEmitter.addListener(constants.REFRESH_PROFILE, loadSubscriptionInfo)

        return () => {
            listener.remove()
        }
    }, [])

    useEffect(() => {
        if (imageUrl !== null && imageUrl !== currentUser?.avatar) {
            onContinue()
        }
    }, [imageUrl])

    const onUpload = async () => {
        try {
            if (image && image.uri) {
                setLoading(true)

                const uploadedFile = await reference.putFile(image.uri);

                const url = await storage().ref(imageImage).getDownloadURL();
                console.log({ url });
                setLoading(false);
                setImageUrl(url);
            }
        } catch (error) {
            console.log({ error });
            setLoading(false);
        }
    };

    const onContinue = () => {
        try {
            setLoading(true)
            console.log({ imageUrl })
            apiClient.post('users/update', { avatar: imageUrl, is_avatar_blur: isBlur })
                .then((res) => {
                    setLoading(false)
                    if (res && res.data && res.data.success) {
                        setUser(res.data.data)
                        console.log({ user: res.data.data })
                        // NavigationService.reset('PurposeUpdateScreen', { onboarding: true })

                        if (fromReview || fromUpdate) {
                            navigation.goBack()
                        } else {
                            // NavigationService.reset(getAuthenScreen(res.data.data))

                            if (!currentUser?.video_intro) {
                                NavigationService.reset('IntroductionVideoTutorialScreen', { fromOnboarding: true })
                            } else if (!currentUser?.video_purpose) {
                                NavigationService.reset('JourneyVideoTutorialScreen', { fromOnboarding: true })
                            } else {
                                NavigationService.reset('Dashboard')
                            }
                        }

                        // Toast.show({ text1: res.data.message, type: 'success' })

                        // navigation.goBack()
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

    const onSkip = () => {
        if (!currentUser?.video_intro) {
            NavigationService.reset('IntroductionVideoTutorialScreen', { fromOnboarding: true })
        } else if (!currentUser?.video_purpose) {
            NavigationService.reset('JourneyVideoTutorialScreen', { fromOnboarding: true })
        } else {
            NavigationService.reset('Dashboard')
        }
        // navigation.goBack()
    }

    const openPicker = async () => {
        const options = [
            { text: 'Take new picture' },
            { text: 'Select from photos' }
        ]

        await SheetManager.show('action-sheets', {
            payload: {
                actions: options,
                onPress(index) {
                    if (index === 0) {
                        ImagePicker.openCamera({
                            width: 800,
                            height: 1024,
                            cropping: true,
                        }).then(image => {
                            setImage({ uri: image.path })
                            setImageUrl(null)
                            console.log(image);
                        });
                    }
                    if (index === 1) {
                        ImagePicker.openPicker({
                            width: 800,
                            height: 1024,
                            cropping: true
                        }).then(image => {
                            setImage({ uri: image.path })
                            setImageUrl(null)
                            console.log(image);
                        });
                    }
                },
            },
        });
    }
    const onSetBlur = (value) => {
        if (value) {
            if (canBlur) {
                setBlur(true)
            } else {
                navigation.push('BlurVideoScreen')
            }

        } else {
            setBlur(false)
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 8 }]}>
            <StatusBar translucent style='dark' />
            {/* {
                !onboarding &&
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 16, top: insets.top + 16, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.back_icon_no_border} style={{ width: 25, height: 25 }} contentFit='contain' />
                </TouchableOpacity>
            } */}
            <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                <Image source={images.logo_icon} style={{ width: 40, height: 40, marginBottom: 8 }} contentFit='contain' />
                <Text style={{ fontSize: 24, lineHeight: 40, maxWidth: '80%', fontWeight: 'bold', color: 'black' }}>{`Let’s complete your profile!`}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: 'black' }}>{`Add your profile photos`}</Text>

                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                    {!image &&
                        <TouchableOpacity onPress={openPicker} style={styles.imageContainer}>
                            <Image style={{ width: 35, height: 35 }} source={images.plus_icon} contentFit='contain' />
                        </TouchableOpacity>
                    }
                    {image &&
                        <View style={styles.imageContainer}>
                            <Image style={{ width: Platform.isPad ? 600 : Dimensions.get('screen').width - 48, height: Platform.isPad ? 600 : Dimensions.get('screen').width - 48, borderRadius: 20 }} source={image} contentFit='cover' />
                            {
                                isBlur &&
                                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20, overflow: 'hidden' }}>
                                    <BlurView intensity={20} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 }} />
                                </View>
                            }
                            <TouchableOpacity onPress={() => {
                                setImage(null)
                                setImageUrl(null)
                            }} style={styles.closeButton}>
                                <Image source={images.close_icon} style={{ width: 15, height: 15 }} />
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: '500', color: 'black' }}>{'Face blur:'}</Text>
                    <CustomSwitch value={isBlur} onValueChange={onSetBlur} />
                </View>
            </View>
            <TouchableOpacity onPress={imageUrl ? onContinue : onUpload} disabled={image === null} style={{ width: Platform.isPad ? 600 : '100%', alignSelf: 'center', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: image === null ? '#9A9A9A' : '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{imageUrl ? 'Continue' : 'Upload'}</Text>
            </TouchableOpacity>
            <View style={{ width: '100%', alignItems: 'center' }}>
                <Text style={{ padding: 8, fontSize: 14, fontWeight: 'bold' }} onPress={onSkip}>Skip for now</Text>
            </View>
            {
                loading && <LoadingView />
            }
        </View>
    )
}

export default AvatarUpdateScreen