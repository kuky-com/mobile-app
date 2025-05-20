import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import * as Progress from "react-native-progress";
import Text from "./Text";

const AutoProgressBar = ({indeterminate = false}) => {
    const [progress, setProgress] = useState(0);
    const animatedProgress = new Animated.Value(0);

    useEffect(() => {
        startProgressAnimation();
    }, []);

    const startProgressAnimation = () => {
        setProgress(0); // Reset progress

        Animated.timing(animatedProgress, {
            toValue: 1, // 100% progress
            duration: 6000,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();

        animatedProgress.addListener(({ value }) => {
            setProgress(value);
        });
    };

    return (
        <View style={styles.container}>
            <Progress.Bar indeterminate={indeterminate} width={Dimensions.get('screen').width - 64} color="#E8FF58" height={10} borderRadius={8} />
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
