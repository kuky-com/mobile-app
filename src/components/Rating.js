import colors from "@/utils/colors";
import { FontAwesome } from "@expo/vector-icons";
import StarRating, { StarRatingDisplay } from "react-native-star-rating-widget";

const StarIcon = ({ type, ...props }) => {
  if (type === "empty") {
    return <FontAwesome name="star-o" {...props} />;
  }

  if (type === "half") {
    return <FontAwesome name="star-half-o" {...props} />;
  }

  return <FontAwesome name="star" {...props} />;
};

export const Rating = ({ disabled, size = 22, ...props }) => {
  if (disabled) {
    return (
      <StarRatingDisplay
        starStyle={{ marginHorizontal: 1 }}
        starSize={size}
        color={colors.primary}
        enableHalfStar={true}
        StarIconComponent={StarIcon}
        {...props}
      />
    );
  }
  return (
    <StarRating
      starSize={size}
      color={colors.primary}
      enableHalfStar={true}
      StarIconComponent={StarIcon}
      {...props}
    />
  );
};
