import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { Radius, Spacing, verticalScale } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';
import { AppText } from './AppText';

type AppTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
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
  ...props
}: AppTextInputProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.root, containerStyle]}>
      {label ? (
        <AppText variant="caption" tone="muted" style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.inputShell,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        {leftSlot ? <View style={styles.leftSlot}>{leftSlot}</View> : null}

        <TextInput
          {...props}
          placeholderTextColor={placeholderTextColor ?? colors.textSoft}
          style={[
            styles.input,
            {
              color: colors.text,
            },
            style,
          ]}
        />

        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>

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
    fontWeight: '600',
  },
  inputShell: {
    minHeight: verticalScale(50),
    borderRadius: Radius.medium,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  input: {
    flex: 1,
    minHeight: verticalScale(48),
    fontSize: 15,
    paddingVertical: 0,
  },
  leftSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two,
  },
  rightSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.two,
  },
  error: {
    marginTop: -Spacing.one,
  },
});