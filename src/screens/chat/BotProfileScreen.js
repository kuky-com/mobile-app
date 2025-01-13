import React from 'react'
import { View } from 'react-native';
import Text from '../../components/Text';
import { Image } from 'expo-image';
import ButtonWithLoading from '../../components/ButtonWithLoading';
import colors from '../../utils/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import images from '../../utils/images';

const BotProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()

    const startChat = () => {
        navigation.goBack()
    }

    return (
        <View style={{ flex: 1, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.mainColor, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 16 }}>
            <Text style={{ fontSize: 24, color: '#F0F0F0', lineHeight: 40, fontWeight: '600' }}>Meet Kuky Bot</Text>
            <Text style={{ fontSize: 18, color: '#CDCDCD', lineHeight: 22, fontWeight: '500' }}>Your Icebreaker Companion</Text>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 }}>
                <Image source={images.suggestion_cloud} style={{width: 90, height: 90}} contentFit='contain'/>
                <Text style={{ fontSize: 18, color: '#F0F0F0', lineHeight: 22 }}>Hi Samantha!</Text>
                <Text style={{ fontSize: 16, color: '#F0F0F0', lineHeight: 25, textAlign: 'center' }}>I’m just here to give a little boost to your first conversation. Once you’re chatting, I’ll quietly step back and let you take over. </Text>
            </View>

            <ButtonWithLoading text='Start Chat' onPress={startChat} />
        </View>
    )
}

export default BotProfileScreen;