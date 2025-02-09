import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, Keyboard, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import Toast from 'react-native-toast-message'
import axios from 'axios'
import { useAtomValue, useSetAtom } from 'jotai'
import { tokenAtom } from '@/actions/global'
import apiClient from '@/utils/apiClient'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import { getAuthenScreen } from '@/utils/utils'
import TextInput from '@/components/TextInput'
import analytics from '@react-native-firebase/analytics'
import { FontAwesome6 } from '@expo/vector-icons'
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
    inputContainer: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1, height: 55, borderRadius: 20,
        borderWidth: 1, borderColor: '#726E70'
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

    const setUser = useSetAtom(userAtom)

    const [loading, setLoading] = useState('')

    const monthInputRef = useRef(null);
    const yearInputRef = useRef(null);

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'BirthdayUpdateScreen',
            screen_class: 'BirthdayUpdateScreen'
        })
    }, [])

    const handleMonthChange = (text) => {
        if (/^\d{0,2}$/.test(text)) {
            setMonth(text);
            if (text.length === 2) {
                const monthNumber = parseInt(text, 10);
                if (monthNumber >= 1 && monthNumber <= 12) {
                    yearInputRef.current.focus()
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
                    monthInputRef.current.focus()
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

    useEffect(() => {
        if (month.length == 2 && day.length === 2 && year.length === 4) {
            setTimeout(() => {
                Keyboard.dismiss()
                onContinue()
            }, 300);
        }
    }, [month, day, year])

    const onContinue = () => {
        try {
            Keyboard.dismiss()

            const date = dayjs(`${month}-${day}-${year}`, 'DD/MM/YYYY')
            if (date.isValid()) {
                setLoading(true)

                apiClient.post('users/update', { birthday: `${day}/${month}/${year}` })
                    .then((res) => {
                        setLoading(false)
                        if (res && res.data && res.data.success) {
                            setUser(res.data.data)
                            NavigationService.reset('AskUpdateInfoScreen', { fromView: 'birthday' })
                        } else {
                            Toast.show({ text1: res.data.message, type: 'error' })
                        }
                    })
                    .catch((error) => {
                        console.log({ error })
                        Toast.show({ text1: error, type: 'error' })
                        setLoading(false)
                    })
            } else {
                Toast.show({ text1: 'This is not a valid birthday', type: 'error' })
            }
        } catch (error) {

        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 8 }]}>
            <StatusBar translucent style='dark' />
            <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }}>
                <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                    <Image source={images.logo_icon} style={{ width: 40, height: 40, marginBottom: 8 }} contentFit='contain' />
                    <Text style={{ fontSize: 24, lineHeight: 40, maxWidth: '80%', fontWeight: 'bold', color: 'black' }}>{`Let’s complete your profile!`}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: 'black' }}>{`What’s your birthday?`}</Text>
                    <View style={{ flex: 1, paddingVertical: 10, width: '100%', flexDirection: 'row', gap: 10, alignItems: 'flex-start', justifyContent: 'center' }}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="DD"
                                value={day}
                                onChangeText={handleDayChange}
                                keyboardType="numeric"
                                maxLength={2}
                                autoFocus={true}
                                underlineColorAndroid='#00000000'
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                ref={monthInputRef}
                                style={styles.input}
                                placeholder="MM"
                                value={month}
                                onChangeText={handleMonthChange}
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
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#7A7A7A' }}>{`Your age will be shown to other users.`}</Text>
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
                text='Continue'
                disabled={(month === '' || day === '' || year === '')}
                onPress={onContinue}
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

export default BirthdayUpdateScreen