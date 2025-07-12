import { Header } from '@/components/Header';
import Text from '@/components/Text';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Dimensions, DeviceEventEmitter, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '@/utils/apiClient';
import constants from '@/utils/constants';
import { useAtom, useAtomValue } from 'jotai';
import { notiCounterAtom, userAtom } from '@/actions/global';
import colors from '@/utils/colors';
import analytics from '@react-native-firebase/analytics';
import { FontAwesome6 } from '@expo/vector-icons';
import { SheetManager } from 'react-native-actions-sheet';
import { naturalJoin } from '../../utils/utils';
import TextInput from '../../components/TextInput';
import DynamicLikeItem from '@/components/DynamicLikeItem';

const PAGE_SIZE = 8;

const ExploreScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [suggestions, setSuggestions] = useState([]);
  const [isFetching, setFetching] = useState(false);
  const [notiCounter] = useAtom(notiCounterAtom);
  const currentUser = useAtomValue(userAtom);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [finalKeyword, setFinalKeyword] = useState('');
  const [journeys, setJourneys] = useState([]);
  const [selectedJourney, setSelectedJourney] = useState(null);
  
  // Add sorting state
  const [sortBy, setSortBy] = useState('relevance'); // relevance, distance, latest_registration
  const [sortDirection, setSortDirection] = useState('ASC'); // ASC, DESC
  
  const keywordTimeout = useRef(null);
  const [itemWidth, setItemWidth] = useState(() => {
    const width = Dimensions.get('window').width;
    return width > 600 ? width / 2 - 60 : width - 50;
  });

  // useEffect(() => {
  //   const resizeHandler = () => {
  //     const width = Dimensions.get('window').width;
  //     setItemWidth(width > 600 ? width / 2 - 60 : width - 50);
  //   };
  //   Dimensions.addEventListener('change', resizeHandler);
  //   return () => Dimensions.removeEventListener('change', resizeHandler);
  // }, []);

  useEffect(() => {
  const resizeHandler = () => {
    const width = Dimensions.get('window').width;
    setItemWidth(width > 600 ? width / 2 - 60 : width - 50);
  };

  const subscription = Dimensions.addEventListener('change', resizeHandler);

  return () => subscription?.remove(); // ✅ Correct cleanup
}, []);

  useEffect(() => {
    analytics().logScreenView({ screen_name: 'ExploreScreen', screen_class: 'ExploreScreen' });
    loadJourneys();
    const listener = DeviceEventEmitter.addListener(constants.REFRESH_SUGGESTIONS, onRefresh);
    return () => listener.remove();
  }, []);

  useEffect(() => {
    try {
      loadMatches(1);
    } catch (error) {
      console.log('Error loading matches:', error);
    }
  }, [selectedJourney, finalKeyword, sortBy, sortDirection]);

  const loadJourneys = useCallback(() => {
    apiClient.get('journeys/active-journeys')
      .then(res => {
        if (res?.data?.success) setJourneys(res.data.data);
      })
      .catch(console.error);
  }, []);

  const buildQuery = () => {
    let query = '';
    if (selectedJourney) query += `journey_id=${selectedJourney.id}&`;
    if (finalKeyword) query += `keyword=${finalKeyword}&`;
    
    // Add sorting parameters
    query += `sort_by=${sortBy}&`;
    query += `sort_direction=${sortDirection}&`;
    
    return query;
  };

  const loadMatches = useCallback((resetPage = 1) => {
    try {
      if (resetPage === 1) {
        setFetching(true);
        setPage(1);
        apiClient.get(`matches/match-by-journey?${buildQuery()}offset=0&limit=${PAGE_SIZE}`)
          .then(res => {
            setFetching(false);
            if (res?.data?.success) {
              setSuggestions(res.data.data);
              setCanLoadMore(res.data.data.length === PAGE_SIZE);
            } else {
              setSuggestions([]);
              setCanLoadMore(false);
            }
          })
          .catch(err => {
            setFetching(false);
            console.error(err);
          });
      } else if (canLoadMore && !loadingMore) {
        setLoadingMore(true);
        apiClient.get(`matches/match-by-journey?${buildQuery()}offset=${(resetPage - 1) * PAGE_SIZE}&limit=${PAGE_SIZE}`)
          .then(res => {
            setLoadingMore(false);
            if (res?.data?.success) {
              setSuggestions(prev => [...prev, ...res.data.data]);
              setCanLoadMore(res.data.data.length === PAGE_SIZE);
              setPage(resetPage);
            } else setCanLoadMore(false);
          })
          .catch(err => {
            setLoadingMore(false);
            console.error(err);
          });
      }
    } catch (error) {
      console.log('Error in loadMatches:', error);
      setFetching(false);
      setLoadingMore(false);
    }
  }, [buildQuery, canLoadMore, loadingMore, page]);

  const onLoadMore = () => {
    if (canLoadMore && !loadingMore) loadMatches(page + 1);
  };

  const onRefresh = () => {
    loadMatches(1);
  };

  const debounceKeyword = (text) => {
    setKeyword(text);
    if (keywordTimeout.current) clearTimeout(keywordTimeout.current);
    keywordTimeout.current = setTimeout(() => {
      setFinalKeyword(text);
    }, 500);
  };

  const openJourneyPicker = async () => {
    const options = journeys.map((item) => ({ text: item.name, value: item }));
    options.unshift({ text: 'All Journeys', value: null });

    await SheetManager.show('action-sheets', {
      payload: {
        actions: options,
        onPress(index) {
          setSelectedJourney(options[index].value);
        },
      },
    });
  };

  const openSortPicker = async () => {
    const sortOptions = [
      { text: 'Relevance (Best Match)', value: { sortBy: 'relevance', sortDirection: 'ASC' } },
      { text: 'Distance (Nearest First)', value: { sortBy: 'distance', sortDirection: 'ASC' } },
      { text: 'Distance (Farthest First)', value: { sortBy: 'distance', sortDirection: 'DESC' } },
      { text: 'Latest Registration (Newest)', value: { sortBy: 'latest_registration', sortDirection: 'DESC' } },
      { text: 'Latest Registration (Oldest)', value: { sortBy: 'latest_registration', sortDirection: 'ASC' } },
    ];

    await SheetManager.show('action-sheets', {
      payload: {
        actions: sortOptions,
        onPress(index) {
          const selected = sortOptions[index].value;
          setSortBy(selected.sortBy);
          setSortDirection(selected.sortDirection);
        },
      },
    });
  };

  const getSortDisplayText = () => {
    switch (sortBy) {
      case 'relevance':
        return 'Best Match';
      case 'distance':
        return sortDirection === 'ASC' ? 'Nearest' : 'Farthest';
      case 'latest_registration':
        return sortDirection === 'DESC' ? 'Newest' : 'Oldest';
      default:
        return 'Best Match';
    }
  };

  const renderItem = ({ item }) => (
    <DynamicLikeItem key={`profile-${item.id}`} onPress={() => navigation.push('ConnectProfileScreen', { profile: item })} item={item} itemWidth={itemWidth} />
  );

  const renderFooter = () => (
    <View style={{ marginBottom: insets.bottom + 80, padding: 16 }}>
      {loadingMore && <ActivityIndicator size='small' color={colors.mainColor} />}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Explore</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity onPress={openSortPicker} style={styles.sortButton}>
            <FontAwesome6 name='sort' size={12} color='black' />
            <Text numberOfLines={1} style={styles.sortText}>{getSortDisplayText()}</Text>
            <FontAwesome6 name='chevron-down' size={12} color='black' />
          </TouchableOpacity>
          <TouchableOpacity onPress={openJourneyPicker} style={styles.journeyButton}>
            <Text numberOfLines={1} style={styles.journeyText}>{selectedJourney ? selectedJourney.name : 'All Journeys'}</Text>
            <FontAwesome6 name='chevron-down' size={15} color='black' />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBoxWrapper}>
        <FontAwesome6 name='magnifying-glass' size={16} color='#8C8C8C' style={{ marginLeft: 10 }} />
        <TextInput
          value={keyword}
          onChangeText={debounceKeyword}
          placeholder="Search people ..."
          placeholderTextColor="#8C8C8C"
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={suggestions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString()}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        refreshing={isFetching}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1F3',
  },
  headerRow: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black'
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 8,
    height: 30,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CDB8E2',
    gap: 4,
  },
  sortText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'black',
  },
  journeyButton: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CDB8E2'
  },
  journeyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
    marginRight: 6
  },
  searchBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1E1E1',
    borderRadius: 5,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 5
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
    paddingVertical: 5,
    paddingHorizontal: 10
  }
});

export default ExploreScreen;
