import { Header } from '@/components/Header';
import Text from '@/components/Text';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import AvatarImage from './AvatarImage';
import OnlineStatus from './OnlineStatus';

const SimilarByPathItem = ({ itemWidth, item, onPress }) => {
    const [itemHeight, setItemHeight] = useState(Math.round(itemWidth * 1024 / 800));
    const isRecentOnline = item?.last_active_time ? dayjs().diff(dayjs(item?.last_active_time), 'minute') < 60 : false

    return (
        <TouchableOpacity onPress={() => onPress && onPress()} style={[styles.cardContainer, { width: itemWidth, height: itemHeight }]}>
            <AvatarImage
                avatar={item?.avatar}
                full_name={item?.full_name}
                style={[styles.image, { height: itemHeight }]}
            />
            <View style={styles.tagContainer}>
                <View style={styles.tagView}>
                    <Text style={styles.tagText}>{item?.journey?.name ?? ''}</Text>
                </View>
            </View>

            <View style={styles.bottomContainer}>
                <LinearGradient
                    colors={['transparent', 'black']}
                    style={styles.nameBackground}
                />
                <View style={styles.nameContainer}>
                    <Text style={[styles.name]}>{`${item.full_name}`}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 3, borderColor: 'white'
    },
    image: {
        width: '100%',
        borderRadius: 12,
    },
    tagContainer: {
        position: 'absolute',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        top: 12,
        right: 8,
        left: 8
    },
    tagView: {
        backgroundColor: '#7B65E8dd',
        paddingVertical: 5, borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10
    },
    tagText: {
        color: '#E8FF58',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 15
    },
    name: {
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'left',
        color: 'white',
        flex: 1
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0, left: 0,
        height: '50%',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingBottom: 22, paddingLeft: 12,
        width: '100%', gap: 10
    },
    nameContainer: {
        flexDirection: "row", alignItems: 'center', gap: 5, width: '100%'
    },
    nameBackground: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0
    }
});

export default SimilarByPathItem;
