import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect } from 'react'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 16,
        paddingBottom: 64,
        paddingTop: 64
    }
})

const GetStartScreen = ({ navigation }) => {

    const getStart = () => {
        NavigationService.reset('SignUpScreen')
    }

    return (
        <View style={styles.container}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                <View style={{ paddingVertical: 24, flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <Image contentFit='contain' source={images.get_start_bg} style={{ width: 300, height: 300, position: 'absolute' }} />
                        <Text style={{ fontSize: 20, color: '#4C4C4C', fontWeight: 'bold', lineHeight: 30, textAlign: 'center'}}>
                            {`Kuky \nis here to bring you together through support and shared journeys.`}
                        </Text>
                </View>
                <TouchableOpacity onPress={getStart} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Let’s Get Started!</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default GetStartScreen