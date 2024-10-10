import { userAtom } from '@/actions/global'
import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image, ImageBackground } from 'expo-image'
import { useAtomValue } from 'jotai'
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
        gap: 16
    }
})

const GetMatchScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const { match } = route.params
    const currentUser = useAtomValue(userAtom)

    const onContinue = () => {
        if(currentUser.id === match.sender_id) {
            NavigationService.replace('MessageScreen', { conversation: {...match, profile: match.receiver} })
        } else {
            NavigationService.replace('MessageScreen', { conversation: {...match, profile: match.sender} })
        }   
    }

    const onSkip = () => {
        navigation.goBack()
    }

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#E8FF58' }}>You've Connected!</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>You’ve found someone to share your journey with.</Text>
            <ImageBackground source={images.wave_bg} style={{ width: Dimensions.get('screen').width - 32, height: Dimensions.get('screen').width - 32, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{paddingRight: 80}}>
                    <Image style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#E8FF58' }} contentFit='cover' source={{uri: match?.receiver?.avatar}} />
                </View>
                <View style={{marginTop: -60, paddingLeft: 100}}>
                    <Image style={{ width: 150, height: 150, borderRadius: 75, borderWidth: 2, borderColor: '#E8FF58' }} contentFit='cover' source={{uri: match?.sender?.avatar}} />
                </View>
            </ImageBackground>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>Your experiences can make a difference</Text>
            <TouchableOpacity onPress={onContinue} style={{ flexDirection: 'row', gap: 8, width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333', }}>
                <Image source={images.conversation_icon} style={{ width: 18, height: 18, }} contentFit='contain' />
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Start a Conversation</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSkip} style={{ width: '100%', height: 30, alignItems: 'center', justifyContent: 'center', }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: 'white' }}>I'll write later</Text>
            </TouchableOpacity>
        </View>
    )
}

export default GetMatchScreen