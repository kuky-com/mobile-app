import { forwardRef, useImperativeHandle, useRef } from 'react';
import { TextInput as RNTextInput } from 'react-native';

const TextInput = forwardRef(({ style, ...props }, ref) => {
    const localInputRef = useRef();

    useImperativeHandle(ref, () => ({
        focus: () => {
            localInputRef.current.focus();
        },
        clear: () => {
            localInputRef.current.clear();
        },
        setValue: (value) => {
            localInputRef.current.setNativeProps({ text: value });
        }
    }));

    let fontFamily = 'Comfortaa-Regular';
    if (style && style.fontWeight) {
        switch (style.fontWeight) {
            case '300': {
                fontFamily = 'Comfortaa-Light';
                break;
            }
            case '400': {
                fontFamily = 'Comfortaa-Regular';
                break;
            }
            case '500': {
                fontFamily = 'Comfortaa-Medium';
                break;
            }
            case '600': {
                fontFamily = 'Comfortaa-SemiBold';
                break;
            }
            case '700':
            case 'bold': {
                fontFamily = 'Comfortaa-Bold';
                break;
            }
            default: {
                fontFamily = 'Comfortaa-Regular';
            }
        }
    }

    return <RNTextInput
        ref={localInputRef}
        style={[{ fontFamily }, style]} {...props}
        allowFontScaling={false}
    />;
});

export default TextInput;
