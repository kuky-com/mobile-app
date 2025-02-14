import { React, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import images from '@/utils/images';
import { StatusBar } from 'expo-status-bar';

export const Header = ({ leftIcon, leftAction, rightIcon, rightAction, rightIconColor, leftIconColor, showLogo = true}) => {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.container, {paddingTop: insets.top + 8}]}>
      <StatusBar translucent style='dark' />
      <View style={styles.contentContainer}>
        {leftIcon &&
          <TouchableOpacity style={styles.leftButton} onPress={() => leftAction && leftAction()}>
            <Image source={leftIcon} style={[styles.buttonIcon, leftIconColor ? {tintColor: leftIconColor} : {}]} contentFit="contain" />
          </TouchableOpacity>
        }
        {showLogo && 
            <Image source={images.logo_icon} style={styles.logoImage}/>
        }
        {rightIcon &&
          <TouchableOpacity style={styles.rightButton} onPress={() => rightAction && rightAction()}>
            <Image source={rightIcon} style={[styles.buttonIcon, rightIconColor ? {tintColor: rightIconColor} : {}]} contentFit="contain" />
          </TouchableOpacity>
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F1F3',
    paddingHorizontal: 16
  },
  contentContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: '#787879',
    borderBottomWidth: 0.2,
    paddingBottom: 16
  },
  logoImage: {
    width: 40, height: 40
  },
  leftButton: {
    position: 'absolute',
    left: 16, 
    width: 40,
    height: 40,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 5
  },
  rightButton: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 5
  },
  buttonIcon: {
    width: 27, height: 27,
  },
});
