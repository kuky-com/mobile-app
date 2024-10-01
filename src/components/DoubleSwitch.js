import colors from '@/utils/colors';
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Text from '@/components/Text';

const DoubleSwitch = ({ tabs = [], currentTab, onChangeTab }) => {
    return (
        <View style={{flexGrow: 0}}>
            <View style={styles.container}>
                {
                    tabs.map((tab, index) => {
                        return (
                            <TouchableOpacity style={{ zIndex: currentTab === tab ? 5 : 1, height: '100%' }} key={tab} onPress={() => onChangeTab && onChangeTab(tab)}>
                                <View
                                    style={[styles.tabButton, {borderColor: currentTab === tab ? '#C276E2' : 'white'}]}>
                                    <Text style={[styles.tabText, { color: currentTab === tab ? '#9D49B2' : colors.darkGrey }]}>{tab}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                }
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
        borderRadius: 20,
        gap: -20,
        backgroundColor: 'white',
        height: 40,
    },
    tabButton: {
        paddingHorizontal: 28,
        alignItems: 'center',
        borderRadius: 20,
        justifyContent: 'center',
        height: '100%',
        borderWidth: 2,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6F6F6F',
    },
});

export default DoubleSwitch;
