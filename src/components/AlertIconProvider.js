import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import Text from './Text';
import { Image } from 'expo-image';
import images from '@/utils/images';

const AlertContext = createContext();

export const useAlertWithIcon = () => {
    return useContext(AlertContext);
};

const CustomAlert = ({ visible, title, icon, message1, message2, onClose, buttons = [], cancelButtons }) => {
    const onPress = (button) => {
        onClose()
        if (button && button.onPress) {
            button.onPress()
        }
    }


    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <View style={{ width: '100%', alignItems: 'center', marginTop: 15 }}>
                        {icon && <Image source={icon} style={{ width: 48, height: 48 }} contentFit='contain' />}
                        <Text style={styles.alertTitle}>{title}</Text>
                    </View>
                    {
                        message1 && message1.length > 0 &&
                        <Text style={styles.alertMessage1}>{message1}</Text>
                    }
                    {
                        message2 && message2.length > 0 &&
                        <Text style={styles.alertMessage2}>{message2}</Text>
                    }
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
                    {/* <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Image source={images.close_icon} style={styles.closeIcon} contentFit='contain' />
                    </TouchableOpacity> */}
                </View>
            </View>
        </Modal>
    )
}

export const AlertIconProvider = ({ children }) => {
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ icon: null, title: '', message1: '', message2: '', buttons: [], cancelButtons: [], onClose: null });

    const showAlert = useCallback((icon, title, message1, message2, buttons = [], cancelButtons = [], onClose) => {
        setAlertConfig({ icon, title, message1, message2, buttons, cancelButtons, onClose });
        setAlertVisible(true);
    }, []);

    const closeAlert = useCallback(() => {
        setAlertVisible(false);
        if (alertConfig.onClose) {
            alertConfig.onClose()
        }
    }, [alertConfig]);

    return (
        <AlertContext.Provider value={showAlert}>
            {children}
            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                icon={alertConfig.icon}
                message1={alertConfig.message1}
                message2={alertConfig.message2}
                cancelButtons={alertConfig.cancelButtons}
                onClose={closeAlert}
                buttons={alertConfig.buttons}
            />
        </AlertContext.Provider>
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
        paddingVertical: 32,
        backgroundColor: '#725ED4',
        borderRadius: 10,
        alignItems: 'center',
        gap: 10
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 3,
        color: 'white',
        lineHeight: 30,
        textAlign: 'center'
    },
    alertMessage1: {
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
        color: 'white',
        lineHeight: 20,
        textAlignVertical: 'center'
    },
    alertMessage2: {
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
});
