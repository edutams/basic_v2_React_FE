/**
 * Fixed soft stat card color palette options
 */
export const statColors = [
  {
    name: 'blue',
    bg: '#ECFFF7',
    iconBg: '#DBEAFE',
    color: '#10B981',
  },
  {
    name: 'purple',
    bg: '#FFDAD6',
    iconBg: '#FFC5BF',
    color: '#EF4444',
  },
  {
    name: 'green',
    bg: '#FFEFC2',
    iconBg: '#FFE39A',
    color: '#F59E0B',
  },
  {
    name: 'orange',
    bg: '#D4FFE3',
    iconBg: '#B8F7CF',
    color: '#22C55E',
  },
  {
    name: 'cyan',
    bg: '#ECFEFF',
    iconBg: '#CFFAFE',
    color: '#0891B2',
  },
];

/**
 * Get stat card color configuration by color name, hex, or index.
 * @param {string|number} colorProp - Color name ('blue', 'purple', 'green', 'orange', 'cyan') or hex or index
 * @param {number} colorIndex - Fallback card index in list/grid (0, 1, 2, 3...)
 * @param {boolean} isDark - Dark mode active state
 */
export const getStatCardColor = (colorProp, colorIndex = 0, isDark = false) => {
  const colorAliasMap = {
    primary: 'blue',
    secondary: 'purple',
    error: 'purple',
    warning: 'green',
    success: 'orange',
    info: 'cyan',
  };

  const resolvedName = colorAliasMap[colorProp] || colorProp;

  let matched = statColors.find(
    (item) => item.name === resolvedName || item.color === resolvedName
  );

  if (!matched) {
    const idx =
      typeof colorIndex === 'number'
        ? colorIndex
        : typeof colorProp === 'number'
        ? colorProp
        : 0;
    matched = statColors[idx % statColors.length];
  }

  return {
    cardBg: matched.bg,
    iconBg: matched.iconBg,
    accentColor: matched.color,
    borderColor: matched.iconBg,
    valueBg: matched.iconBg,
  };
};

export const getDynamicStatCardColors = getStatCardColor;
