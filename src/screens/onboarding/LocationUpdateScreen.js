import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import Toast from 'react-native-toast-message'
import axios from 'axios'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import apiClient from '@/utils/apiClient'

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

    const onContinue = () => {
        apiClient.post('users/update', { location })
            .then((res) => {
                console.log({ res })
                if (res && res.data && res.data.success) {
                    NavigationService.reset('AvatarUpdateScreen')
                    Toast.show({ text1: res.data.message, type: 'success' })
                } else {
                    Toast.show({ text1: res.data.message, type: 'error' })
                }
            })
            .catch((error) => {
                console.log({ error })
                Toast.show({ text1: error, type: 'error' })
            })
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
            <View style={{ flex: 1, gap: 16, width: '100%' }}>
                <Image source={images.logo_with_text} style={{ width: 120, height: 40, marginBottom: 32 }} contentFit='contain' />
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>{`Where do you live?`}</Text>
                <View style={{ flex: 1, paddingVertical: 16, gap: 10, width: '100%', alignItems: 'center', justifyContent: 'flex-start' }}>
                    {/* <GooglePlacesAutocomplete
                        placeholder="Enter city name"
                        minLength={2}
                        autoFocus={true}
                        fetchDetails={true}
                        onFail={error => console.log({error})}
                        onPress={(data, details = null) => {
                            console.log('City details:', details);
                            console.log('City name:', data.description);
                        }}
                        query={{
                            key: 'AIzaSyDVWzk8veVsUF9Lz_1eDj7-aGiyPyQG2yE',
                            language: 'en',
                            types: '(cities)',
                        }}
                        styles={{
                            textInput: styles.textInput,
                            textInputContainer: styles.itemContainer
                        }}
                    /> */}
                    <View style={styles.itemContainer}>
                        <TextInput 
                            style={styles.textInput}
                            underlineColorAndroid={'#00000000'}
                            value={location}
                            onChangeText={setLocation}
                            placeholder='Enter your city name'
                            autoFocus
                        />
                    </View>
                </View>
            </View>
            <TouchableOpacity onPress={onContinue} disabled={(location.length <= 3)} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: (location.length <= 3) ? '#9A9A9A' : '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Continue</Text>
            </TouchableOpacity>
        </View>
    )
}

export default LocationUpdateScreen