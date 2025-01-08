import { Header } from '@/components/Header';
import Text from '@/components/Text';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import AvatarImage from './AvatarImage';

const ITEM_WIDTH = Platform.isPad ? Dimensions.get('screen').width / 4 - 20 : Dimensions.get('screen').width / 2 - 24;

const DynamicLikeItem = ({ itemWidth, item, onPress }) => {
    const [itemHeight, setItemHeight] = useState(Math.round(itemWidth * 1024 / 800));
    const isRecentOnline = item?.last_active_time ? dayjs().diff(dayjs(item?.last_active_time), 'minutes') < 60 : false

    return (
        <TouchableOpacity onPress={() => onPress && onPress()} style={[styles.cardContainer, { width: itemWidth, height: itemHeight }]}>
            <AvatarImage
                avatar={item?.avatar}
                full_name={item?.full_name}
                style={[styles.image, { height: itemHeight }]}
            />
            <View style={styles.tagContainer}>
                <Text style={styles.tagText}>{item?.tag?.name}</Text>
            </View>

            <View style={styles.bottomContainer}>
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.79)']}
                    style={styles.nameBackground}
                />
                <View style={styles.nameContainer}>
                    {item.birthday && item.birthday.includes('-') && <Text style={styles.name}>{`${item.full_name}, ${dayjs().diff(dayjs(item.birthday, 'MM-DD-YYYY'), 'years')}`}</Text>}
                    {item.birthday && item.birthday.includes('/') && <Text style={styles.name}>{`${item.full_name}, ${dayjs().diff(dayjs(item.birthday, 'DD/MM/YYYY'), 'years')}`}</Text>}
                    {!item.birthday && <Text style={styles.name}>{`${item.full_name}`}</Text>}
                    {isRecentOnline &&
                        <View style={styles.onlineStatusBg}>
                            <View style={styles.onlineStatus} />
                        </View>
                    }
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
        textAlign: 'left',
        color: 'white', maxWidth: ITEM_WIDTH - 30
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0, left: 0,
        height: '50%',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingBottom: 16, paddingLeft: 10,
        width: '100%'
    },
    nameContainer: {
        flexDirection: "row", gap: 3
    },
    onlineStatus: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#47F644',
    },
    onlineStatusBg: {
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#5BFF5830',
        alignItems: 'center', justifyContent: 'center',
        marginTop: 2
    },
    nameBackground: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0
    }
});

export default DynamicLikeItem;
