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
  const halfMonths = ['First Half (1st-15th)', 'Second Half (16th-31st)'];

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedHalf, setSelectedHalf] = useState(null);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setSelectedMonth(null);
    setSelectedHalf(null);
  };

  const handleMonthSelect = (monthIndex) => {
    const isFuture = selectedYear === currentYear && monthIndex > currentMonth;

    if (!isFuture) {
      setSelectedMonth(monthIndex);
      setSelectedHalf(null);
    }
  };

  const handleHalfSelect = (half) => {
    setSelectedHalf(half);
    if (selectedMonth !== null) {
      onSelect({ 
        year: selectedYear, 
        month: selectedMonth + 1,
        half: half === 'First Half (1st-15th)' ? 'first' : 'second'
      });
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
              <TouchableOpacity 
                disabled={item > currentYear} 
                onPress={() => handleYearSelect(item)} 
                style={{ 
                  paddingVertical: 10, 
                  borderRadius: 3, 
                  backgroundColor: selectedYear === item ? '#5644AC' : 'transparent', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
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
                  style={{ 
                    paddingVertical: 10, 
                    borderRadius: 3, 
                    backgroundColor: selectedMonth === index ? '#5644AC' : 'transparent', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                  <Text style={[
                    styles.itemText, 
                    isDisabled && styles.disabledText,
                    selectedMonth === index && { color: 'white' }
                  ]}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {selectedMonth !== null && (
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: 13, color: '#725ED4' }}>Select Half</Text>
            <FlatList
              data={halfMonths}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => handleHalfSelect(item)}
                  style={{ 
                    paddingVertical: 10, 
                    borderRadius: 3, 
                    backgroundColor: selectedHalf === item ? '#5644AC' : 'transparent', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                  <Text style={[styles.itemText, selectedHalf === item && { color: 'white' }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
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
