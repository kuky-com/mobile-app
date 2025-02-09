import React, { useRef, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import ActionSheet, {
  useScrollHandlers,
  SheetManager,
} from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from '@/components/Text';
import { getUnit } from '../../utils/utils';
import { FontAwesome6 } from '@expo/vector-icons';
import ButtonWithLoading from '../ButtonWithLoading';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    paddingVertical: getUnit(16),
    width: '100%',
  },
  contentContainer: {
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    padding: getUnit(16),
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },
  text: {
    width: '100%',
    textAlign: 'left',
    color: '#212B36',
    fontSize: getUnit(16),
    fontWeight: '500',
    lineHeight: getUnit(25),
    flex: 1,
    paddingHorizontal: getUnit(8),
  },
  checkIcon: {
    width: getUnit(20),
    height: getUnit(20),
  },
  colorBox: {
    height: getUnit(30),
    width: getUnit(40),
    borderRadius: 5,
  },
  confirmButton: {
    marginBottom: getUnit(8),
    width: '100%',
    paddingHorizontal: getUnit(16),
  },
});

function SelectionSheet(
  props,
) {
  const insets = useSafeAreaInsets();
  const actionSheetRef = useRef(null);
  const scrollHandlers = useScrollHandlers({ refreshControlBoundary: 0 });
  const [selectedItems, setSelectedList] = useState(props.payload?.selectedList ?? []);

  const onConfirm = async () => {
    await SheetManager.hide('selection-sheets');
    if (props.payload?.onSelected) props.payload?.onSelected(selectedItems);
  };

  const onSelect = (id) => {
    const index = selectedItems.indexOf(id);
    if (index >= 0) {
      setSelectedList((old) => [...old.slice(0, index), ...old.slice(index + 1)]);
    } else {
      setSelectedList((old) => [...old, id]);
    }
  };

  return (
    <ActionSheet headerAlwaysVisible id={props.sheetId} ref={actionSheetRef}>
      <View style={styles.container}>
        <ScrollView
          {...scrollHandlers}
          style={{ maxHeight: Dimensions.get('screen').height * 0.7 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>
            {(props.payload?.actions ?? []).map((action) => {
              const { id, text, color } = action;
              const isSelected = selectedItems.includes(id);
              const style = [
                styles.buttonContainer,
                { backgroundColor: isSelected ? '#F4F6F8' : 'white' },
              ];
              return (
                <Pressable key={text} onPress={() => onSelect(id)} style={style}>
                  <View style={{width: 20, height: 20, alignItems: 'center', justifyContent: 'center'}}>
                  {isSelected && <FontAwesome6 name='check' size={18} color={colors.mainColor}/> }
                  </View>
                  <Text style={styles.text}>{text}</Text>
                  {color && <View style={[styles.colorBox, { backgroundColor: color }]} />}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
        <View style={styles.confirmButton}>
          <ButtonWithLoading text='Confirm' onPress={onConfirm} />
        </View>
      </View>
    </ActionSheet>
  );
}

export default SelectionSheet;
