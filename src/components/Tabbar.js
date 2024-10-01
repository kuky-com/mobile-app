import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import images from '@/utils/images';
import colors from '@/utils/colors';
import { Image } from 'expo-image';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/actions/global';

const styles = StyleSheet.create({
    container: {
        width: Dimensions.get('screen').width - 32,
        height: 68,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderRadius: 34,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        backgroundColor: 'white',
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 16, right: 0,
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flex: 1,
        gap: 3
    },
    buttonIcon: {
        width: 28,
        height: 28,
    },
});

const Tabbar = ({ navigation, state }) => {
    const currentUser = useAtomValue(userAtom)
    const insets = useSafeAreaInsets();
    const currentIndex = state.index;

    const openTab = (tabIndex) => {
        const { routes } = state;
        navigation.jumpTo(routes[tabIndex].name);
    };

    return (
        <View style={[styles.container, { bottom: insets.bottom + Platform.select({ ios: 0, android: 16 }) }]}>
            <TouchableWithoutFeedback onPress={() => openTab(0)}>
                <View style={[styles.buttonContainer]}>
                    <Image style={[styles.buttonIcon, {tintColor: currentIndex === 0 ? colors.mainColor : '#949494'}]} source={images.logo_icon} />
                    <Text style={{fontSize: 10, fontWeight: '700', color: currentIndex === 0 ? colors.mainColor : '#949494'}}>Explore</Text>
                </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => openTab(1)}>
                <View style={[styles.buttonContainer]}>
                    <Image style={[styles.buttonIcon, {tintColor: currentIndex === 1 ? colors.mainColor : '#949494'}]} source={images.matches_icon} />
                    <Text style={{fontSize: 10, fontWeight: '700', color: currentIndex === 1 ? colors.mainColor : '#949494'}}>Matches</Text>
                </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => openTab(2)}>
                <View style={[styles.buttonContainer]}>
                    <Image style={[styles.buttonIcon, {borderRadius: 14}]} source={currentUser?.avatar ? {uri: currentUser.avatar} : images.logo_icon} />
                    <Text style={{fontSize: 10, fontWeight: '700', color: currentIndex === 2 ? colors.mainColor : '#949494'}}>Profile</Text>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
};

export default Tabbar;
