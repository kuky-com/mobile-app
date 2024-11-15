import { View } from "react-native";
import { twMerge } from "tailwind-merge";

export const Pill = ({ className, ...props }) => {
  return <View className={twMerge("rounded-[16px] bg-lemon px-4 py-0.5", className)} {...props} />;
};
