import React, { useState } from 'react'
import Text from './Text';
import { View } from 'react-native';
import { Image } from 'expo-image';

const getInitials = (name) => {
  try {
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else if (nameParts.length >= 2) {
      return (
        nameParts[0].charAt(0).toUpperCase() +
        nameParts[nameParts.length - 1].charAt(0).toUpperCase()
      );
    }
  } catch (error) {

  }
  return '';
}

const AvatarImage = ({ avatar, full_name, style }) => {
  const [height, setHeight] = useState(0);

  const onLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setHeight(height);
  };

  if (!avatar) {
    return (
      <View onLayout={onLayout} style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#aaaaaa' }]}>
        <Text style={{ fontSize: height * 0.4, color: 'white', fontWeight: 'bold' }}>{getInitials(full_name)}</Text>
      </View>
    )
  }
  return (
    <Image
      source={{ uri: avatar }}
      style={style}
      contentFit='cover'
    />
  )
}

export default AvatarImage