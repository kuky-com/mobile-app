import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import colors from '../../../utils/colors';
import Text from '../../../components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ImagePickerGallery = ({onClose}) => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const insets = useSafeAreaInsets()

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
      if (status === 'granted') {
        fetchPhotos();
      }
    })();
  }, []);

  const fetchPhotos = async () => {
    const { assets } = await MediaLibrary.getAssetsAsync({
      mediaType: 'photo',
      first: 100, 
    });
    setPhotos(assets);
  };

  const toggleSelectPhoto = (photo) => {
    const alreadySelected = selectedPhotos.find(
      (selected) => selected.id === photo.id
    );
    if (alreadySelected) {
      setSelectedPhotos((prev) =>
        prev.filter((selected) => selected.id !== photo.id)
      );
    } else {
      setSelectedPhotos((prev) => [...prev, photo]);
    }
  };

  if (!permissionGranted) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Permission to access the photo library is required.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.photoContainer,
              selectedPhotos.find((photo) => photo.id === item.id)
                ? styles.photoSelected
                : null,
            ]}
            onPress={() => toggleSelectPhoto(item)}
          >
            <Image source={{ uri: item.uri }} style={styles.photo} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.photoGrid}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => console.log('Selected Photos:', selectedPhotos)}
      >
        <Text style={styles.actionButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: (Dimensions.get('window').width / 3 - 12) * 2 + 60,
    gap: 8
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoGrid: {
    padding: 4,
  },
  photoContainer: {
    width: (Dimensions.get('window').width - 32) / 3 - 8,
    height: (Dimensions.get('window').width - 32) / 3 - 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoSelected: {
    borderWidth: 3,
    borderColor: '#6200EE',
  },
  actionButton: {
    backgroundColor: colors.mainColor,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
});

export default ImagePickerGallery;
