import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Text from './Text';

const minValue = 1;
const maxValue = 10;
const step = 1; 
const sliderWidth = Dimensions.get('screen').width - 32;
const thumbSize = 40; 

const CustomSlider = ({ value = 5, setValue }) => {
  const steps = (maxValue - minValue) / step;

  const translateX = useSharedValue(0);
  const previousX = useSharedValue(0);
  const currentValue = useSharedValue(value); 

  const updateThumbPosition = (val) => {
    const stepIndex = (val - minValue) / step;
    const snappedX = (stepIndex / steps) * (sliderWidth - thumbSize);
    translateX.value = snappedX;
  };

  useEffect(() => {
    currentValue.value = value;
    updateThumbPosition(value)
  }, [value]);

  const updateValue = (newValue) => {
    currentValue.value = newValue;
    if (setValue) {
        setValue(newValue); 
    }
  };

  const gestureHandler = Gesture.Pan()
  .onEnd((event) => {
    previousX.value = previousX.value + event.translationX
  })
  .onUpdate((event) => {
    let newX = previousX.value + event.translationX

    if (newX < 0) newX = 0;
    if (newX > (sliderWidth - thumbSize)) newX = (sliderWidth - thumbSize);

    const stepIndex = Math.round((newX / (sliderWidth - thumbSize)) * steps);
    const snappedX = (stepIndex / steps) * (sliderWidth - thumbSize);

    translateX.value = withSpring(snappedX, { damping: 20, stiffness: 100 });

    const newValue = minValue + stepIndex * step;
    runOnJS(updateValue)(newValue);
  })

  // const gestureHandler = useAnimatedGestureHandler({
  //   onStart: (_, ctx) => {
  //     ctx.startX = translateX.value;
  //   },
  //   onActive: (event, ctx) => {
  //     let newX = ctx.startX + event.translationX;

  //     if (newX < 0) newX = 0;
  //     if (newX > sliderWidth) newX = sliderWidth;

  //     const stepIndex = Math.round((newX / sliderWidth) * steps);
  //     const snappedX = (stepIndex / steps) * sliderWidth;

  //     translateX.value = withSpring(snappedX, { damping: 20, stiffness: 100 });

  //     const newValue = minValue + stepIndex * step;
  //     console.log({newValue})
  //     runOnJS(updateValue)(newValue);
  //   },
  // });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value - sliderWidth / 2 + thumbSize / 2 }], 
    };
  });

  const thumbTextStyle = useAnimatedStyle(() => {
    return {
      color: '#000',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    };
  });

  return (
    <View style={styles.container}>
      <View style={[styles.track, { width: sliderWidth }]}>
        <View style={styles.trackBackground} />
        <View style={styles.trackOverlay} />
      </View>

      <GestureDetector gesture={gestureHandler}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <Animated.Text style={thumbTextStyle}>
            {Math.round(currentValue.value)}
          </Animated.Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  track: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  trackBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 5,
  },
  trackOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 7,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8FF58',
    position: 'absolute',
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  labelText: {
    fontSize: 12,
    color: '#CDB8E2',
    fontWeight: '500'
  },
});

export default CustomSlider;