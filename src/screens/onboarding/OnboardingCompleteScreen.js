import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image, ImageBackground } from 'expo-image'
import React, { useEffect } from 'react'
import { Dimensions, StyleSheet, TextBase, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: '#725ED4',
        padding: 16,
        gap: 14
    }
})

const OnboardingCompleteScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()

    const onContinue = () => {
        NavigationService.reset('Dashboard')
    }

    return (
        <View style={styles.container}>
            <Text style={{fontSize: 24, fontWeight: 'bold', color: 'white'}}>Congratulations!</Text>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center'}}> Your profile is all set up.</Text>
            <ImageBackground contentFit='contain' source={images.wave_bg} style={{width: Dimensions.get('screen').width - 32, height: Dimensions.get('screen').width - 32, alignItems: 'center', justifyContent: 'center'}}>
                <Image style={{width: 70, height: 70, }} contentFit='contain' source={images.success_icon}/>
            </ImageBackground>
            <Text style={{fontSize: 20, lineHeight: 25, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>{`Thanks for joining Kuky!\nYour account is under review and will be approved soon. In the meantime, feel free to explore and discover other users!`}</Text>
            <TouchableOpacity onPress={onContinue} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Start Exploring</Text>
            </TouchableOpacity>
        </View>
    )
}

export default OnboardingCompleteScreen