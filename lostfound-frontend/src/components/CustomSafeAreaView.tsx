import React from "react";
import { View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaViewProps {
  children: React.ReactNode;
  edges?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  };
  style?: ViewStyle;
}

const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  edges = { top: true, bottom: true, left: true, right: true },
  style,
}) => {
  const insets = useSafeAreaInsets();

  const paddingStyle: ViewStyle = {
    paddingTop: edges.top ? insets.top : 0,
    paddingBottom: edges.bottom ? insets.bottom : 0,
    paddingLeft: edges.left ? insets.left : 0,
    paddingRight: edges.right ? insets.right : 0,
  };

  return <View style={[paddingStyle, style]}>{children}</View>;
};

export default SafeAreaView;

