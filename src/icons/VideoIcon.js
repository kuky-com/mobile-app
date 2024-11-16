import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const VideoIcon = (props) => {
  return (
    <Svg
      width={27}
      height={20}
      viewBox="0 0 27 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M24.35 6.165l-3.26 1.63a.757.757 0 01-1.096-.677V5.3a3.786 3.786 0 00-3.787-3.786H5.302A3.786 3.786 0 001.516 5.3v9.088a3.786 3.786 0 003.786 3.786h10.905a3.786 3.786 0 003.787-3.786V12.57a.756.756 0 011.096-.677l3.26 1.63a.757.757 0 001.096-.677V6.842a.757.757 0 00-1.096-.677zm-8.446-.108h-3.029a.757.757 0 010-1.514h3.03a.757.757 0 110 1.514z"
        fill="#fff"
      />
      <Path
        d="M25.883 4.91a2.272 2.272 0 00-2.211-.1l-2.165 1.083v-.592A5.3 5.3 0 0016.207 0H5.3A5.301 5.301 0 000 5.301v9.088a5.301 5.301 0 005.301 5.3h10.905a5.301 5.301 0 005.301-5.3v-.593l2.165 1.083a2.272 2.272 0 003.288-2.032V6.843a2.272 2.272 0 00-1.077-1.933zm-.438 7.937a.757.757 0 01-1.096.677l-3.26-1.63a.756.756 0 00-1.096.677v1.818a3.786 3.786 0 01-3.787 3.786H5.301a3.786 3.786 0 01-3.786-3.786V5.3A3.786 3.786 0 015.3 1.515h10.905A3.787 3.787 0 0119.993 5.3V7.12a.757.757 0 001.096.677l3.26-1.63a.758.758 0 011.096.677v6.004z"
        fill="#000"
      />
      <Path d="M15.906 4.543h-3.03a.758.758 0 000 1.515h3.03a.757.757 0 100-1.515z" fill="#000" />
    </Svg>
  );
};
