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

    const openSignIn = () => {
        NavigationService.reset('SignInScreen')
    }

    const openSignUp = () => {
        NavigationService.reset('SignUpScreen')
    }

    return (
        <View style={styles.container}>
            <Image contentFit='contain' source={images.logo_text} style={{ height: 80, width: 150 }} />
            {/* <Text style={{ fontSize: 24, fontWeight: '700' }}>Better Together</Text> */}
            <View style={{ paddingVertical: 24, flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <Image contentFit='contain' source={images.get_start_bg} style={{ width: 300, height: 300, position: 'absolute' }} />
                {
                    Platform.OS === 'ios' &&
                    <Text style={{ fontSize: 26, color: '#666666', fontWeight: 'bold', lineHeight: 50 }}>
                        {`Connections through `}
                        <View style={{ backgroundColor: '#CDB8E2', paddingHorizontal: 8, borderRadius: 25 }}>
                            <Text style={{ fontSize: 26, color: 'black', fontWeight: 'bold', lineHeight: 50 }}>shared experiences!</Text>
                        </View>
                        {`\n\nOur AI agent will guide you through the process and help you `}
                        <View style={{ backgroundColor: '#CDB8E2', paddingHorizontal: 8, borderRadius: 25 }}>
                            <Text style={{ fontSize: 26, color: 'black', fontWeight: 'bold', lineHeight: 50 }}>save time.</Text>
                        </View>
                    </Text>
                }
                {
                    Platform.OS !== 'ios' &&
                    <Text style={{ fontSize: 26, color: '#666666', fontWeight: 'bold', lineHeight: 50 }}>
                        {`Connections through `}
                        <Text style={{ fontSize: 27, color: 'black', fontWeight: 'bold', lineHeight: 50 }}>shared experiences!</Text>
                        {`\n\nOur AI agent will guide you through the process and help you `}
                        <Text style={{ fontSize: 27, color: 'black', fontWeight: 'bold', lineHeight: 50 }}>save time.</Text>
                    </Text>
                }
            </View>
            <TouchableOpacity onPress={openSignUp} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Get started</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openSignIn} style={{ padding: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#333333' }}>Sign in</Text>
            </TouchableOpacity>
        </View>
    )
}

export default GetStartScreen