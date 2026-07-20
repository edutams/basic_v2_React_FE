/**
 * Premium Stat Card Color Helper
 * Softer backgrounds, richer accents, better borders.
 */

export const getStatCardColor = (
  colorProp,
  colorIndex = 0,
  isDark = false,
  theme = null
) => {
  const paletteMap = {
    primary: {
      name: 'primary',
      cardBg: '#F5F3FF',
      iconBg: theme?.palette?.primary?.main || '#6D28D9',
      iconColor: '#FFFFFF',
      accentColor: theme?.palette?.primary?.main || '#6D28D9',
      borderColor: '#DDD6FE',
      valueBg: '#EDE9FE',
    },

    success: {
      name: 'success',
      cardBg: '#F0FDF4',
      iconBg: theme?.palette?.success?.main || '#16A34A',
      iconColor: '#FFFFFF',
      accentColor: theme?.palette?.success?.main || '#16A34A',
      borderColor: '#BBF7D0',
      valueBg: '#DCFCE7',
    },

    info: {
      name: 'info',
      cardBg: '#EFF6FF',
      iconBg: theme?.palette?.info?.main || '#2563EB',
      iconColor: '#FFFFFF',
      accentColor: theme?.palette?.info?.main || '#2563EB',
      borderColor: '#BFDBFE',
      valueBg: '#DBEAFE',
    },

    warning: {
      name: 'warning',
      cardBg: '#FFFBEB',
      iconBg: theme?.palette?.warning?.main || '#D97706',
      iconColor: '#FFFFFF',
      accentColor: theme?.palette?.warning?.main || '#D97706',
      borderColor: '#FCD34D',
      valueBg: '#FEF3C7',
    },

    error: {
      name: 'error',
      cardBg: '#FEF2F2',
      iconBg: theme?.palette?.error?.main || '#DC2626',
      iconColor: '#FFFFFF',
      accentColor: theme?.palette?.error?.main || '#DC2626',
      borderColor: '#FECACA',
      valueBg: '#FEE2E2',
    },

    secondary: {
      name: 'secondary',
      cardBg: '#FAF5FF',
      iconBg: theme?.palette?.secondary?.main || '#9333EA',
      iconColor: '#FFFFFF',
      accentColor: theme?.palette?.secondary?.main || '#9333EA',
      borderColor: '#E9D5FF',
      valueBg: '#F3E8FF',
    },
  };

  const cardList = [
    paletteMap.primary,
    paletteMap.success,
    paletteMap.info,
    paletteMap.warning,
    paletteMap.error,
    paletteMap.secondary,
  ];

  let selected;

  // Custom HEX color
  if (typeof colorProp === 'string' && colorProp.startsWith('#')) {
    selected = {
      cardBg: `${colorProp}12`,
      iconBg: colorProp,
      iconColor: '#FFFFFF',
      accentColor: colorProp,
      borderColor: `${colorProp}35`,
      valueBg: `${colorProp}18`,
    };
  }
  // Theme color name
  else if (
    typeof colorProp === 'string' &&
    paletteMap[colorProp]
  ) {
    selected = paletteMap[colorProp];
  }
  // Auto rotate colors by index
  else {
    const idx =
      typeof colorIndex === 'number'
        ? colorIndex
        : typeof colorProp === 'number'
          ? colorProp
          : 0;

    selected = cardList[idx % cardList.length];
  }

  // Dark Mode
  if (isDark) {
    return {
      cardBg: 'background.paper',
      iconBg: selected.iconBg,
      iconColor: '#FFFFFF',
      accentColor: selected.iconBg,
      borderColor: 'rgba(255,255,255,0.08)',
      valueBg: 'rgba(255,255,255,0.06)',
    };
  }

  return selected;
};

export const getDynamicStatCardColors = getStatCardColor;