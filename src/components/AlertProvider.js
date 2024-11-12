import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import Text from './Text';
import { Image } from 'expo-image';
import images from '@/utils/images';

const AlertContext = createContext();

export const useAlert = () => {
  return useContext(AlertContext);
};

const CustomAlert = ({ visible, title, message, onClose, buttons = [] }) => {
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
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          {
            buttons.map((button, index) => {
              return (
                <TouchableOpacity key={`${button.text}-${index}`} onPress={() => onPress(button)} style={styles.button}>
                  <Text style={styles.buttonText}>{button?.text ?? 'Ok'}</Text>
                </TouchableOpacity>
              )
            })
          }
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Image source={images.close_icon} style={styles.closeIcon} contentFit='contain' />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export const AlertProvider = ({ children }) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', buttons: [], onClose: null });

  const showAlert = useCallback((title, message, buttons = [], onClose) => {
    setAlertConfig({ title, message, buttons, onClose });
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
        message={alertConfig.message}
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
    marginTop: 16,
    color: 'white',
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
