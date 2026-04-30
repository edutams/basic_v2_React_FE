import _ from 'lodash';
import { createTheme } from '@mui/material/styles';
import { useContext, useEffect, useMemo } from 'react';
import components from './Components';
import typography from './Typography';
import { shadows, darkshadows } from './Shadows';
import { DarkThemeColors } from './DarkThemeColors';
import { LightThemeColors } from './LightThemeColors';
import { baseDarkTheme, baselightTheme } from './DefaultColors';
import * as locales from '@mui/material/locale';
import { CustomizerContext } from '../context/CustomizerContext';

/**
 * Generate light and dark variants from a hex color.
 * Used to dynamically create a primary palette from the organization's primary_color.
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
};

const generatePrimaryPalette = (primaryColor) => {
  const rgb = hexToRgb(primaryColor);
  if (!rgb) return null;

  const isDark = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 < 128;

  return {
    main: primaryColor,
    light: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    dark: primaryColor,
    contrastText: isDark ? '#ffffff' : '#1E293B',
  };
};

/**
 * Build a MUI theme. This is a pure function — no React hooks inside.
 * All context values must be passed explicitly via arguments.
 */
export const BuildTheme = (config = {}, primaryColor = null, activeMode = 'light', isBorderRadius = 7, isCardShadow = true) => {
  const themeOptions = LightThemeColors.find((theme) => theme.name === config.theme);
  const darkthemeOptions = DarkThemeColors.find((theme) => theme.name === config.theme);
  const defaultTheme = activeMode === 'dark' ? baseDarkTheme : baselightTheme;
  const defaultShadow = activeMode === 'dark' ? darkshadows : shadows;
  const themeSelect = activeMode === 'dark' ? darkthemeOptions : themeOptions;
  const baseMode = {
    palette: {
      mode: activeMode,
    },
    shape: {
      borderRadius: isBorderRadius,
    },
    shadows: defaultShadow,
    typography: typography,
  };

  // Build the primary override from the organization's color
  const primaryOverride = primaryColor ? generatePrimaryPalette(primaryColor) : null;
  const primaryMerge = primaryOverride ? { palette: { primary: primaryOverride } } : {};

  const theme = createTheme(
    _.merge({}, baseMode, defaultTheme, locales, themeSelect, primaryMerge, {
      direction: config.direction,
    }),
  );
  theme.components = components(theme, isCardShadow);

  return theme;
};

const ThemeSettings = () => {
  const { activeDir, activeTheme, primaryColor, activeMode, isBorderRadius, isCardShadow } = useContext(CustomizerContext);

  const theme = useMemo(
    () =>
      BuildTheme(
        {
          direction: activeDir,
          theme: activeTheme,
        },
        primaryColor,
        activeMode,
        isBorderRadius,
        isCardShadow,
      ),
    [activeDir, activeTheme, primaryColor, activeMode, isBorderRadius, isCardShadow],
  );

  useEffect(() => {
    document.dir = activeDir;
  }, [activeDir]);

  return theme;
};


export { ThemeSettings };