import { Header } from '@/components/Header';
import Text from '@/components/Text';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, Dimensions, DeviceEventEmitter, ActivityIndicator, TouchableOpacity, InteractionManager } from 'react-native';
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
const INITIAL_RENDER_COUNT = 4;
const MAX_TO_RENDER_PER_BATCH = 6;
const WINDOW_SIZE = 8;

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
  const [sortBy, setSortBy] = useState({ sortBy: 'relevance', sortDirection: 'ASC' } );
  

  // Performance optimization refs
  const keywordTimeout = useRef(null);
  const requestAbortController = useRef(null);
  const isInitialLoad = useRef(true);
  const lastRequestTimestamp = useRef(0);
  
  const [itemWidth, setItemWidth] = useState(() => {
    const width = Dimensions.get('window').width;
    return width > 600 ? width / 2 - 60 : width - 50;
  });

  // Optimized resize handler with debouncing
  const handleResize = useCallback(() => {
    const width = Dimensions.get('window').width;
    setItemWidth(width > 600 ? width / 2 - 60 : width - 50);
  }, []);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', handleResize);
    return () => subscription?.remove();
  }, [handleResize]);

  useEffect(() => {
    // Use InteractionManager for better initial performance
    InteractionManager.runAfterInteractions(() => {
      analytics().logScreenView({ screen_name: 'ExploreScreen', screen_class: 'ExploreScreen' });
      loadJourneys();
    });
    
    const listener = DeviceEventEmitter.addListener(constants.REFRESH_SUGGESTIONS, onRefresh);
    return () => listener.remove();
  }, []);

  // Optimized effect with request deduplication
  useEffect(() => {
    const currentTimestamp = Date.now();
    
    // Debounce rapid changes
    if (currentTimestamp - lastRequestTimestamp.current < 300) {
      return;
    }
    
    lastRequestTimestamp.current = currentTimestamp;
    
    const timeoutId = setTimeout(() => {
      try {
        loadMatches(1);
      } catch (error) {
        console.log('Error loading matches:', error);
      }
    }, isInitialLoad.current ? 0 : 200);

    isInitialLoad.current = false;
    
    return () => clearTimeout(timeoutId);
  }, [selectedJourney?.id, finalKeyword, sortBy]);

  // Memoized journey loading
  const loadJourneys = useCallback(async () => {
    try {
      const res = await apiClient.get('journeys/active-journeys');
      if (res?.data?.success) {
        setJourneys(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load journeys:', error);
    }
  }, []);

  // Optimized query building with memoization
  const buildQuery = useMemo(() => {
    let query = '';
    if (selectedJourney?.id) query += `journey_id=${selectedJourney.id}&`;
    if (finalKeyword) query += `keyword=${encodeURIComponent(finalKeyword)}&`;
    
    // Add sorting parameters
    query += `sort_by=${sortBy.sortBy}&`;
    query += `sort_direction=${sortBy.sortDirection}&`;
    return query;
  }, [selectedJourney?.id, finalKeyword, sortBy]);

  // Optimized loadMatches with better error handling and request management
  const loadMatches = useCallback(async (resetPage = 1) => {
    try {
      const isFirstPage = resetPage === 1;
      const offset = (resetPage - 1) * PAGE_SIZE;

      // Prevent multiple simultaneous calls
      if (isFirstPage) {
        if (isFetching) {
          return;
        }
        setFetching(true);
        setPage(1);
      } else {
        if (!canLoadMore || loadingMore) return;
        setLoadingMore(true);
      }

      try {
        const query = buildQuery; // Use the memoized query
        const response = await apiClient.get(`/matches/match-by-journey?${query}offset=${offset}&limit=${PAGE_SIZE}`)
        if (!response.data) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = response.data
        if (result?.data) {
          const newData = result.data || [];
          
          if (isFirstPage) {
            setSuggestions(newData);
          } else {
            setSuggestions(prev => [...prev, ...newData]);
            setPage(resetPage);
          }
          
          setCanLoadMore(newData.length === PAGE_SIZE);
        } else {
          if (isFirstPage) {
            setSuggestions([]);
          }
          setCanLoadMore(false);
        }
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          console.log('Request aborted');
          return;
        }
        
        console.error('API Error:', fetchError);
        if (isFirstPage) {
          setSuggestions([]);
        }
        setCanLoadMore(false);
      }
    } catch (error) {
      console.log('Error in loadMatches:', error);
    } finally {
      setFetching(false);
      setLoadingMore(false);
      requestAbortController.current = null;
    }
  }, [buildQuery, canLoadMore, loadingMore, isFetching]); // Fixed dependencies

  // Optimized load more with throttling
  const onLoadMore = useCallback(() => {
    if (canLoadMore && !loadingMore && !isFetching) {
      loadMatches(page + 1);
    }
  }, [canLoadMore, loadingMore, isFetching, page, loadMatches]);

  const onRefresh = useCallback(() => {
    loadMatches(1);
  }, [loadMatches]);

  // Optimized debounced search with cleanup
  const debounceKeyword = useCallback((text) => {
    setKeyword(text);
    
    if (keywordTimeout.current) {
      clearTimeout(keywordTimeout.current);
    }
    
    keywordTimeout.current = setTimeout(() => {
      setFinalKeyword(text);
    }, 300); // Reduced from 500ms for better responsiveness
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (keywordTimeout.current) {
        clearTimeout(keywordTimeout.current);
      }
      if (requestAbortController.current) {
        requestAbortController.current.abort();
      }
    };
  }, []);

  // Memoized sort options
  const sortOptions = useMemo(() => [
    { text: 'Relevance (Best Match)', value: { sortBy: 'relevance', sortDirection: 'ASC' } },
    { text: 'Distance (Nearest First)', value: { sortBy: 'distance', sortDirection: 'ASC' } },
    { text: 'Distance (Farthest First)', value: { sortBy: 'distance', sortDirection: 'DESC' } },
    { text: 'Latest Registration (Newest)', value: { sortBy: 'latest_registration', sortDirection: 'DESC' } },
    { text: 'Latest Registration (Oldest)', value: { sortBy: 'latest_registration', sortDirection: 'ASC' } },
  ], []);

  const openSortPicker = useCallback(async () => {
    await SheetManager.show('action-sheets', {
      payload: {
        actions: sortOptions,
        onPress(index) {
          const selected = sortOptions[index].value;
          setSortBy(selected);
        },
      },
    });
  }, [sortOptions]);

  // Memoized journey options
  const journeyOptions = useMemo(() => {
    const options = journeys.map((item) => ({ text: item.name, value: item }));
    options.unshift({ text: 'All Journeys', value: null });
    return options;
  }, [journeys]);

  const openJourneyPicker = useCallback(async () => {
    await SheetManager.show('action-sheets', {
      payload: {
        actions: journeyOptions,
        onPress(index) {
          setSelectedJourney(journeyOptions[index].value);
        },
      },
    });
  }, [journeyOptions]);

  // Memoized sort display text
  const getSortDisplayText = useMemo(() => {
    switch (sortBy.sortBy) {
      case 'relevance':
        return 'Best Match';
      case 'distance':
        return sortBy.sortDirection === 'ASC' ? 'Nearest' : 'Farthest';
      case 'latest_registration':
        return sortBy.sortDirection === 'DESC' ? 'Newest' : 'Oldest';
      default:
        return 'Best Match';
    }
  }, [sortBy, sortBy.sortDirection]);

  // Optimized render functions with memoization
  const renderItem = useCallback(({ item, index }) => (
    <DynamicLikeItem 
      key={`profile-${item.id}`} 
      onPress={() => navigation.push('ConnectProfileScreen', { profile: item })} 
      item={item} 
      itemWidth={itemWidth} 
    />
  ), [itemWidth, navigation]);

  const keyExtractor = useCallback((item, index) => `${item.id}-${index}`, []);

  const getItemLayout = useCallback((data, index) => ({
    length: itemWidth + 20, // item width + margin
    offset: (itemWidth + 20) * index,
    index,
  }), [itemWidth]);

  const renderFooter = useCallback(() => (
    <View style={{ marginBottom: insets.bottom + 80, padding: 16, minHeight: 60 }}>
      {loadingMore && (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
          <ActivityIndicator size='small' color={colors.mainColor} />
          <Text style={{ marginTop: 8, fontSize: 12, color: colors.mainColor }}>Loading more...</Text>
        </View>
      )}
    </View>
  ), [loadingMore, insets.bottom]);

  const renderEmptyComponent = useCallback(() => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.mainColor, textAlign: 'center' }}>
        No matches found
      </Text>
      <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 }}>
        Try adjusting your search or filters
      </Text>
    </View>
  ), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Explore</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity onPress={openSortPicker} style={styles.sortButton}>
            <FontAwesome6 name='sort' size={12} color='black' />
            <Text numberOfLines={1} style={styles.sortText}>{getSortDisplayText}</Text>
            <FontAwesome6 name='chevron-down' size={12} color='black' />
          </TouchableOpacity>
          <TouchableOpacity onPress={openJourneyPicker} style={styles.journeyButton}>
            <Text numberOfLines={1} style={styles.journeyText}>
              {selectedJourney ? selectedJourney.name : 'All Journeys'}
            </Text>
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
        keyExtractor={keyExtractor}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!isFetching ? renderEmptyComponent : null}
        refreshing={isFetching}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
        windowSize={WINDOW_SIZE}
        initialNumToRender={INITIAL_RENDER_COUNT}
        updateCellsBatchingPeriod={100}
        getItemLayout={getItemLayout}
        // Memory optimizations
        disableVirtualization={false}
        legacyImplementation={false}
        // Interaction optimizations
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
