/**
 * Premium Stat Card Color Helper
 * Rich dual-tone gradients, vibrant accents, and glowing badges.
 */

export const getStatCardColor = (
  colorProp,
  colorIndex = 0,
  isDark = false,
  theme = null
) => {
  const primaryMain = theme?.palette?.primary?.main || '#2563EB';
  let primaryLight = theme?.palette?.primary?.light;

  if (!primaryLight || primaryLight === '#ffffff' || primaryLight === '#fff') {
    primaryLight = `${primaryMain}18`;
  }

  const paletteMap = {
    primary: {
      name: 'primary',
      cardBg: `linear-gradient(135deg, ${primaryLight} 0%, ${primaryMain}22 100%)`,
      iconBg: primaryMain,
      iconGlow: `${primaryMain}50`,
      iconColor: '#FFFFFF',
      accentColor: primaryMain,
      borderColor: `${primaryMain}35`,
    },

    success: {
      name: 'success',
      cardBg: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
      iconBg: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
      iconGlow: 'rgba(5, 150, 105, 0.4)',
      iconColor: '#FFFFFF',
      accentColor: '#059669',
      borderColor: '#BBF7D0',
    },

    info: {
      name: 'info',
      cardBg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
      iconBg: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
      iconGlow: 'rgba(37, 99, 235, 0.4)',
      iconColor: '#FFFFFF',
      accentColor: '#2563EB',
      borderColor: '#BFDBFE',
    },

    warning: {
      name: 'warning',
      cardBg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      iconBg: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
      iconGlow: 'rgba(217, 119, 6, 0.4)',
      iconColor: '#FFFFFF',
      accentColor: '#D97706',
      borderColor: '#FCD34D',
    },

    error: {
      name: 'error',
      cardBg: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
      iconBg: 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
      iconGlow: 'rgba(220, 38, 38, 0.4)',
      iconColor: '#FFFFFF',
      accentColor: '#DC2626',
      borderColor: '#FECACA',
    },

    secondary: {
      name: 'secondary',
      cardBg: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
      iconBg: 'linear-gradient(135deg, #C084FC 0%, #9333EA 100%)',
      iconGlow: 'rgba(147, 51, 234, 0.4)',
      iconColor: '#FFFFFF',
      accentColor: '#9333EA',
      borderColor: '#E9D5FF',
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

  if (typeof colorProp === 'string' && colorProp.startsWith('#')) {
    selected = {
      cardBg: `linear-gradient(135deg, ${colorProp}10 0%, ${colorProp}22 100%)`,
      iconBg: colorProp,
      iconGlow: `${colorProp}50`,
      iconColor: '#FFFFFF',
      accentColor: colorProp,
      borderColor: `${colorProp}40`,
    };
  } else if (typeof colorProp === 'string' && paletteMap[colorProp]) {
    selected = paletteMap[colorProp];
  } else {
    const idx =
      typeof colorIndex === 'number'
        ? colorIndex
        : typeof colorProp === 'number'
        ? colorProp
        : 0;

    selected = cardList[idx % cardList.length];
  }

  if (isDark) {
    return {
      cardBg: 'background.paper',
      iconBg: selected.iconBg,
      iconGlow: selected.iconGlow,
      iconColor: '#FFFFFF',
      accentColor: '#FFFFFF',
      borderColor: 'rgba(255,255,255,0.12)',
    };
  }

  return selected;
};

export const getDynamicStatCardColors = getStatCardColor;