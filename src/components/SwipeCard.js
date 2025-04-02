import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

export default function SwipeCard({ children, style, onSwipeLeft, onSwipeRight }) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const onSwipe = (direction) => {

        if (direction === 'left' && onSwipeLeft) onSwipeLeft()
        if (direction === 'right' && onSwipeRight) onSwipeRight()

        translateX.value = 0;
        translateY.value = 0;
    };

    const gestureHandler = useAnimatedGestureHandler({
        onActive: (event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        },
        onEnd: (event) => {
            if (event.translationX > SWIPE_THRESHOLD) {
                // Swiped Right
                runOnJS(onSwipe)('right');
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                // Swiped Left
                runOnJS(onSwipe)('left');
            } else {
                // Restore
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        },
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotateZ: `${translateX.value / 20}deg` },
        ],
    }));

    return (
        <PanGestureHandler onGestureEvent={gestureHandler}
            activeOffsetX={[-10, 10]}  // allow movement if horizontal swipe exceeds 10 px
            activeOffsetY={[-9999, 9999]}
        >
            <Animated.View style={[style, animatedStyle]}>
                {children}
            </Animated.View>
        </PanGestureHandler>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    card: {
        width: '100%',
        height: '100%',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});
