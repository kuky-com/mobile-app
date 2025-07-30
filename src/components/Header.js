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

export const Header = ({ leftIcon, title, rightText, leftAction, rightIcon, rightAction, rightIconColor, leftIconColor, rightCounter = 0, showLogo = true }) => {
  const insets = useSafeAreaInsets()

  const buttonWidth = Math.max((rightText ?? '').length * 5, 70)

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
        {!showLogo && title &&
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold', textAlign: 'center' }}>
              {title}
            </Text>
          </View>
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
            <Text style={[styles.rightText, { color: rightIconColor ? rightIconColor : 'black' }]}>{rightText}</Text>
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
    width: 32,
    height: 32,
    resizeMode: "contain", // Ensures the logo fits without being cut
    marginHorizontal: 8,   // Adds space to prevent side cropping
  },
  leftButton: {
    position: 'absolute',
    left: 0,
    width: 70,
    height: 40,
    bottom: 5,
    alignItems: 'flex-start', justifyContent: 'center',
    zIndex: 5
  },
  rightButton: {
    position: 'absolute',
    right: 0,
    width: 70,
    height: 40,
    alignItems: 'flex-end', justifyContent: 'center',
    zIndex: 5,
    bottom: 5,
  },
  buttonIcon: {
    width: 27, height: 27,
  },
  rightText: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16, textAlign: 'right', color: 'black'
  }
});
