import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
  type ReactNode,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  rightSlot?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({
  title,
  actionLabel,
  rightSlot,
  style,
}: SectionHeaderProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 18,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.root,
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <AppText variant="subtitle" numberOfLines={1}>
        {title}
      </AppText>

      {rightSlot ? (
        rightSlot
      ) : actionLabel ? (
        <AppText variant="bodyStrong" tone="primary" numberOfLines={1}>
          {actionLabel}
        </AppText>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.three,
  },
});