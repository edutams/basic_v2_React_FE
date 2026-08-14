import React, { useContext } from 'react';
import { Box, Paper, Typography, CircularProgress, Tooltip } from '@mui/material';
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
  subtitle,
  onClick,
  tooltip,
  tooltipPlacement = 'top',
}) => {
  const { isCardShadow } = useContext(CustomizerContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { cardBg, iconBg, iconGlow, iconColor, accentColor, borderColor } =
    getStatCardColor(color, colorIndex, isDark, theme);

  const cardContent = (
    <Paper
      elevation={0}
      variant={!isCardShadow ? 'outlined' : undefined}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        px: 1.6,
        py: 2.5,
        width: '100%',
        background: `${cardBg} !important`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',

        // border: `1px solid ${borderColor}`,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 6px 24px rgba(0,0,0,0.28)'
            : '0 4px 20px rgba(0,0,0,0.07)',

        cursor: onClick ? 'pointer' : 'default',
        transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': onClick
          ? {
            transform: 'translateY(-3px)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 10px 30px rgba(0,0,0,0.4)'
                : '0 8px 25px rgba(0,0,0,0.12)',
          }
          : undefined,
      }}
    >
      {/* Icon Badge */}
      <Box
        sx={{
          width: 40,
          height: 40,
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
        {Icon && <Icon size={22} />}
      </Box>

      {/* Content */}
      <Box
        sx={{
          flexGrow: 1,
          pl: 1,
          textAlign: 'right',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {loading ? (
          <CircularProgress
            size={22}
            sx={{
              color: accentColor,
            }}
          />
        ) : (
          <>
            <Typography
              sx={{
                fontSize: 22,
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
                mt: 0.5,
                fontSize: 13,
                fontWeight: 600,
                color: isDark
                  ? '#ffffff'
                  : '#4B5563',
              }}
            >
              {label}
            </Typography>

            {subtitle && (
              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: 11,
                  fontWeight: 500,
                  color: isDark ? 'rgba(255,255,255,0.7)' : '#6B7280',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Paper>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement={tooltipPlacement} arrow>
        <Box sx={{ width: '100%', display: 'flex' }}>
          {cardContent}
        </Box>
      </Tooltip>
    );
  }

  return cardContent;
};

StatCard.propTypes = {
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
  colorIndex: PropTypes.number,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  tooltip: PropTypes.node,
  tooltipPlacement: PropTypes.string,
};

export default StatCard;