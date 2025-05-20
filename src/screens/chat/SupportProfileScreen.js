import React from 'react'
import { View } from 'react-native';
import Text from '../../components/Text';
import { Image } from 'expo-image';
import ButtonWithLoading from '../../components/ButtonWithLoading';
import colors from '../../utils/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import images from '../../utils/images';
import { useAtomValue } from 'jotai';
import { userAtom } from '../../actions/global';

const SupportProfileScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const currentUser = useAtomValue(userAtom)

    const startChat = () => {
        navigation.goBack()
    }

    return (
        <View style={{ flex: 1, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.mainColor, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 16 }}>
            <Text style={{ fontSize: 24, color: '#F0F0F0', lineHeight: 40, fontWeight: '600' }}>Hi there!</Text>
            <Text style={{ fontSize: 18, color: '#CDCDCD', lineHeight: 22, fontWeight: '500' }}>I’m Kuky Support 💬</Text>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 }}>
                <Image source={images.suggestion_cloud} style={{width: 90, height: 90}} contentFit='contain'/>
                <Text style={{ fontSize: 18, color: '#F0F0F0', lineHeight: 22 }}>{`Hi ${currentUser?.full_name}!`}</Text>
                <Text style={{ fontSize: 16, color: '#F0F0F0', lineHeight: 25, textAlign: 'center' }}>I’m here to help you with anything you need—whether it’s a question, issue, or feedback.
                Your experience matters, and I’ll do my best to make it smooth and easy.</Text>
                <Text style={{ fontSize: 16, color: '#F0F0F0', lineHeight: 25, textAlign: 'center' }}>Need assistance? Just message me. I’ve got your back! 😊</Text>
            </View>

            <ButtonWithLoading text='Start Chat' onPress={startChat} />
        </View>
    )
}

export default SupportProfileScreen;