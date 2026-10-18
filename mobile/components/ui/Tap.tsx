import React from "react";
import {
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type TapProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export function Tap({
  label,
  onPress,
  disabled,
  style,
  children,
}: TapProps) {
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={style}
    >
      <View style={{ opacity: pressed || disabled ? 0.76 : 1 }}>
        {children}
      </View>
    </Pressable>
  );
}