import { Image } from 'expo-image';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import ActionSheet, {
  useScrollHandlers,
  SheetManager,
} from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from '../Text';
import TextInput from '../TextInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1
  },
  buttonContainer: {
    width: '100%',
    paddingVertical: 16,
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'center',
    borderBottomColor: '#eeeeee',
    borderBottomWidth: 0.5
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
    <ActionSheet id={props.sheetId} ref={actionSheetRef}>
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
        <ScrollView
          {...scrollHandlers}
          style={{
            minHeight: 120,
            maxHeight: Dimensions.get('screen').height * 0.75,
          }}
          contentContainerStyle={{justifyContent: 'flex-end', width: '100%'}}
          keyboardShouldPersistTaps={'handled'}>
          <View style={[styles.container, { paddingHorizontal: Platform.isPad ? '20%' : 16 }]}>
            {(props.payload?.title ?? '').length > 0 && (
              <View style={{ padding: 16, width: '100%', borderBottomWidth: 0.5, borderBottomColor: '#eeeeee' }}>
                <Text style={{ fontSize: 16, color: 'black', fontWeight: 'bold' }}>{(props.payload?.title ?? '')}</Text>
              </View>
            )}
            {validActions.map((action, index) => {
              const { text, color, image } = action;
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
                  <Text style={[styles.text, color ? { color } : {}]}>{text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
    </ActionSheet>
  );
}

export default ActionSheets;
