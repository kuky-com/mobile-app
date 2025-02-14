import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useRef, useState } from 'react'
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import Toast from 'react-native-toast-message'
import axios from 'axios'
import { useAtomValue } from 'jotai'
import { tokenAtom } from '@/actions/global'
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
    inputContainer: {
        backgroundColor: '#ECECEC',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1, height: 55, borderRadius: 20,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
    },
    input: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333'
    },
    closeButton: {
        width: 30, height: 30, backgroundColor: '#333333',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 15,
        position: 'absolute', top: 8, right: 8
    }
})

const BirthdayUpdateScreen = ({ navigation, route }) => {
    // const { onboarding } = route.params
    const insets = useSafeAreaInsets()
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [year, setYear] = useState('');

    const dayInputRef = useRef(null);
    const yearInputRef = useRef(null);

    const handleMonthChange = (text) => {
        if (/^\d{0,2}$/.test(text)) {
            setMonth(text);
            if (text.length === 2) {
                const monthNumber = parseInt(text, 10);
                if (monthNumber >= 1 && monthNumber <= 12) {
                    dayInputRef.current.focus()
                } else {
                    setMonth('')
                }
            }
        }
    };

    const handleDayChange = (text) => {
        if (/^\d{0,2}$/.test(text)) {
            setDay(text);
            if (text.length === 2) {
                const dayNumber = parseInt(text, 10);
                if (dayNumber >= 1 && dayNumber <= 31) {
                    yearInputRef.current.focus()
                } else {
                    setDay('')
                }
            }
        }
    };

    const handleYearChange = (text) => {
        if (/^\d{0,4}$/.test(text)) {
            setYear(text);
        }
    }

    const onContinue = () => {
        const date = dayjs(`${month}-${day}-${year}`, 'MM-DD-YYYY')
        if (date.isValid) {
            apiClient.post('users/update', { birthday: `${month}-${day}-${year}`})
                .then((res) => {
                    console.log({ res })
                    if (res && res.data && res.data.success) {
                        NavigationService.reset('GenderUpdateScreen')
                        Toast.show({ text1: res.data.message, type: 'success' })
                    } else {
                        Toast.show({ text1: res.data.message, type: 'error' })
                    }
                })
                .catch((error) => {
                    console.log({ error })
                    Toast.show({ text1: error, type: 'error' })
                })
        } else {
            Toast.show({ text1: 'This is not a valid birthday', type: 'error' })
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
            <View style={{ flex: 1, gap: 16 }}>
                <Image source={images.logo_with_text} style={{ width: 120, height: 40, marginBottom: 32 }} contentFit='contain' />
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>{`What’s your \nbirthday?`}</Text>
                <Text style={{ fontSize: 16, fontWeight: '500', color: 'black' }}>{`Your age will be shown to other users.`}</Text>
                <View style={{ flex: 1, paddingVertical: 50, width: '100%', flexDirection: 'row', gap: 10, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="MM"
                            value={month}
                            onChangeText={handleMonthChange}
                            keyboardType="numeric"
                            maxLength={2}
                            autoFocus={true}
                            underlineColorAndroid='#00000000'
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            ref={dayInputRef}
                            style={styles.input}
                            placeholder="DD"
                            value={day}
                            onChangeText={handleDayChange}
                            keyboardType="numeric"
                            maxLength={2}
                            underlineColorAndroid='#00000000'
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            ref={yearInputRef}
                            style={styles.input}
                            placeholder="YYYY"
                            value={year}
                            onChangeText={handleYearChange}
                            keyboardType="numeric"
                            maxLength={4}
                            underlineColorAndroid='#00000000'
                        />
                    </View>
                </View>
            </View>
            <TouchableOpacity onPress={onContinue} disabled={(month === '' || day === '' || year === '')} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: (month === '' || day === '' || year === '') ? '#9A9A9A' : '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Continue</Text>
            </TouchableOpacity>
        </View>
    )
}

export default BirthdayUpdateScreen