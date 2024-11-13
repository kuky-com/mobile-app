import { Text as RNText } from 'react-native';

const Text = ({ style, ...props }) => {
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

    return <RNText style={[{ fontFamily, textAlignVertical: 'center' }, style]} {...props} />;
};

export default Text;
