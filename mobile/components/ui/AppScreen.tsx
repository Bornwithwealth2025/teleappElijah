import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Layout } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type AppScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  safeAreaStyle?: StyleProp<ViewStyle>;
} & Pick<ScrollViewProps, "keyboardShouldPersistTaps">;

export function AppScreen({
  children,
  scroll = true,
  contentStyle,
  safeAreaStyle,
  keyboardShouldPersistTaps = "handled",
}: AppScreenProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const topInset =
    Platform.OS === "android" ? StatusBar.currentHeight ?? insets.top : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, safeAreaStyle]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            contentContainerStyle={[
              styles.content,
              {
                paddingTop: topInset + Layout.screenTopPadding,
                paddingBottom: insets.bottom + Layout.screenBottomPadding,
              },
              contentStyle,
            ]}
          >
            {children}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.content,
              styles.staticContent,
              {
                paddingTop: topInset + Layout.screenTopPadding,
                paddingBottom: insets.bottom + Layout.screenBottomPadding,
              },
              contentStyle,
            ]}
          >
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
  },
  keyboard: {
    flex: 1,
    width: "100%",
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  content: {
    width: "100%",
    paddingHorizontal: Layout.screenPadding,
    gap: Layout.compactGap,
  },
  staticContent: {
    flex: 1,
  },
});