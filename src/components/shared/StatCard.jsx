import React, { useContext } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { getStatCardColor } from 'src/utils/statCardColors';
import PropTypes from 'prop-types';

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

  const { cardBg, iconBg, iconColor, accentColor, borderColor } =
    getStatCardColor(color, colorIndex, isDark, theme);

  return (
    <Paper
      elevation={0}
      variant={!isCardShadow ? 'outlined' : undefined}
      sx={{
        borderRadius: 2,
        p: 3,
        width: '100%',
        backgroundColor: cardBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',

        border: `1px solid ${borderColor}`,

        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,.35)'
          : '0 8px 24px rgba(15,23,42,.06)',

        transition: 'all .25s ease',

        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: isDark
            ? '0 18px 40px rgba(0,0,0,.45)'
            : '0 18px 40px rgba(15,23,42,.12)',
        },
      }}
    >
      {/* Icon */}

      {/* <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,

          boxShadow: `0 0 0 8px ${borderColor}`,
        }}
      >
        {Icon && <Icon size={28} />}
      </Box> */}

      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          bgcolor: iconBg,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,

          boxShadow: '0 8px 18px rgba(0,0,0,.12)',
        }}
      >
        {Icon && <Icon size={22} />}
      </Box>

      {/* Content */}

      <Box
        sx={{
          flexGrow: 1,
          pl: 2.5,
          textAlign: 'right',
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
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1,
                color: isDark ? '#fff' : '#111827',
              }}
            >
              {count}
            </Typography>

            <Typography
              sx={{
                mt: 0.75,
                fontSize: 14,
                fontWeight: 500,
                color: isDark
                  ? 'rgba(255,255,255,.72)'
                  : '#6B7280',
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