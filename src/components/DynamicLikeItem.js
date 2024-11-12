import { Header } from '@/components/Header';
import Text from '@/components/Text';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import AvatarImage from './AvatarImage';

const itemWidth = Dimensions.get('screen').width * 0.5 - 24

const DynamicLikeItem = ({ itemWidth, item, onPress }) => {
    const [itemHeight, setItemHeight] = useState(Math.round(itemWidth * 1024 / 800));

    // const onImageLoad = (id, width, height) => {
    //     const aspectRatio = width / height;
    //     const newHeight = itemWidth / aspectRatio;

    //     setItemHeight(newHeight)
    // };


    return (
        <TouchableOpacity onPress={() => onPress && onPress()} style={[styles.cardContainer, {width: itemWidth, height: itemHeight}]}>
            {/* <Image
                source={{ uri: item?.avatar }}
                style={[styles.image, { height: itemHeight }]}
                // onLoad={(event) => {
                //     const { width, height } = event.nativeEvent.source;
                //     onImageLoad(item.id, width, height);
                // }}
                contentFit='cover'
            /> */}
            <AvatarImage 
                avatar={item?.avatar}
                full_name={item?.full_name}
                style={[styles.image, { height: itemHeight }]}
            />
            <View style={styles.tagContainer}>
                <Text style={styles.tagText}>{item?.tag?.name}</Text>
            </View>

            <View style={styles.nameContainer}>
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.79)']}
                    style={styles.nameBackground}
                />
                <Text style={styles.name}>{`${item.full_name}, ${dayjs().diff(dayjs(item.birthday, 'MM-DD-YYYY'), 'years')}`}</Text>
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
        paddingVertical: 5, borderRadius: 11,
        justifyContent: 'center',
        paddingHorizontal: 10,
        top: 8,
        right: 3,
        maxWidth: '80%'
    },
    tagText: {
        color: '#E8FF58',
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    name: {
        fontWeight: 'bold',
        fontSize: Platform.isPad ? 20 : 14,
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
