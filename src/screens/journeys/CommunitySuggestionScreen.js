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
import { useAtomValue } from 'jotai'
import { userAtom } from '../../actions/global'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: colors.mainColor
    }
})

const CommunitySuggestionScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const currentUser = useAtomValue(userAtom)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'CommunitySuggestionScreen',
            screen_class: 'CommunitySuggestionScreen'
        })
    }, [])

    const onContinue = () => {
        // if(currentUser?.avatar) {
        //     NavigationService.reset('IntroductionVideoScreen')
        // } else {
        //     NavigationService.reset('AvatarUpdateScreen')
        // }

        NavigationService.reset('AvatarUpdateScreen')
    }

    const onReset = () => {
        NavigationService.reset('JourneySelectionScreen')
    }

    return (
        <View style={styles.container}>
            <View
                style={{
                    width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: insets.top + 40,
                    paddingBottom: insets.bottom + 8,
                    paddingHorizontal: 24,
                }}
            >
                <Image source={images.happy_cloud} style={{ width: 90, height: 90 }} contentFit='contain' />
                <View style={{ alignItems: 'center', justifyContent: 'center', gap: 16, borderWidth: 1, borderColor: '#CDB8E2',
                    borderRadius: 15, width: '100%', paddingVertical: 24, paddingHorizontal: 24
                 }}>
                    <Text style={{width: '100%', textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: 'white', lineHeight: 25}}>{`Join the`}</Text>
                    <Text style={{width: '100%', textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: 'white', lineHeight: 25}}>{`${currentUser?.journey?.name}`}</Text>

                    <Text style={{width: '100%', textAlign: 'center', fontSize: 14, fontWeight: '400', color: 'white', lineHeight: 24, marginTop: 16}}>{`${currentUser?.journey?.example}`}</Text>
                </View>

                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
                    <TouchableOpacity onPress={onContinue} style={{ width: '100%', backgroundColor: '#333333', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>Join this community</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onReset} style={{ width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontSize: 14, fontWeight: 'bold', color: 'white', }}>Explore more options</Text>
                    </TouchableOpacity>

                    <Text style={{fontSize: 12, fontWeight: 'bold', color: '#c2c2c2', width: '100%', textAlign: 'center', lineHeight: 20}}>{`Not sure yet?\nDon’t worry, you can switch communities later.`}</Text>
                </View>
            </View>
        </View>
    )
}

export default CommunitySuggestionScreen