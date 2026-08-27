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

import { cn } from "@/lib/cn";
import {
  Radius,
  Spacing,
  verticalScale,
} from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

import { AppText } from "./AppText";

type AppTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
  className?: string;
  inputClassName?: string;
};

export function AppTextInput({
  label,
  error,
  leftSlot,
  rightSlot,
  containerStyle,
  style,
  className,
  inputClassName,
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

  function focusInput() {
    if (editable) {
      inputRef.current?.focus();
    }
  }

  return (
    <View className={cn("gap-2", className)} style={containerStyle}>
      {label ? (
        <AppText variant="caption" tone="muted">
          {label}
        </AppText>
      ) : null}

      <Pressable
        onPress={focusInput}
        accessible={false}
        className={cn(
          "flex-row items-center border rounded-ui px-4",
          multiline && "items-start py-3",
          !editable && "opacity-65",
        )}
        style={[
          {
            minHeight: multiline
              ? verticalScale(116)
              : verticalScale(54),
            backgroundColor: editable ? colors.card : colors.surface,
            borderColor: error
              ? colors.danger
              : focused
                ? colors.primary
                : colors.border,
          },
          focused && {
            shadowColor: colors.focusRing,
            ...styles.focused,
          },
        ]}
      >
        {leftSlot ? (
          <View className="items-center justify-center mr-3">
            {leftSlot}
          </View>
        ) : null}

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
          className={cn(
            "flex-1 min-w-0 text-base leading-[22px] py-0",
            multiline && "min-h-[90px] pt-1 text-top",
            inputClassName,
          )}
          style={[
            {
              minHeight: multiline
                ? verticalScale(90)
                : verticalScale(52),
              color: colors.text,
            },
            style,
          ]}
        />

        {rightSlot ? (
          <View className="items-center justify-center ml-3">
            {rightSlot}
          </View>
        ) : null}
      </Pressable>

      {error ? (
        <AppText
          variant="caption"
          tone="danger"
          style={{ marginTop: -Spacing.one }}
        >
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  focused: {
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 1,
  },
});