import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Layout } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';

type AppScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  safeAreaStyle?: StyleProp<ViewStyle>;
} & Pick<ScrollViewProps, 'keyboardShouldPersistTaps'>;

export function AppScreen({
  children,
  scroll = true,
  contentStyle,
  safeAreaStyle,
  keyboardShouldPersistTaps = 'handled',
}: AppScreenProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.safeArea, safeAreaStyle]}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {scroll ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps={keyboardShouldPersistTaps}
              contentContainerStyle={[styles.content, contentStyle]}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.content, styles.staticContent, contentStyle]}>
              {children}
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  keyboard: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Layout.screenTopPadding,
    paddingBottom: Layout.screenBottomPadding,
    gap: Layout.compactGap,
  },
  staticContent: {
    flex: 1,
  },
});