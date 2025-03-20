import { View, Animated, StyleSheet } from "react-native";
import Text from "./Text";
import colors from "../utils/colors";

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: "#000",
        width: "100%",
        position: "absolute",
        bottom: 50,
        alignItems: "center",
    },
    subtitle: {
        fontSize: 20,
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
    },
    highlightedText: {
        fontWeight: "bold",
    },
    defaultText: {
        color: "#fff",
    },
});

const SubtitleDisplay = ({ subtitles = '', highlightWords = [] }) => {
    console.log({ subtitles })
    const words = subtitles.split(' ')

    const isHighlighted = (word) => {
        const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
        return highlightWords.some(highlight =>
            highlight.toLowerCase() === cleanWord
        );
    };

    return (
        <View style={{
            backgroundColor: "rgba(205, 184, 226, 0.75)",
            paddingVertical: 8,
            paddingHorizontal: 8,
            borderRadius: 3
        }}>
            <Text style={{ fontSize: 18, lineHeight: 24 }}>
                {words.map((word, index) => (
                    <Text
                        key={index}
                        style={{
                            color: isHighlighted(word) ? '#E8FF58' : 'black',
                            fontWeight: isHighlighted(word) ? 'bold' : '500',
                            fontSize: isHighlighted(word) ? 16 : 14,
                            // textDecorationLine: isHighlighted(word) ? 'underline' : 'none',
                        }}
                    >
                        {word}{' '}
                    </Text>
                ))}
            </Text>
        </View>

    );
};

export default SubtitleDisplay;