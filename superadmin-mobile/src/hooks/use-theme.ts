/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { theme as appTheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  
  // Right now we only have one theme exported from constants/theme
  // In the future this could return appTheme.colors.light or appTheme.colors.dark
  return appTheme.colors;
}
