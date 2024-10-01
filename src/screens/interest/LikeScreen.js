import { Header } from '@/components/Header';
import Text from '@/components/Text';
import React, { useEffect, useState } from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DynamicLikeItem from '@/components/DynamicLikeItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '@/utils/apiClient';

const ITEM_WIDTH = Dimensions.get('window').width / 2 - 24;

const LikesScreen = ({navigation}) => {
    const insets = useSafeAreaInsets()
    const [suggestions, setSuggestions] = useState([])
    const [isFetching, setFetching] = useState(false)

    useEffect(() => {
        onRefresh()
    }, [])

    const onRefresh = () => {
        setFetching(true)
        apiClient.post('suggestions/list', {})
            .then((res) => {
                setFetching(false)
                if (res && res.data && res.data.success) {
                    setSuggestions(res.data.suggestions)
                } else {
                    setSuggestions([])
                }
            })
            .catch((error) => {
                setFetching(false)
                console.log({ error })
                setSuggestions([])
            })
    }


    const openProfile = (item) => {
        navigation.push('ConnectProfileScreen', {profile: item})
    }

    const renderItem = ({ item }) => {
        return (
            <DynamicLikeItem onPress={() => openProfile(item)} item={item} itemWidth={ITEM_WIDTH} />
        );
    };

    const renderHeader = () => {
        return(
            <View style={{paddingVertical: 10, paddingHorizontal: 8}}>
                <Text style={{fontSize: 24, color: 'black', fontWeight: 'bold'}}>Explore</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Header showLogo />
            <FlatList
                data={suggestions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                style={{ flex: 1, paddingHorizontal: 8 }}
                ListFooterComponent={<View style={{height: insets.bottom +80}}></View>}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                onRefresh={onRefresh}
                refreshing={isFetching}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F1F3'
    },
});

export default LikesScreen;
