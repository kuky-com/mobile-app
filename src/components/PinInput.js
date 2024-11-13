import React, { useState, useRef } from "react";
import { View, StyleSheet } from "react-native";
import TextInput from "./TextInput";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textInput: {
    height: 79,
    width: 54,
    borderWidth: 2,
    borderColor: '#726E70',
    borderRadius: 15,
    margin: 2,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "500",
    color: "#000000",
  },
});

const getOTPTextChunks = (inputCount, inputCellLength, text) => {
  let otpText = text.match(new RegExp(".{1," + inputCellLength + "}", "g")) || [];
  otpText = otpText.slice(0, inputCount);
  return otpText;
};

const OTPTextView = ({
  defaultValue = "",
  inputCount = 4,
  tintColor = "#726E70",
  offTintColor = "#DCDCDC",
  inputCellLength = 1,
  containerStyle = {},
  textInputStyle = {},
  handleTextChange = () => {},
  keyboardType = "numeric",
  disableAutoFocus = false,
  ...textInputProps
}) => {
  const [focusedInput, setFocusedInput] = useState(0);
  const [otpText, setOtpText] = useState(getOTPTextChunks(inputCount, inputCellLength, defaultValue));
  const inputs = useRef([]);

  const basicValidation = (text) => {
    const validText = /^[0-9a-zA-Z]+$/;
    return text.match(validText);
  };

  const onTextChange = (text, i) => {
    if (text && !basicValidation(text)) {
      return;
    }

    const updatedOtpText = [...otpText];
    updatedOtpText[i] = text;

    setOtpText(updatedOtpText);
    handleTextChange(updatedOtpText.join(""));

    if (text.length === inputCellLength && i !== inputCount - 1) {
      inputs.current[i + 1].focus();
    }
  };

  const onInputFocus = (i) => {
    const prevIndex = i - 1;
    if (prevIndex > -1 && !otpText[prevIndex] && !otpText.join("")) {
      inputs.current[prevIndex].focus();
      return;
    }
    setFocusedInput(i);
  };

  const onKeyPress = (e, i) => {
    const val = otpText[i] || "";
    if ("0123456789".includes(e.nativeEvent.key) && i !== inputCount - 1 && val.length === inputCellLength) {
      onTextChange(e.nativeEvent.key, i + 1);
    }
    if (e.nativeEvent.key === "Backspace" && i !== 0) {
      inputs.current[i - 1].focus();
    }
  };

  const focus = () => {
    if (inputs.current[0]) {
      inputs.current[0].focus();
    }
  };

  const clear = () => {
    setOtpText(Array(inputCount).fill(""));
    focus();
    handleTextChange("");
  };

  const setNewValue = (value) => {
    setOtpText(value.split(''));
    handleTextChange(value);
  };

  const setValue = (value) => {
    const updatedFocusInput = value.length - 1;
    setOtpText(getOTPTextChunks(inputCount, inputCellLength, value));
    if (inputs.current[updatedFocusInput]) {
      inputs.current[updatedFocusInput].focus();
    }
    handleTextChange(value);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {Array(inputCount).fill('').map((_, i) => {
        const inputStyle = [
          styles.textInput,
          textInputStyle,
          { borderColor: offTintColor },
        ];
        if (focusedInput === i) {
          inputStyle.push({ borderColor: tintColor });
        }

        return (
          <TextInput
            ref={(input) => (inputs.current[i] = input)}
            key={i}
            autoCorrect={false}
            keyboardType={keyboardType}
            autoFocus={i === 0 && !disableAutoFocus}
            value={otpText[i] || ""}
            style={inputStyle}
            maxLength={inputCellLength}
            onFocus={() => onInputFocus(i)}
            onChangeText={(text) => onTextChange(text, i)}
            onKeyPress={(e) => onKeyPress(e, i)}
            multiline={false}
            {...textInputProps}
          />
        );
      })}
    </View>
  );
};

export default OTPTextView;
