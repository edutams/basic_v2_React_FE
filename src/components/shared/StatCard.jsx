import React, { useContext } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { getStatCardColor } from 'src/utils/statCardColors';
import PropTypes from 'prop-types';

/**
 * StatCard — reusable metric card used across dashboard pages.
 *
 * Props:
 *  - count:      string | number — the value to display
 *  - label:      string          — description below the count
 *  - icon:       component       — MUI or Tabler icon component
 *  - color:      string          — color name ('blue', 'purple', 'green', 'orange', 'cyan') or hex string
 *  - colorIndex: number          — fallback palette index (0, 1, 2, 3...)
 *  - loading:    bool            — shows a spinner instead of count when true
 */
const StatCard = ({ count, label, icon: Icon, color, colorIndex = 0, loading }) => {
  const { isCardShadow } = useContext(CustomizerContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { cardBg, iconBg, accentColor, borderColor } = getStatCardColor(
    color,
    colorIndex,
    isDark
  );

  return (
    <Paper
      elevation={0}
      variant={!isCardShadow ? 'outlined' : undefined}
      sx={{
        borderRadius: '16px',
        p: 3,
        width: '100%',
        bgcolor: `${cardBg} !important`,
        backgroundColor: `${cardBg} !important`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: `1px solid ${borderColor}`,
        boxShadow: isDark
          ? '0 6px 20px rgba(0,0,0,0.25)'
          : '0 4px 20px rgba(0,0,0,0.03)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: isCardShadow
            ? isDark
              ? '0px 10px 25px rgba(0, 0, 0, 0.35)'
              : '0px 8px 22px rgba(0, 0, 0, 0.06)'
            : 'none',
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          bgcolor: `${iconBg} !important`,
          backgroundColor: `${iconBg} !important`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon && (
          <Icon
            size={22}
            sx={{ fontSize: 22 }}
            style={{
              color: accentColor,
            }}
          />
        )}
      </Box>

      <Box sx={{ textAlign: 'right', flexGrow: 1, pl: 2 }}>
        {loading ? (
          <CircularProgress size={24} color="inherit" sx={{ color: accentColor }} />
        ) : (
          <>
            <Typography fontSize={26} fontWeight={700} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
              {count}
            </Typography>
            <Typography fontSize={14} fontWeight={500} sx={{ color: 'text.secondary', mt: 0.5 }}>
              {label}
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
};

StatCard.propTypes = {
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
  colorIndex: PropTypes.number,
  loading: PropTypes.bool,
};

export default StatCard;
