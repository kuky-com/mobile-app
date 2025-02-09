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

const AskUpdateInfoScreen = ({ navigation, route }) => {
    const { fromView } = route && route.params ? route.params : {};
    const insets = useSafeAreaInsets()
    const currentUser = useAtomValue(userAtom)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'AskUpdateInfoScreen',
            screen_class: 'AskUpdateInfoScreen'
        })
    }, [])

    const onContinue = () => {
        NavigationService.push('SkipOnboardingScreen')
    }

    const openBirthday = () => {
        NavigationService.reset('ReferralUpdateScreen')
    }

    const openGender = () => {
        NavigationService.reset('GenderUpdateScreen')
    }

    const openLocation = () => {
        NavigationService.reset('LocationUpdateScreen')
    }

    const openInterest = () => {
        NavigationService.reset('MatchingInfoUpdateScreen')
    }

    const openAvatar = () => {
        NavigationService.reset('AvatarUpdateScreen')
    }

    let title = 'Your profile is waiting to be personalized!'
    let subtitle = `Let’s get to know you better!\n\nSharing a bit about yourself helps us connect you with people who truly understand your journey.`

    if (fromView) {
        if (fromView === 'birthday') {
            title = 'Your birthday has been saved!'
            subtitle = 'Let’s keep going to make your profile even better.'
        } else if (fromView === 'gender') {
            title = 'Your gender has been saved!'
            subtitle = 'Let’s keep going to make your profile even better.'
        } else if (fromView === 'location') {
            title = 'Your location has been saved!'
            subtitle = 'Let’s keep going to make your profile even better.'
        } else if (fromView === 'avatar') {
            title = 'Your avatar has been saved!'
            subtitle = 'Let’s keep going to make your profile even better.'
        }
    } else {
        if (currentUser?.birthday && !currentUser?.gender) {
            title = 'Make your profile even better!'
            subtitle = 'Adding your gender helps us create a more personalized and inclusive experience for you'
        } else if (currentUser?.birthday && currentUser?.gender && !currentUser?.location) {
            title = 'Make your profile even better!'
            subtitle = 'Adding your location helps us create a more personalized and inclusive experience for you'
        } else if (currentUser?.birthday && currentUser?.gender && currentUser?.location && !currentUser?.avatar) {
            title = 'Make your profile even better!'
            subtitle = 'Adding your avatar helps us create a more personalized and inclusive experience for you'
        } else {
            title = 'Make your profile even better!'
            subtitle = 'Adding more details like your journey and interests will help us personalize your experience.'
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
            <View style={{ gap: 16, alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}>
                {
                    !currentUser?.birthday && !currentUser?.gender && !currentUser?.location &&
                    <Image source={images.cry_cloud} style={{ width: 95, height: 82 }} contentFit='contain' />
                }
                {fromView && <Text style={{ fontSize: 14, lineHeight: 21, textAlign: 'center', fontWeight: '500', color: '#F1F1F3', width: '100%' }}>{'Thank you for sharing!'}</Text>}
                <Text style={{ fontSize: 20, lineHeight: 30, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }}>{title}</Text>

                {
                    (currentUser?.birthday || currentUser?.gender || currentUser?.location) &&
                    <Image source={images.happy_cloud} style={{ width: 95, height: 82 }} contentFit='contain' />
                }
                <Text style={{ fontSize: 14, lineHeight: 21, textAlign: 'center', fontWeight: '500', color: '#F1F1F3', width: '100%' }}>{subtitle}</Text>
            </View>

            <TouchableOpacity style={{
                position: 'absolute', top: insets.top + 5, right: 16,
                width: 25, height: 25, alignItems: 'center', justifyContent: 'center'
            }}
                onPress={onContinue}>
                <FontAwesome6 name='xmark' size={20} color='#ffffff' />
            </TouchableOpacity>
            {
                !currentUser?.birthday && !currentUser?.gender && !currentUser?.location &&
                <ButtonWithLoading
                    text={'Add Manually'}
                    onPress={openBirthday}
                />
            }
            {
                currentUser?.birthday && !currentUser?.gender && !currentUser?.location &&
                <ButtonWithLoading
                    text={'Add My Gender'}
                    onPress={openGender}
                />
            }
            {
                currentUser?.birthday && currentUser?.gender && !currentUser?.location &&
                <ButtonWithLoading
                    text={'Add My Location'}
                    onPress={openLocation}
                />
            }
            {
                currentUser?.birthday && currentUser?.gender && currentUser?.location && !currentUser?.avatar &&
                <ButtonWithLoading
                    text={'Add My Avatar'}
                    onPress={openAvatar}
                />
            }
            {
                currentUser?.birthday && currentUser?.gender && currentUser?.location && currentUser?.avatar &&
                <ButtonWithLoading
                    text={'Add My Interests'}
                    onPress={openInterest}
                />
            }
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', padding: 8 }}
                    onPress={() => NavigationService.reset('OnboardingVideoTutorialScreen')}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#F1F1F3' }}>Record a video</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default AskUpdateInfoScreen