import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image, ImageBackground } from 'expo-image'
import React, { useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import analytics from '@react-native-firebase/analytics'
import { OneSignal } from 'react-native-onesignal'
import colors from '../../utils/colors'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16
    }
})

const VerificationSuccessScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'VerificationSuccessScreen',
            screen_class: 'VerificationSuccessScreen'
        })
    }, [])

    const onContinue = () => {
        OneSignal.Notifications.requestPermission(true);
        // NavigationService.reset('RegisterSuccessScreen')
        // NavigationService.reset('OnboardingVideoTutorialScreen')

        NavigationService.reset('ReferralUpdateScreen')
    }

    return (
        <View style={styles.container}>
            <Image
                source={images.verify_success_bg}
                style={[StyleSheet.absoluteFill, { backgroundColor: colors.mainColor }]}
                contentFit='cover' />
            <View
                style={{
                    width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: insets.top + 40,
                    paddingBottom: insets.bottom + 32,
                    paddingHorizontal: 24,
                }}
            >
                <Image source={images.logo_with_text} style={{ width: 100, height: 35, tintColor: 'white' }} contentFit='contain' />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                    <Image source={images.verify_success_icon} style={{ width: 120, height: 120 }} contentFit='contain' />
                    <Text style={{ fontSize: 18, color: '#F1F1F3', fontWeight: '500' }}>Verified</Text>
                </View>

                <View style={{width: '100%', alignItems: 'center', justifyContent: 'center', gap: 40}}>
                    <Text style={{ fontSize: 18, color: 'white', fontWeight: '400', textAlign: 'center', lineHeight: 22 }}>{'Your email has been successfully verified.'}</Text>
                    <TouchableOpacity onPress={onContinue} style={{ width: '100%', backgroundColor: '#333333', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default VerificationSuccessScreen