import { Header } from '@/components/Header';
import Text from '@/components/Text';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import AvatarImage from './AvatarImage';
import OnlineStatus from './OnlineStatus';

const DynamicLikeItem = ({ itemWidth, item, onPress }) => {
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
                    {
                        item?.journey ? <Text style={styles.tagText}>{item?.journey?.name}</Text>
                        :
                        <Text style={styles.tagText}>{item?.tag?.name}</Text>
                    }
                </View>
            </View>

            <View style={styles.bottomContainer}>
                <LinearGradient
                    colors={['transparent', 'black']}
                    style={styles.nameBackground}
                />
                {item.user_note &&
                    <View style={{ backgroundColor: '#7B65E8dd', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomRightRadius: 20 }}>
                        <Text style={{ fontSize: 13, lineHeight: 20, fontWeight: '600', color: '#E8FF58' }}>{`"${item.user_note}"`}</Text>
                    </View>
                }
                <View style={styles.nameContainer}>
                    {item.birthday && item.birthday.includes('-') && <Text style={[styles.name, { maxWidth: itemWidth - 30 }]}>{`${item.full_name}, ${dayjs().diff(dayjs(item.birthday, 'MM-DD-YYYY'), 'year')} yo`}</Text>}
                    {item.birthday && item.birthday.includes('/') && <Text style={[styles.name, { maxWidth: itemWidth - 30 }]}>{`${item.full_name}, ${dayjs().diff(dayjs(item.birthday, 'DD/MM/YYYY'), 'year')} yo`}</Text>}
                    {!item.birthday && <Text style={[styles.name, { maxWidth: itemWidth - 30 }]}>{`${item.full_name}`}</Text>}
                    <OnlineStatus isRecentOnline={isRecentOnline} status={item?.online_status} radius={12} />
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
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 18
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'left',
        color: 'white'
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
        flexDirection: "row", alignItems: 'center', gap: 5
    },
    nameBackground: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0
    }
});

export default DynamicLikeItem;
