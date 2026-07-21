import React, { useContext } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { getStatCardColor } from 'src/utils/statCardColors';
import PropTypes from 'prop-types';

/**
 * StatCard — High-end modern SaaS metric card.
 */
const StatCard = ({
  count,
  label,
  icon: Icon,
  color,
  colorIndex = 0,
  loading,
}) => {
  const { isCardShadow } = useContext(CustomizerContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { cardBg, iconBg, iconGlow, iconColor, accentColor, borderColor } =
    getStatCardColor(color, colorIndex, isDark, theme);

  return (
    <Paper
      elevation={0}
      variant={!isCardShadow ? 'outlined' : undefined}
      sx={{
        borderRadius: 1,
        p: 3,
        width: '100%',
        background: `${cardBg} !important`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',

        border: `1px solid ${borderColor}`,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 6px 24px rgba(0,0,0,0.28)'
            : '0 4px 20px rgba(0,0,0,0.07)',

        transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)',

        // '&:hover': {
        //   transform: 'translateY(-6px)',
        //   boxShadow: (theme) =>
        //     theme.palette.mode === 'dark'
        //       ? '0 18px 40px rgba(0,0,0,.45)'
        //       : '0 10px 30px rgba(0,0,0,.15)',
        // },
      }}
    >
      {/* Background Watermark Icon */}
      {/* {Icon && (
        <Box
          sx={{
            position: 'absolute',
            right: -10,
            bottom: -15,
            opacity: 0.08,
            pointerEvents: 'none',
            color: accentColor,
            display: 'flex',
            transform: 'rotate(-10deg)',
          }}
        >
          <Icon size={84} />
        </Box>
      )} */}

      {/* Icon Badge */}
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: iconBg,
          color: iconColor || '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,

          boxShadow: isDark
            ? '0 6px 16px rgba(0,0,0,.3)'
            : `0 8px 22px -2px ${iconGlow}`,
        }}
      >
        {Icon && <Icon size={24} />}
      </Box>

      {/* Content */}
      <Box
        sx={{
          flexGrow: 1,
          pl: 2.5,
          textAlign: 'right',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {loading ? (
          <CircularProgress
            size={24}
            sx={{
              color: accentColor,
            }}
          />
        ) : (
          <>
            <Typography
              sx={{
                fontSize: 23,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: accentColor,
              }}
            >
              {count}
            </Typography>

            <Typography
              sx={{
                mt: 0.75,
                fontSize: 13,
                fontWeight: 600,
                color: isDark
                  ? '#ffffff'
                  : '#4B5563',
              }}
            >
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