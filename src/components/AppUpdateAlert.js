import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Text from './Text';
import { Image } from 'expo-image';
import images from '@/utils/images';
import RenderHtml from 'react-native-render-html'

const AppUpdateAlertContext = createContext();

export const useAppUpdateAlert = () => {
    return useContext(AppUpdateAlertContext);
};

const CustomAlert = ({ visible, title, message, onClose, buttons = [], cancelButtons = [], canClose = true }) => {
    const onPress = (button) => {
        if(canClose) onClose()
        if (button && button.onPress) {
            button.onPress()
        }
    }


    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <Text style={styles.alertTitle}>{title}</Text>
                    <ScrollView style={{ maxHeight: Dimensions.get('screen').height * 0.5, width: '100%' }} showsVerticalScrollIndicator={false}>
                        <RenderHtml
                            source={{ html: message }}
                        />
                    </ScrollView>
                    {
                        buttons.map((button, index) => {
                            return (
                                <TouchableOpacity key={`${button.text}-${index}`} onPress={() => onPress(button)} style={styles.button}>
                                    <Text style={styles.buttonText}>{button?.text ?? 'Ok'}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                    {
                        cancelButtons.map((button, index) => {
                            return (
                                <TouchableOpacity key={`${button.text}-${index}`} onPress={() => onPress(button)} style={styles.cancelButton}>
                                    <Text style={styles.cancelButtonText}>{button?.text ?? 'Cancel'}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                    {canClose && <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Image source={images.close_icon} style={styles.closeIcon} contentFit='contain' />
                    </TouchableOpacity>
                    }
                </View>
            </View>
        </Modal>
    )
}

export const AppUpdateAlertProvider = ({ children }) => {
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '', is_required: false, buttons: [], cancelButtons: [] });

    const showUpdateAlert = useCallback((title, message, is_required, buttons = [], cancelButtons) => {
        setAlertConfig({ title, message, is_required, buttons, cancelButtons });
        setAlertVisible(true);
    }, []);

    const closeAlert = useCallback(() => {
        setAlertVisible(false);
    }, [alertConfig]);

    return (
        <AppUpdateAlertContext.Provider value={showUpdateAlert}>
            {children}
            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={closeAlert}
                buttons={alertConfig.buttons}
                cancelButtons={alertConfig.cancelButtons}
                canClose={!alertConfig.is_required}
            />
        </AppUpdateAlertContext.Provider>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: 320,
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#725ED4',
        borderRadius: 10,
        alignItems: 'center',
        gap: 10
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#E8FF58',
        lineHeight: 30,
        textAlign: 'center'
    },
    alertMessage: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: 'white',
        lineHeight: 24,
        textAlignVertical: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        padding: 10,
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#333333',
        height: 50, borderRadius: 25,
        justifyContent: 'center'
    },
    cancelButton: {
        padding: 10,
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center'
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    closeButton: {
        position: 'absolute',
        top: 0, right: 0,
        width: 25, height: 25, alignItems: 'center',
        justifyContent: 'center'
    },
    closeIcon: {
        width: 15, height: 15
    }
});
