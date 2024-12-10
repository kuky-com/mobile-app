import { React, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import images from '@/utils/images';
import { StatusBar } from 'expo-status-bar';
import Text from './Text';

export const Header = ({ leftIcon, rightText, leftAction, rightIcon, rightAction, rightIconColor, leftIconColor, rightCounter = 0, showLogo = true }) => {
  const insets = useSafeAreaInsets()

  const buttonWidth = Math.max((rightText ?? '').length * 5, 40)

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar translucent style='dark' />
      <View style={styles.contentContainer}>
        {leftIcon &&
          <TouchableOpacity style={[styles.leftButton, { width: buttonWidth }]} onPress={() => leftAction && leftAction()}>
            <Image source={leftIcon} style={[styles.buttonIcon, leftIconColor ? { tintColor: leftIconColor } : {}]} contentFit="contain" />
          </TouchableOpacity>
        }
        {showLogo &&
          <Image source={images.logo_icon} style={styles.logoImage} />
        }
        {rightIcon &&
          <TouchableOpacity style={styles.rightButton} onPress={() => rightAction && rightAction()}>
            <Image source={rightIcon} style={[styles.buttonIcon, rightIconColor ? { tintColor: rightIconColor } : {}]} contentFit="contain" />
            {
              rightCounter > 0 &&
              <View style={{ position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF8B8B' }}>
                <Text style={{ fontSize: 8, fontWeight: 'bold', color: 'white' }}>{rightCounter > 99 ? '...' : rightCounter}</Text>
              </View>
            }
          </TouchableOpacity>
        }
        {rightText &&
          <TouchableOpacity style={[styles.rightButton, { width: buttonWidth }]} onPress={() => rightAction && rightAction()}>
            <Text style={[styles.rightText, { color: rightIconColor ? rightIconColor : '#333333' }]}>{rightText}</Text>
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
    left: 0,
    width: 40,
    height: 40,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 5
  },
  rightButton: {
    position: 'absolute',
    right: 0,
    width: 40,
    height: 40,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 5
  },
  buttonIcon: {
    width: 27, height: 27,
  },
  rightText: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16, textAlign: 'right'
  }
});
