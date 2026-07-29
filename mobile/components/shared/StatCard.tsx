import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
} from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";

type StatCardProps = {
  value: string | number;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 18,
        bounciness: 6,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 18,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, scale]);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity,
        transform: [
          { translateY },
          { scale },
        ],
      }}
    >
      <AppCard elevated style={styles.card}>
        <AppText variant="metric" numberOfLines={1}>
          {value}
        </AppText>

        <AppText
          variant="caption"
          tone="muted"
          numberOfLines={2}
          style={styles.label}
        >
          {label}
        </AppText>
      </AppCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 96,
    justifyContent: "center",
    paddingVertical: Spacing.four,
  },

  label: {
    marginTop: Spacing.one,
  },
});