import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import Text from './Text';

export default function SwitchWithText({enable = true, setEnable = () => {}}) {
  const animation = useRef(new Animated.Value(0)).current;

  const toggleSwitch = () => {
    setEnable((previousState) => !previousState);

    Animated.timing(animation, {
      toValue: enable ? 1 : 0, 
      duration: 300, 
      useNativeDriver: false,
    }).start();
  };

  const thumbPosition = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 60],
  });

  const switchBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e5e5ea', '#34c759'], 
  });

  const thumbColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#66E290', '#FF8B8B'], 
  });

  return (
      <TouchableOpacity
        style={styles.switchContainer}
        onPress={toggleSwitch}
        activeOpacity={0.7}
      >
        <View
          style={styles.switchBackground}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                transform: [{ translateX: thumbPosition }],
              },
              { backgroundColor: thumbColor }
            ]}
          />
          <View style={[styles.textContainer]}>
            <Text style={[styles.switchText, {textAlign: enable ? 'right' : 'left'}]}>
              {enable ? 'Public' : 'Private'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchBackground: {
    width: 90,
    height: 32,
    borderRadius: 20,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#E5E5E5',
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 3,
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  switchText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#434343',
    width: '100%',
    paddingHorizontal: 8
  },
});
