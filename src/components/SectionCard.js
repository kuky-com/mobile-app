import { View } from "react-native";
import { twMerge } from "tailwind-merge";

export const SectionCard = ({ children, className, style }) => {
  return (
    <View
      className={twMerge("bg-purple3 border border-purple99 py-4 px-6", className)}
      style={[
        {
          borderRadius: 20,
          flexWrap: "wrap",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
