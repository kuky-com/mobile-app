import { Image } from 'expo-image';
import React, {useRef, useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ActionSheet, {
  useScrollHandlers,
  SheetManager,
} from 'react-native-actions-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Text from '../Text';

const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    buttonContainer: {
      width: '100%',
      paddingVertical: 16,
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 16,
    },
    text: {
      flex: 1,
      textAlign: 'left',
      color: '#212B36',
      fontSize: 16,
      fontWeight: '500',
    },
    icon: {
      width: 24,
      height: 24,
      marginRight: 8,
    },
    keywordInput: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      backgroundColor: 'white',
      borderRadius: 3,
    },
    keywordContainer: {
      width: '100%',
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: '#f0f0f0',
    },
  });

function ActionSheets(props) {
  const insets = useSafeAreaInsets();
  const actionSheetRef = useRef(null);
  const scrollHandlers = useScrollHandlers({
    refreshControlBoundary: 0,
  });
  const [keyword, setKeyword] = useState('');

  let validActions = props.payload?.actions ?? [];
  if (keyword.length > 0) {
    validActions = validActions.filter(item =>
      item.text.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()),
    );
  }

  return (
    <ActionSheet headerAlwaysVisible id={props.sheetId} ref={actionSheetRef}>
      <ScrollView
        {...scrollHandlers}
        style={{
          height: (props.payload?.actions ?? []).length * 60 + ((props.payload?.title ?? '').length > 0 ? 50 : 0),
          minHeight: 120,
          maxHeight: Dimensions.get('screen').height * 0.8,
        }}
        keyboardShouldPersistTaps={'handled'}>
        <View style={[styles.container, {paddingBottom: insets.bottom}]}>
        {(props.payload?.title ?? '').length > 0 && (
            <View style={{padding: 16, width: '100%', borderBottomWidth: 0.5,  borderBottomColor: '#eeeeee'}}>
              <Text style={{fontSize: 16, color: 'black', fontWeight: 'bold'}}>{(props.payload?.title ?? '')}</Text>
              </View>
          )}
          {(props.payload?.actions ?? []).length > 10 && (
            <View style={styles.keywordContainer}>
              <TextInput
                value={keyword}
                onChangeText={text => setKeyword(text)}
                style={styles.keywordInput}
                underlineColorAndroid="#00000000"
                placeholder="Search for keyword"
              />
            </View>
          )}
          {validActions.map((action, index) => {
            const {text, color, image} = action;
            const buttonContainerStyle = [
              styles.buttonContainer,
              {
                backgroundColor:
                  props.payload?.currentIndex &&
                  props.payload?.currentIndex === index
                    ? '#F4F6F8'
                    : 'white',
              },
            ];

            return (
              <TouchableOpacity
                key={text}
                onPress={async () => {
                  await SheetManager.hide('action-sheets');
                  if (props.payload?.onPress) {
                    const finalIndex = (props.payload?.actions ?? []).indexOf(
                      action,
                    );
                    setTimeout(() => {
                        props.payload?.onPress(finalIndex);
                    }, 500);
                  }
                }}
                style={buttonContainerStyle}>
                {image && (
                  <Image
                    source={image}
                    style={styles.icon}
                    contentFit="contain"
                  />
                )}
                <Text style={[styles.text, color ? {color} : {}]}>{text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ActionSheet>
  );
}

export default ActionSheets;
