import { Header } from '@/components/Header';
import Text from '@/components/Text';
import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DynamicLikeItem = ({ itemWidth, item, onPress }) => {
    const [itemHeight, setItemHeight] = useState(150);

    const onImageLoad = (id, width, height) => {
        const aspectRatio = width / height;
        const newHeight = itemWidth / aspectRatio;

        setItemHeight(newHeight)
    };


    return (
        <TouchableOpacity onPress={() => onPress && onPress()} style={[styles.cardContainer, {width: itemWidth, height: itemHeight}]}>
            <Image
                source={{ uri: item.image }}
                style={[styles.image, { height: itemHeight }]}
                onLoad={(event) => {
                    const { width, height } = event.nativeEvent.source;
                    onImageLoad(item.id, width, height);
                }}
            />
            <View style={styles.tagContainer}>
                <Text style={styles.tagText}>{item.category}</Text>
            </View>

            <View style={styles.nameContainer}>
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.79)']}
                    style={styles.nameBackground}
                />
                <Text style={styles.name}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        overflow: 'hidden',
        margin: 8,
        borderWidth: 1, borderColor: 'white'
    },
    image: {
        width: '100%',
        borderRadius: 12,
    },
    tagContainer: {
        backgroundColor: '#7B65E8',
        position: 'absolute',
        height: 22, borderRadius: 11,
        justifyContent: 'center',
        paddingHorizontal: 10,
        top: 10,
        right: 10
    },
    tagText: {
        color: '#E8FF58',
        fontSize: 10,
        fontWeight: 'bold',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        color: 'white'
    },
    nameContainer: {
        position: 'absolute',
        bottom: 0, left: 0,
        height: '50%',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingBottom: 16, paddingLeft: 10,
        width: '100%'
    },
    nameBackground: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0
    }
});

export default DynamicLikeItem;
