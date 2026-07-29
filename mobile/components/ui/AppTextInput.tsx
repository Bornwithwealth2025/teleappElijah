// components/ui/AppTextInput.tsx
import React, { useRef, useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Radius, Spacing, verticalScale } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import { AppText } from "./AppText";

type AppTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
};

export function AppTextInput({
  label,
  error,
  leftSlot,
  rightSlot,
  containerStyle,
  style,
  placeholderTextColor,
  editable = true,
  multiline = false,
  onFocus,
  onBlur,
  ...props
}: AppTextInputProps) {
  const { colors } = useAppTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const focusInput = () => {
    if (editable) {
      inputRef.current?.focus();
    }
  };

  return (
    <View style={[styles.root, containerStyle]}>
      {label ? (
        <AppText variant="caption" tone="muted" style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <Pressable
        onPress={focusInput}
        accessible={false}
        style={[
          styles.shell,
          multiline && styles.multilineShell,
          {
            backgroundColor: editable ? colors.card : colors.surface,
            borderColor: error
              ? colors.danger
              : focused
                ? colors.primary
                : colors.border,
            opacity: editable ? 1 : 0.65,
          },
          focused && { shadowColor: colors.focusRing, ...styles.focused },
        ]}
      >
        {leftSlot ? <View style={styles.leftSlot}>{leftSlot}</View> : null}

        <TextInput
          ref={inputRef}
          {...props}
          editable={editable}
          multiline={multiline}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          placeholderTextColor={placeholderTextColor ?? colors.textSoft}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            { color: colors.text },
            style,
          ]}
        />

        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </Pressable>

      {error ? (
        <AppText variant="caption" tone="danger" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.two,
  },
  label: {
    fontWeight: "600",
  },
  shell: {
    minHeight: verticalScale(54),
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },
  multilineShell: {
    minHeight: verticalScale(116),
    alignItems: "flex-start",
    paddingVertical: Spacing.three,
  },
  focused: {
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 1,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: verticalScale(52),
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  multilineInput: {
    minHeight: verticalScale(90),
    paddingTop: Spacing.one,
    textAlignVertical: "top",
  },
  leftSlot: {
    minWidth: 20,
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.three,
  },
  rightSlot: {
    minWidth: 20,
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.three,
  },
  error: {
    marginTop: -Spacing.one,
  },
});