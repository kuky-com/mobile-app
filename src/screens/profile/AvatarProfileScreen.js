import Text from '@/components/Text'
import images from '@/utils/images'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { DeviceEventEmitter, Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import storage from '@react-native-firebase/storage'
import LoadingView from '@/components/LoadingView'
import apiClient from '@/utils/apiClient'
import Toast from 'react-native-toast-message'
import { useAtom } from 'jotai'
import { userAtom } from '@/actions/global'
import analytics from '@react-native-firebase/analytics'
import constants from '../../utils/constants'
import Purchases from 'react-native-purchases'
import { BlurView } from 'expo-blur'
import CustomSwitch from '../../components/CustomSwitch'
import RNImageManipulator from 'react-native-image-manipulator'
import ExifReader from 'react-native-exif'

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
        borderWidth: 2,
        overflow: 'hidden'
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
    const [image, setImage] = useState(null)
    const reference = storage().ref(imageImage)
    const [imageUrl, setImageUrl] = useState(currentUser?.avatar)
    const [loading, setLoading] = useState(false)
    const [isBlur, setBlur] = useState(false)
    const [canBlur, setCanBlur] = useState(false)
    const [avatarLoaded, setAvatarLoaded] = useState(false)

    const loadSubscriptionInfo = async () => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();

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
        }
    };
    
    useEffect(() => {
        apiClient.get('users/avatar')
        .then((res) => {
            if(res && res.data) {
                setImageUrl(res.data.data)
            }

            setTimeout(() => {
                setAvatarLoaded(true)
            }, 200);
        })
        .catch((error) => {
            setTimeout(() => {
                setAvatarLoaded(true)
            }, 200);
        })
    }, [])

    useEffect(() => {
        loadSubscriptionInfo()

        const listener = DeviceEventEmitter.addListener(constants.REFRESH_PROFILE, loadSubscriptionInfo)

        return () => {
            listener.remove()
        }
    }, [])

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'AvatarProfileScreen',
            screen_class: 'AvatarProfileScreen'
        })
    }, [])

    useEffect(() => {
        if (imageUrl !== null && imageUrl !== currentUser?.avatar && avatarLoaded) {
            onContinue()
        }
    }, [imageUrl])

    const onUpload = async () => {
        try {
            if (image && image.uri) {
                setLoading(true)

                const uploadedFile = await reference.putFile(image.uri);

                const url = await storage().ref(imageImage).getDownloadURL();
                setLoading(false);
                setImageUrl(url);
                setImage(null)
            } else {
                onContinue()
            }
        } catch (error) {
            setLoading(false);
        }
    };

    const onContinue = async () => {
        try {
            setLoading(true)
            apiClient.post('users/update', { avatar: imageUrl, is_avatar_blur: isBlur })
                .then((res) => {
                    setLoading(false)
                    if (res && res.data && res.data.success) {
                        setUser(res.data.data)
                        navigation.goBack()
                    } else {
                        Toast.show({ text1: res.data.message, type: 'error' })
                    }
                })
                .catch((error) => {
                    setLoading(false)
                    Toast.show({ text1: error, type: 'error' })
                })

        } catch (error) {
            setLoading(false)
        }
    }
const correctImageOrientation = async (imagePath, imageData = null) => {
    try {
        let originalExifData = null;
        if (imageData?.sourceURL) {
            try {
                const originalPath = imageData.sourceURL.replace('file://', '');
                originalExifData = await ExifReader.getExif(originalPath);
            } catch (originalExifError) {
            }
        }
        
        let exifData = null;
        try {
            exifData = await ExifReader.getExif(imagePath);
        } catch (exifError) {
        }
        
        let orientation = 1;
        
        if (originalExifData?.exif?.Orientation) {
            orientation = originalExifData.exif.Orientation;
        }
        else if (originalExifData?.exif?.['{TIFF}']?.Orientation) {
            orientation = originalExifData.exif['{TIFF}'].Orientation;
        }
        else if (originalExifData?.Orientation) {
            orientation = originalExifData.Orientation;
        }
        else if (exifData?.exif?.Orientation) {
            orientation = exifData.exif.Orientation;
        }
        else if (exifData?.exif?.['{TIFF}']?.Orientation) {
            orientation = exifData.exif['{TIFF}'].Orientation;
        }
        else if (exifData?.Orientation) {
            orientation = exifData.Orientation;
        }
        else if (imageData?.exif?.Orientation) {
            orientation = imageData.exif.Orientation;
        }
        else if (imageData?.exif?.['{TIFF}']?.Orientation) {
            orientation = imageData.exif['{TIFF}'].Orientation;
        }
        
        const manipulationActions = [];
        
        switch (orientation) {
            
            case 3:
                manipulationActions.push({ rotate: 180 });
                break;
            case 6:
                manipulationActions.push({ rotate: 270 });
                break;
            case 8:
                manipulationActions.push({ rotate: 90 });
                break;
            case 2:
                manipulationActions.push({ flip: 'horizontal' });
                break;
            case 4:
                manipulationActions.push({ flip: 'vertical' });
                break;
            case 7:
                manipulationActions.push({ flip: 'horizontal' });
                manipulationActions.push({ rotate: 90 });
                break;
            default:
                setImage({ uri: imagePath });
                return imagePath;
        }
        
        if (manipulationActions.length > 0) {
            try {
                const manipulatedImage = await RNImageManipulator.manipulate(
                    imagePath,
                    manipulationActions,
                    { format: 'jpeg' }
                );
                
                setImage({ uri: manipulatedImage.uri });
                return manipulatedImage.uri;
            } catch (manipulationError) {
                setImage({ uri: imagePath });
                return imagePath;
            }
        } else {
            setImage({ uri: imagePath });
            return imagePath;
        }
        
    } catch (error) {
        setImage({ uri: imagePath });
        return imagePath;
    }
};

    const openPicker = async () => {
        const options = [
            { text: 'Take new picture' },
            { text: 'Select from photos' }
        ]

        await SheetManager.show('action-sheets', {
            payload: {
                actions: options,
                async onPress(index) {
                    if (index === 0) {
                        try {
                            const image = await ImagePicker.openCamera({
                                width: 800,
                                height: 1024,
                                cropping: true,
                                includeExif: true,
                                freeStyleCropEnabled: true,
                                showCropGuidelines: true,
                                showCropFrame: true,
                            });
                            
                            await correctImageOrientation(image.path, image);
                            setImageUrl(null);
                        } catch (error) {
                        }
                    }
                    if (index === 1) {
                        try {
                            const image = await ImagePicker.openPicker({
                                width: 800,
                                height: 1024,
                                cropping: true,
                                includeExif: true,
                                freeStyleCropEnabled: true,
                                showCropGuidelines: true,
                                showCropFrame: true,
                            });
                            
                            await correctImageOrientation(image.path, image);
                            setImageUrl(null);
                        } catch (error) {
                        }
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
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={images.back_icon} style={{ width: 30, height: 30 }} contentFit='contain' />
            </TouchableOpacity>
            <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>{`Update your \nprofile photos`}</Text>
                <Text style={{ fontSize: 16, fontWeight: '500', color: 'white' }}>{`This is your main photo public to everyone`}</Text>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                    {!image && !imageUrl &&
                        <TouchableOpacity onPress={openPicker} style={styles.imageContainer}>
                            <Image style={{ width: 35, height: 35 }} source={images.plus_icon} contentFit='contain' />
                        </TouchableOpacity>
                    }
                    {(image || imageUrl) &&
                        <View style={styles.imageContainer}>
                            <Image 
                                style={{ 
                                    width: Platform.isPad ? 600 : Dimensions.get('screen').width - 48, 
                                    height: Platform.isPad ? 600 : Dimensions.get('screen').width - 48, 
                                    borderRadius: 20
                                }} 
                                source={image ? { uri: image.uri || image } : {uri: imageUrl}} 
                                contentFit='cover' 
                            />
                            {
                                isBlur &&
                                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20, overflow: 'hidden' }}>
                                    <BlurView intensity={25} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 }} />
                                </View>
                            }
                            <TouchableOpacity onPress={() => {
                                setImage(null)
                                setImageUrl(null)
                                setBlur(false)
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
            <TouchableOpacity onPress={onUpload} style={{ width: Platform.isPad ? 600 : '100%', alignSelf: 'center', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{'Update'}</Text>
            </TouchableOpacity>

            {
                loading && <LoadingView />
            }
        </View>
    )
}

export default AvatarProfileScreen