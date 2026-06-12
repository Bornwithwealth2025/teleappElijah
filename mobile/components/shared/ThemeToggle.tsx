import { Moon, Sun } from 'lucide-react-native';

import { IconButton } from '@/components/ui/IconButton';
import { useAppTheme } from '@/hooks/use-app-themes';

export function ThemeToggle() {
  const { isDark, colors, toggleMode } = useAppTheme();

  return (
    <IconButton
      onPress={toggleMode}
      variant="soft"
      icon={
        isDark ? (
          <Sun color={colors.primary} size={19} />
        ) : (
          <Moon color={colors.primary} size={19} />
        )
      }
    />
  );
}