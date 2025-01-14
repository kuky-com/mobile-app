import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
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
import analytics from '@react-native-firebase/analytics'

const imageImage = `avatar${dayjs().unix()}.png`

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#725ED4',
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
        borderColor: 'white',
        borderWidth: 2
    },
    closeButton: {
        width: 30, height: 30, backgroundColor: '#333333',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 15,
        position: 'absolute', top: 8, right: 8,
        borderWidth: 1, borderColor: 'white'
    }
})

const AvatarProfileScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const [currentUser, setUser] = useAtom(userAtom)
    const [image, setImage] = useState(currentUser?.avatar)
    const reference = storage().ref(imageImage)
    const [imageUrl, setImageUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    
    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'AvatarProfileScreen',
            screen_class: 'AvatarProfileScreen'
        })
    }, [])

    useEffect(() => {
        if (imageUrl !== null) {
            onContinue()
        }
    }, [imageUrl])

    const onUpload = async () => {
        try {
            if (image && image.uri) {
                setLoading(true)
                const uploadedFile = await reference.putFile(image.uri);

                const url = await storage().ref(imageImage).getDownloadURL()
                console.log({ url })
                setLoading(false)
                setImageUrl(url)
            }
        } catch (error) {
            setLoading(false)
        }
    };

    const onContinue = () => {
        try {
            setLoading(true)
            apiClient.post('users/update', { avatar: imageUrl })
                .then((res) => {
                    setLoading(false)
                    if (res && res.data && res.data.success) {
                        setUser(res.data.data)
                        navigation.goBack()
                        // Toast.show({ text1: res.data.message, type: 'success' })
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
                            console.log(image);
                        });
                    }
                },
            },
        });
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.back_icon} style={{ width: 30, height: 30 }} contentFit='contain' />
                </TouchableOpacity>
            <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>{`Update your \nprofile photos`}</Text>
                <Text style={{ fontSize: 16, fontWeight: '500', color: 'white' }}>{`This is your main photo public to everyone`}</Text>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                    {!image &&
                        <TouchableOpacity onPress={openPicker} style={styles.imageContainer}>
                            <Image style={{ width: 35, height: 35 }} source={images.plus_icon} contentFit='contain' />
                        </TouchableOpacity>
                    }
                    {image &&
                        <View style={styles.imageContainer}>
                            <Image style={{ width: Platform.isPad ? 600 : Dimensions.get('screen').width - 32, height: Platform.isPad ? 600 : Dimensions.get('screen').width - 32, borderRadius: 20 }} source={image} contentFit='cover' />
                            <TouchableOpacity onPress={() => setImage(null)} style={styles.closeButton}>
                                <Image source={images.close_icon} style={{ width: 15, height: 15 }} />
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            </View>
            <TouchableOpacity onPress={imageUrl ? onContinue : onUpload} disabled={image === null} style={{ width: Platform.isPad ? 600 : '100%', alignSelf: 'center', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: image === null ? '#9A9A9A' : '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{'Update'}</Text>
            </TouchableOpacity>

            {
                loading && <LoadingView />
            }
        </View>
    )
}

export default AvatarProfileScreen