// MonthYearPickerSheet.js
import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import dayjs from 'dayjs';
import colors from '../../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const MonthYearPickerSheet = React.forwardRef(({ onSelect }, ref) => {
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month();
  const years = [2024, 2025, 2026, 2027, 2028]
  const months = dayjs.months();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setSelectedMonth(null);
  };

  const handleMonthSelect = (monthIndex) => {
    const isFuture = selectedYear === currentYear && monthIndex > currentMonth;

    console.log({monthIndex, isFuture})
    if (!isFuture) {
      setSelectedMonth(monthIndex);
      onSelect({ year: selectedYear, month: monthIndex + 1 });
      ref.current?.hide();
    }
  };

  return (
    <ActionSheet ref={ref}>
      <View style={styles.container}>
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: 13, color: '#725ED4' }}>Select Year</Text>
          <FlatList
            data={years}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity disabled={item > currentYear} onPress={() => handleYearSelect(item)} style={{ paddingVertical: 10, borderRadius: 3, backgroundColor: selectedYear === item ? '#5644AC' : 'transparent', alignItems: ' center', justifyContent: 'center' }}>
                <Text style={[styles.itemText, item > currentYear && styles.disabledText, selectedYear === item && { color: 'white' }]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={{ flex: 1, gap: 8 }}>
          <Text style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: 13, color: '#725ED4' }}>Select Month</Text>
          <FlatList
            data={months}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              const isDisabled = selectedYear === currentYear && index > currentMonth;
              return (

                <TouchableOpacity 
                  onPress={() => handleMonthSelect(index)}
                  disabled={isDisabled} 
                  style={{ paddingVertical: 10, borderRadius: 3, backgroundColor: 'transparent', alignItems: ' center', justifyContent: 'center' }}>
                  <Text style={[styles.itemText, isDisabled && styles.disabledText]}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </ActionSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    gap: 20,
  },
  itemText: {
    fontSize: 18,
    width: '100%',
    textAlign: 'center'
  },
  disabledText: {
    color: 'gray',
  },
});

export default MonthYearPickerSheet;
