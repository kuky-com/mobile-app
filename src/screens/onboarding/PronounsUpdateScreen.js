import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Dimensions, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import Toast from 'react-native-toast-message'
import axios from 'axios'
import { capitalize, getAuthenScreen } from '@/utils/utils'
import DoubleSwitch from '@/components/DoubleSwitch'
import SwitchWithText from '@/components/SwitchWithText'
import apiClient from '@/utils/apiClient'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import { useAtom } from 'jotai'
import { userAtom } from '@/actions/global'
import analytics from '@react-native-firebase/analytics'

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
    }
})

const PronounsUpdateScreen = ({ navigation, route }) => {
    // const { onboarding } = route.params
    const insets = useSafeAreaInsets()
    const [pronouns, setPronouns] = useState(null);
    const [isPublic, setPublic] = useState(true);
    const [loading, setLoading] = useState(false)
    const [currentUser, setUser] = useAtom(userAtom)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'PronounsUpdateScreen',
            screen_class: 'PronounsUpdateScreen'
        })
    }, [])

    const onContinue = () => {
        try {
            setLoading(true)
            apiClient.post('users/update', { publicPronouns: isPublic, pronouns })
                .then((res) => {
                    console.log({ res })
                    setLoading(false)
                    if (res && res.data && res.data.success) {
                        // NavigationService.reset('LocationUpdateScreen')
                        setUser(res.data.data)
                        NavigationService.reset(getAuthenScreen(res.data.data, null))
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

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
            <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                <Image source={images.logo_with_text} style={{ width: 120, height: 40, marginBottom: 32 }} contentFit='contain' />
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>{`What pronouns do you use?`}</Text>
                <ScrollView style={{ flex: 1, width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View style={{ flex: 1, width: '100%', paddingHorizontal: 8, paddingVertical: 24, gap: 16, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                        {
                            ['He/ Him/ His', 'She/ Her/ Hers', 'They/ Them/ Theirs', 'Ve/ Ver/ vis', 'Ze/ Hirs', 'Not shown above'].map((item) => (
                                <TouchableOpacity key={item} onPress={() => setPronouns(item)} style={styles.itemContainer}>
                                    <Text style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: '#333333' }}>{capitalize(item)}</Text>
                                    <Image source={pronouns === item ? images.checked_icon : images.uncheck_icon} style={{ width: 24, height: 24 }} contentFit='contain' />
                                </TouchableOpacity>
                            ))
                        }
                        <SwitchWithText enable={isPublic} setEnable={setPublic} />
                    </View>
                </ScrollView>
            </View>
            <ButtonWithLoading
                text={'Continue'}
                onPress={onContinue}
                disabled={pronouns === null}
                loading={loading}
            />
        </View>
    )
}

export default PronounsUpdateScreen