import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, Keyboard, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import Toast from 'react-native-toast-message'
import axios from 'axios'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import apiClient from '@/utils/apiClient'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import { getAuthenScreen } from '@/utils/utils'
import TextInput from '@/components/TextInput'
import analytics from '@react-native-firebase/analytics'
import { FontAwesome6 } from '@expo/vector-icons'
import * as Location from 'expo-location';
import { useSetAtom } from 'jotai'
import { userAtom } from '../../actions/global'

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
        width: '100%',
        paddingHorizontal: 16
    },
    closeButton: {
        width: 30, height: 30, backgroundColor: '#333333',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 15,
        position: 'absolute', top: 8, right: 8
    },
    textInput: {
        fontWeight: 'bold',
        fontSize: 18,
        width: '100%',
        backgroundColor: '#00000000',
        color: '#333333'
    },
})

const LocationUpdateScreen = ({ navigation, route }) => {
    // const { onboarding } = route.params
    const insets = useSafeAreaInsets()
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false)
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [currentCoords, setCurrentCoords] = useState(null);

    const setUser = useSetAtom(userAtom)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'LocationUpdateScreen',
            screen_class: 'LocationUpdateScreen'
        })
    }, [])

    const getCurrentCity = async () => {
        try {
            setLoadingLocation(true)
            // Request permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({ text1: 'Location permission is required to get your city.', type: 'error' });
                setLoadingLocation(false)
                return;
            }

            // Get current location
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setCurrentCoords(currentLocation.coords)

            // Reverse geocode to get address
            const [address] = await Location.reverseGeocodeAsync({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            });

            setLoadingLocation(false)
            if (address && address.city) {
                setLocation(address.city + (address.country ? ', ' + address.country : ''));
            } else {
                Toast.show({ text1: 'Unable to retrieve city from your location.', type: 'error' });
            }
        } catch (error) {
            console.error('Error fetching location or city:', error);
            setLoadingLocation(false)
            Toast.show({ text1: 'Something went wrong while fetching location.', type: 'error' });
        }
    };

    const onContinue = () => {
        if (location.length > 0 && !loading) {
            try {
                Keyboard.dismiss()
                setLoading(true)
                apiClient.post('users/update', { location })
                    .then((res) => {
                        setLoading(false)
                        if (res && res.data && res.data.success) {
                            setUser(res.data.data)
                            // NavigationService.reset('AskUpdateInfoScreen', { fromView: 'gender' })
                            NavigationService.reset('MatchingInfoUpdateScreen')
                        } else {
                            Toast.show({ text1: res.data.message, type: 'error' })
                        }
                    })
                    .catch((error) => {
                        setLoading(false)
                        console.log({ error })
                        Toast.show({ text1: error, type: 'error' })
                    })
            } catch (error) {
                setLoading(false)
            }
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
            <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }}>
                <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                    <Image source={images.logo_icon} style={{ width: 40, height: 40, marginBottom: 8 }} contentFit='contain' />
                    <Text style={{ fontSize: 24, lineHeight: 40, maxWidth: '80%', fontWeight: 'bold', color: 'black' }}>{`Let’s complete your profile!`}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: 'black' }}>{`Where do you live?`}</Text>
                    <View
                        style={{
                            width: "100%",
                            height: 45,
                            borderRadius: 15,
                            backgroundColor: "white",
                            alignItems: "center",
                            flexDirection: "row",
                            paddingHorizontal: 16,
                            borderWidth: 1, borderColor: '#726E70',
                            marginVertical: 12
                        }}
                    >
                        <TextInput
                            style={{
                                flex: 1,
                                fontFamily: "Comfortaa-Bold",
                                fontSize: 14,
                                color: "black",
                                fontWeight: "bold",
                                paddingVertical: 5,
                                paddingHorizontal: 8,
                            }}
                            underlineColorAndroid={"#00000000"}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Enter your city name"
                            placeholderTextColor="#777777"
                        />

                        <TouchableOpacity style={{ height: 30, width: 30, alignItems: 'center', justifyContent: 'center' }} onPress={getCurrentCity}>
                            {loadingLocation ? <ActivityIndicator size='small' color='black' /> : <FontAwesome6 name='location-arrow' size={20} color='black' />}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAwareScrollView>

            <TouchableOpacity style={{
                position: 'absolute', top: insets.top + 5, right: 16,
                width: 25, height: 25, alignItems: 'center', justifyContent: 'center'
            }}
                onPress={() => NavigationService.push('SkipOnboardingScreen')}>
                <FontAwesome6 name='xmark' size={20} color='#333333' />
            </TouchableOpacity>
            <ButtonWithLoading
                onPress={onContinue} disabled={(location.length === 0)}
                text='Continue'
                loading={loading}
            />
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', padding: 8 }}
                    onPress={() => NavigationService.reset('OnboardingVideoTutorialScreen')}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333333' }}>Record a video instead</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default LocationUpdateScreen