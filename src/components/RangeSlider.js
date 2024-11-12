import React, {useState} from 'react';
import {View, PanResponder, Dimensions, StyleSheet} from 'react-native';
import Text from './Text';

const RangeSlider = ({low, high, min, max, onChangeValue}) => {
  const trackWidth = Dimensions.get('screen').width - 64;
  const normalizeMax = Number.isNaN(max) ? 0 : max;
  const [showLowTooltip, setShowLowTooltip] = useState(false);
  const [showHighTooltip, setShowHighTooltip] = useState(false);

  const panResponderLow = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setShowLowTooltip(true),
    onPanResponderMove: (evt, gestureState) => {
      const newLowValue = Math.min(
        Math.max(
          min,
          low + (gestureState.dx / trackWidth) * (normalizeMax - min),
        ),
        high,
      );

      if (onChangeValue) {
        onChangeValue(newLowValue, high);
      }
    },
    onPanResponderRelease: () => setShowLowTooltip(false),
  });

  const panResponderHigh = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setShowHighTooltip(true),
    onPanResponderMove: (evt, gestureState) => {
      const newHighValue = Math.max(
        Math.min(
          normalizeMax,
          high + (gestureState.dx / trackWidth) * (normalizeMax - min),
        ),
        low,
      );

      if (onChangeValue) {
        onChangeValue(low, newHighValue);
      }
    },
    onPanResponderRelease: () => setShowHighTooltip(false),
  });

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <View style={styles.track}>
          <View
            style={[styles.trackSegment, {backgroundColor: 'transparent', flex: low}]}
          />
          <View
            style={[
              styles.trackSegment,
              {backgroundColor: '#C0C0C0', flex: Math.max(high - low, 0)},
            ]}
          />
          <View
            style={[
              styles.trackSegment,
              {
                backgroundColor: 'transparent',
                flex: Math.max(normalizeMax - min - high, 0),
              },
            ]}
          />
        </View>
        {showLowTooltip && (
          <View
            style={[
              styles.tooltip,
              {
                left: `${(low / (normalizeMax - min)) * 100}%`,
                marginLeft: -thumbWidth,
              },
            ]}>
            <Text style={styles.tooltipText}>
              {`00:${low.toString().padStart(2, '0')}`}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.thumb,
            {
              left: `${(low / (normalizeMax - min)) * 100}%`,
              marginLeft: -2,
              zIndex: low < max ? 2 : 5,
              borderTopLeftRadius: 3,
              borderBottomLeftRadius: 3
            },
          ]}
          {...panResponderLow.panHandlers}
        />
        {showHighTooltip && (
          <View
            style={[
              styles.tooltip,
              {
                left: `${(high / (normalizeMax - min)) * 100}%`,
                marginLeft: -thumbWidth,
              },
            ]}>
            <Text style={styles.tooltipText}>
            {`00:${high.toString().padStart(2, '0')}`}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.thumb,
            {
              left: `${(high / (normalizeMax - min)) * 100}%`,
              marginLeft: -thumbWidth + 1,
              zIndex: low < max ? 5 : 2,
              borderTopRightRadius: 3,
              borderBottomRightRadius: 3
            },
          ]}
          {...panResponderHigh.panHandlers}
        />
      </View>
    </View>
  );
};

export const thumbWidth = 12;
export const thumbHeight = 30;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    width: '85%',
    position: 'relative',
    height: 32, borderWidth: 1, borderColor: '#333333',
    borderRadius: 5
  },
  track: {
    flexDirection: 'row',
    height: '100%',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
    borderRadius: 3
  },
  trackSegment: {
    height: '100%',
    borderRadius: 3
  },
  thumb: {
    position: 'absolute',
    width: thumbWidth,
    height: thumbHeight,
    // borderRadius: 3,
    backgroundColor: '#333333',
  },
  tooltip: {
    position: 'absolute',
    top: -thumbHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    borderRadius: 5,
    padding: 5,
    zIndex: 10,
  },
  tooltipText: {
    color: 'white',
    fontSize: 12,
  },
});

export default RangeSlider;
