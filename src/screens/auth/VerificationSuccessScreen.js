import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image, ImageBackground } from 'expo-image'
import React, { useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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

    const onContinue = () => {
        NavigationService.reset('RegisterSuccessScreen')
    }

    return (
        <View style={styles.container}>
            <Image
                source={images.verification_success_bg}
                style={StyleSheet.absoluteFill}
                contentFit='cover' />
            <View
                source={images.verification_success_bg}
                style={{
                    width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
                    paddingTop: insets.top + 40,
                    paddingBottom: insets.bottom + 32,
                    paddingHorizontal: 24,
                    backgroundColor: '#00000077'
                }}
            >
                <Image source={images.logo_with_text} style={{ width: 100, height: 35, tintColor: 'white' }} contentFit='contain' />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26 }}>
                    <Image source={images.success_icon} style={{ width: 66, height: 66, tintColor: 'white' }} contentFit='contain' />
                    <Text style={{ fontSize: 32, color: 'white', fontWeight: 'bold', textAlign: 'center', lineHeight: 50 }}>{'Your email has been successfully verified.'}</Text>
                </View>
                <TouchableOpacity onPress={onContinue} style={{ width: '100%', backgroundColor: 'white', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333333' }}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default VerificationSuccessScreen