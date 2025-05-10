import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Text from './Text';

const CustomSwitch = ({ value, onValueChange }) => {
    const translateX = useSharedValue(value ? 33 : 4);

    useEffect(() => {
        translateX.value = withTiming(value ? 33 : 4, { duration: 300 });
    }, [value])

    const toggleSwitch = () => {
        const newValue = !value;
        onValueChange(newValue);
    };

    const thumbAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <Pressable style={[styles.switch, { backgroundColor: value ? '#4CAF50' : '#CCCCCC' }]} onPress={toggleSwitch}>
            <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
            <Text style={[styles.text, { left: value ? 5 : 27 }]}>{value ? 'ON' : 'OFF'}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    switch: {
        width: 55,
        height: 22,
        borderRadius: 11,
        padding: 2,
        position: 'relative',
        justifyContent: 'center'
    },
    thumb: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FFFFFF',
        position: 'absolute',
    },
    text: {
        fontSize: 10,
        color: '#434343',
        position: 'absolute',
        top: Platform.OS === 'ios' ? 6 : 3
    },
});

export default CustomSwitch;
