import React, { useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import analytics from '@react-native-firebase/analytics'
import { Image } from 'expo-image'
import Text from '@/components/Text'
import ButtonWithLoading from '../../components/ButtonWithLoading'
import NavigationService from '@/utils/NavigationService'
import images from '../../utils/images'
import { FontAwesome6 } from '@expo/vector-icons'
import { useAtomValue } from 'jotai'
import { userAtom } from '../../actions/global'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16, backgroundColor: '#725ED4',
        paddingHorizontal: 24
    }
})

const SkipOnboardingScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const currentUser = useAtomValue(userAtom)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'SkipOnboardingScreen',
            screen_class: 'SkipOnboardingScreen'
        })
    }, [])

    const onContinue = () => {
        navigation.goBack()
    }

    let stepLeft = 0
    if (!currentUser?.birthday) stepLeft += 1
    if (!currentUser?.gender) stepLeft += 1
    if (!currentUser?.location) stepLeft += 1
    if ((currentUser?.likeCount ?? 0) === 0 || (currentUser?.purposeCount ?? 0) === 0) stepLeft += 1
    if (!currentUser?.avatar) stepLeft += 1

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
            <View style={{ gap: 16, alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}>
                <Image source={images.suggestion_cloud} style={{ width: 95, height: 82 }} contentFit='contain' />
                <Text style={{ fontSize: 24, lineHeight: 40, fontWeight: '600', color: '#F1F1F3' }}>{`Just ${stepLeft} Step${stepLeft === 1 ? '' : 's'} Left`}</Text>
                <Text style={{ fontSize: 14, lineHeight: 21, textAlign: 'center', fontWeight: '600', color: '#F1F1F3', width: '100%' }}>{`You're so close to making your profile 100% ready to connect with others on a similar journey.`}</Text>
                <View style={{ backgroundColor: '#5F4BC2', borderRadius: 15, paddingVertical: 20, paddingHorizontal: 26, width: '100%', gap: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <FontAwesome6 iconStyle='solid' name={currentUser?.birthday ? 'check-circle' : 'circle'} size={20} color={currentUser?.birthday ? '#68C668' : '#C2C2C2'} />
                        <Text style={{ fontSize: 18, lineHeight: 30, fontWeight: 'bold', color: 'white' }}>Birthday</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <FontAwesome6 iconStyle='solid' name={!((currentUser?.likeCount ?? 0) === 0 || (currentUser?.purposeCount ?? 0) === 0) ? 'check-circle' : 'circle'} size={20} color={!((currentUser?.likeCount ?? 0) === 0 || (currentUser?.purposeCount ?? 0) === 0) ? '#68C668' : '#C2C2C2'} />
                        <Text style={{ fontSize: 18, lineHeight: 30, fontWeight: 'bold', color: 'white' }}>Goals & Interests</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <FontAwesome6 iconStyle='solid' name={currentUser?.gender ? 'check-circle' : 'circle'} size={20} color={currentUser?.gender ? '#68C668' : '#C2C2C2'} />
                        <Text style={{ fontSize: 18, lineHeight: 30, fontWeight: 'bold', color: 'white' }}>Gender</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <FontAwesome6 iconStyle='solid' name={currentUser?.location ? 'check-circle' : 'circle'} size={20} color={currentUser?.location ? '#68C668' : '#C2C2C2'} />
                        <Text style={{ fontSize: 18, lineHeight: 30, fontWeight: 'bold', color: 'white' }}>Location</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <FontAwesome6 iconStyle='solid' name={currentUser?.avatar ? 'check-circle' : 'circle'} size={20} color={currentUser?.avatar ? '#68C668' : '#C2C2C2'} />
                        <Text style={{ fontSize: 18, lineHeight: 30, fontWeight: 'bold', color: 'white' }}>Avatar</Text>
                    </View>
                </View>
                <Text style={{ fontSize: 13, lineHeight: 21, fontWeight: '600', color: '#F1F1F3', width: '100%' }}>{`Did you know? \n\nProfiles with complete details are 3x more likely to make meaningful connections!`}</Text>
            </View>

            <TouchableOpacity style={{
                position: 'absolute', top: insets.top + 5, right: 16,
                width: 25, height: 25, alignItems: 'center', justifyContent: 'center'
            }}
                onPress={onContinue}>
                <FontAwesome6 name='xmark' size={20} color='#ffffff' />
            </TouchableOpacity>
            <ButtonWithLoading
                text={'Complete My Profile'}
                onPress={onContinue}
            />
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', padding: 8 }}
                    onPress={() => NavigationService.reset('Dashboard')}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#F1F1F3' }}>Skip for Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default SkipOnboardingScreen