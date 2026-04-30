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
 * Convert any color format (hex, named, rgb, rgba) to RGB object.
 * Used to dynamically create a primary palette from the organization's primary_color.
 */
const colorToRgb = (color) => {
  // Handle hex colors
  const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  }

  // Handle rgb/rgba colors
  const rgbMatch = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // Handle named colors by creating a temporary element
  if (typeof document !== 'undefined') {
    const tempElem = document.createElement('div');
    tempElem.style.color = color;
    document.body.appendChild(tempElem);
    const computedColor = window.getComputedStyle(tempElem).color;
    document.body.removeChild(tempElem);
    
    const computedRgbMatch = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(computedColor);
    if (computedRgbMatch) {
      return {
        r: parseInt(computedRgbMatch[1], 10),
        g: parseInt(computedRgbMatch[2], 10),
        b: parseInt(computedRgbMatch[3], 10),
      };
    }
  }

  return null;
};

const generatePrimaryPalette = (primaryColor) => {
  if (!primaryColor) return null;

  const rgb = colorToRgb(primaryColor);
  if (!rgb) return null;

  const isDark = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 < 128;

  // Convert to hex for consistency
  const toHex = (value) => {
    const hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  const hexColor = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;

  return {
    main: hexColor,
    light: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    dark: hexColor,
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