import { TextInput as RNTextInput } from 'react-native';

const TextInput = ({ style, ...props }) => {
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

    return <RNTextInput style={[{ fontFamily }, style]} {...props} />;
};

export default TextInput;
