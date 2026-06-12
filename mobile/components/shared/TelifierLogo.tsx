import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-themes';

type TelifierLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

const logoSize = {
  sm: {
    width: 112,
    height: 32,
  },
  md: {
    width: 148,
    height: 44,
  },
  lg: {
    width: 172,
    height: 52,
  },
};

export function TelifierLogo({ size = 'md', style }: TelifierLogoProps) {
  const { isDark } = useAppTheme();

  return (
    <View style={[styles.root, logoSize[size], style]}>
      <Image
        source={require('@/assets/images/telefya.png')}
        style={[styles.image, isDark && styles.darkImage]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'visible',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  darkImage: {
    opacity: 0.98,
  },
});