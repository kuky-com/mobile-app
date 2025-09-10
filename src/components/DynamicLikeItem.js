import Text from '@/components/Text';
import React, { memo, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';
import AvatarImage from './AvatarImage';
import OnlineStatus from './OnlineStatus';

const DynamicLikeItem = memo(({ itemWidth, item, onPress }) => {
    // Pre-calculate item height - no need for state since it's static
    const itemHeight = useMemo(() => Math.round(itemWidth * 1024 / 800), [itemWidth]);
    
    // Memoize expensive calculations
    const isRecentOnline = useMemo(() => 
        item?.last_active_time ? dayjs().diff(dayjs(item?.last_active_time), 'minute') < 60 : false,
        [item?.last_active_time]
    );

    const displayAge = useMemo(() => {
        if (!item?.birthday) return null;
        if (item.birthday.includes('-')) {
            return dayjs().diff(dayjs(item.birthday, 'MM-DD-YYYY'), 'year');
        }
        if (item.birthday.includes('/')) {
            return dayjs().diff(dayjs(item.birthday, 'DD/MM/YYYY'), 'year');
        }
        return null;
    }, [item?.birthday]);

    const displayName = useMemo(() => {
        if (displayAge !== null) {
            return `${item.full_name}, ${displayAge} yo`;
        }
        return item.full_name;
    }, [item.full_name, displayAge]);

    const handlePress = useCallback(() => {
        onPress && onPress();
    }, [onPress]);

    return (
        <TouchableOpacity onPress={handlePress} style={[styles.cardContainer, { width: itemWidth, height: itemHeight }]}>
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
                    <View style={styles.userNoteContainer}>
                        <Text style={styles.userNoteText}>{`"${item.user_note}"`}</Text>
                    </View>
                }
                <View style={styles.nameContainer}>
                    <Text style={[styles.name, { maxWidth: itemWidth - 30 }]}>{displayName}</Text>
                    <OnlineStatus isRecentOnline={isRecentOnline} status={item?.online_status} />
                </View>
            </View>
        </TouchableOpacity>
    );
});

// Add displayName for debugging
DynamicLikeItem.displayName = 'DynamicLikeItem';

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
    },
    userNoteContainer: {
        backgroundColor: '#7B65E8dd',
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20
    },
    userNoteText: {
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '600',
        color: '#E8FF58'
    }
});

export default DynamicLikeItem;
