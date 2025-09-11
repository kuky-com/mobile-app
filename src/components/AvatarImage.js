import React, { useState, memo, useMemo, useCallback } from 'react'
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
  } catch {
    // Handle invalid names gracefully
  }
  return '';
}

const AvatarImage = memo(({ avatar, full_name, style }) => {
  const [height, setHeight] = useState(0);

  const onLayout = useCallback((event) => {
    const { height } = event.nativeEvent.layout;
    setHeight(height);
  }, []);

  const initials = useMemo(() => getInitials(full_name), [full_name]);
  const fontSize = useMemo(() => height * 0.4, [height]);

  if (!avatar) {
    return (
      <View onLayout={onLayout} style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#aaaaaa' }]}>
        <Text style={{ fontSize: fontSize, color: 'white', fontWeight: 'bold' }}>{initials}</Text>
      </View>
    )
  }
  return (
    <Image
      source={{ uri: avatar }}
      style={style}
      contentFit='cover'
      // Add performance optimizations for images
      cachePolicy="memory-disk"
      transition={100}
      placeholder={'L6Pj42jE.AyE_3t7t7R**0o#DgR4'}
      placeholderContentFit="cover"
    />
  )
});

AvatarImage.displayName = 'AvatarImage';

export default AvatarImage
