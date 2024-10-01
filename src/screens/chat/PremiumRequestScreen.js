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

const PremiumRequestScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()

    useEffect(() => {
        NavigationService.reset('GenderUpdateScreen')
    }, [])

    return (
        <View style={styles.container}>
            <ImageBackground
                source={images.verification_success_bg}
                style={{
                    width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
                    paddingTop: insets.top + 40,
                    paddingBottom: insets.bottom + 32,
                    paddingHorizontal: 24
                }}
            >
                <Image source={images.logo_with_text} style={{ width: 80, height: 25 }} contentFit='contain' />
                <View style={{ flex: 1, alignItem: 'center', justifyContent: 'center', gap: 26 }}>
                    <Image source={{width: 66, height: 66, }} contentFit='contain' />
                    <Text stle={{fontSize: 32, color: 'white', fontWeight: 'bold'}}>{'Your phone number has been successfully verified.'}</Text>
                </View>
                <TouchableOpacity style={{width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold', color: '#333333'}}>Continue</Text>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    )
}

export default PremiumRequestScreen