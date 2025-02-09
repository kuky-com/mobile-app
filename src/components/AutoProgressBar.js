import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import * as Progress from "react-native-progress";
import Text from "./Text";

const AutoProgressBar = () => {
    const [progress, setProgress] = useState(0);
    const animatedProgress = new Animated.Value(0);

    useEffect(() => {
        startProgressAnimation();
    }, []);

    const startProgressAnimation = () => {
        setProgress(0); // Reset progress

        const duration = Math.floor(Math.random() * (6000 - 5000 + 1) + 5000); // Random between 3-4 seconds

        Animated.timing(animatedProgress, {
            toValue: 1, // 100% progress
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();

        animatedProgress.addListener(({ value }) => {
            setProgress(value);
        });
    };

    return (
        <View style={styles.container}>
            <Progress.Bar progress={progress} width={250} color="#725ED4" height={10} borderRadius={8} />
            <Text style={styles.text}>{Math.round(progress * 100)}%</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        marginTop: 10,
        fontSize: 13,
        color: "#725ED4",
        fontWeight: "bold",
    },
});

export default AutoProgressBar;
