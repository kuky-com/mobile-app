import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import { Dimensions, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native'
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
        paddingHorizontal: 22
    },
    closeButton: {
        width: 30, height: 30, backgroundColor: '#333333',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 15,
        position: 'absolute', top: 8, right: 8
    }
})

const GenderUpdateScreen = ({ navigation, route }) => {
    // const { onboarding } = route.params
    const insets = useSafeAreaInsets()
    const [gender, setGender] = useState(null);
    const [isPublic, setPublic] = useState(true);

    const onContinue = () => {
        apiClient.post('users/update', { publicGender: isPublic, gender })
            .then((res) => {
                console.log({ res })
                if (res && res.data && res.data.success) {
                    NavigationService.reset('PronounsUpdateScreen')
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
            <View style={{ flex: 1, gap: 16 }}>
                <Image source={images.logo_with_text} style={{ width: 120, height: 40, marginBottom: 32 }} contentFit='contain' />
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>{`What’s your \gender?`}</Text>
                <Text style={{ fontSize: 16, fontWeight: '500', color: 'black', lineHeight: 22 }}>{`Choose which best describes you.You can also add more about your gender if you would like.`}</Text>
                <View style={{ flex: 1, width: '100%', paddingVertical: 32, gap: 16, alignItems: 'center', justifyContent: 'flex-start' }}>
                    {
                        ['man', 'woman', 'nonbinary'].map((item) => (
                            <TouchableOpacity key={item} onPress={() => setGender(item)} style={styles.itemContainer}>
                                <Text style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: '#333333' }}>{capitalize(item)}</Text>
                                <Image source={gender === item ? images.checked_icon : images.uncheck_icon} style={{ width: 24, height: 24 }} contentFit='contain' />
                            </TouchableOpacity>
                        ))
                    }
                    <View style={{ width: '100%', alignItems: 'flex-start' }}>
                        <SwitchWithText enable={isPublic} setEnable={setPublic} />
                    </View>
                </View>
            </View>
            <TouchableOpacity onPress={onContinue} disabled={gender === null} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: (gender === null) ? '#9A9A9A' : '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Continue</Text>
            </TouchableOpacity>
        </View>
    )
}

export default GenderUpdateScreen