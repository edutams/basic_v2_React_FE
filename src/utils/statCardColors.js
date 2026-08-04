import { alpha, lighten } from '@mui/material/styles';

export const getStatCardColor = (
  colorProp,
  colorIndex = 0,
  isDark = false,
  theme = null
) => {
  const primaryMain = theme?.palette?.primary?.main || '#6D28D9';

  const paletteMap = {
    primary: {
      name: 'primary',

      cardBg: `
        radial-gradient(
          circle at top left,
          ${alpha(primaryMain, 0.08)} 0%,
          transparent 45%
        ),
        linear-gradient(
          135deg,
          ${lighten(primaryMain, 0.93)} 0%,
          ${lighten(primaryMain, 0.88)} 100%
        )
      `,

      iconBg: `linear-gradient(
        135deg,
        ${lighten(primaryMain, 0.08)} 0%,
        ${primaryMain} 100%
      )`,

      iconGlow: alpha(primaryMain, 0.35),
      iconColor: '#FFFFFF',
      accentColor: primaryMain,
      // borderColor: alpha(primaryMain, 0.18),
      borderColor: primaryMain
    },

    success: {
      name: 'success',
      cardBg: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
      iconBg: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
      iconGlow: 'rgba(5, 150, 105, 0.4)',
      iconColor: '#FFFFFF',
      accentColor: '#059669',
      // borderColor: '#BBF7D0',
      borderColor: '#059669',
    },

    info: {
      name: 'info',
      cardBg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
      iconBg: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
      iconGlow: 'rgba(37, 99, 235, 0.4)',
      iconColor: '#FFFFFF',
      accentColor: '#2563EB',
      // borderColor: '#BFDBFE',
      borderColor: '#2563EB',
    },

    warning: {
      name: 'warning',
      cardBg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      iconBg: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
      iconGlow: 'rgba(217, 119, 6, 0.4)',
      iconColor: '#FFFFFF',
      accentColor: '#D97706',
      // borderColor: '#FCD34D',
      borderColor: '#D97706',
    },

    error: {
      name: 'error',
      cardBg: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
      iconBg: 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
      iconGlow: 'rgba(220, 38, 38, 0.4)',
      iconColor: '#FFFFFF',
      accentColor: '#DC2626',
      // borderColor: '#FECACA',
      borderColor: '#DC2626',
    },

    secondary: {
      name: 'secondary',
      cardBg: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
      iconBg: 'linear-gradient(135deg, #C084FC 0%, #9333EA 100%)',
      iconGlow: 'rgba(147, 51, 234, 0.4)',
      iconColor: '#FFFFFF',
      accentColor: '#9333EA',
      // borderColor: '#E9D5FF',
      borderColor: '#9333EA',
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
      cardBg: `linear-gradient(
        135deg,
        ${alpha(colorProp, 0.08)} 0%,
        ${alpha(colorProp, 0.14)} 100%
      )`,
      iconBg: colorProp,
      iconGlow: alpha(colorProp, 0.35),
      iconColor: '#FFFFFF',
      accentColor: colorProp,
      // borderColor: alpha(colorProp, 0.18),
      borderColor: colorProp,
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
    const darkPaper = theme?.palette?.background?.paper || '#1e1e2d';
    return {
      cardBg: darkPaper,
      valueBg: 'rgba(255,255,255,0.08)',
      iconBg: selected.iconBg,
      iconGlow: selected.iconGlow,
      iconColor: '#FFFFFF',
      accentColor: '#FFFFFF',
      // borderColor: 'rgba(255,255,255,0.12)',
      borderColor: selected.borderColor,
    };
  }

  return { ...selected, valueBg: 'rgba(255,255,255,0.7)' };
};


export const getDynamicStatCardColors = getStatCardColor;