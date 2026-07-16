import React, { useContext } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CustomizerContext } from 'src/context/CustomizerContext';
import PropTypes from 'prop-types';

/**
 * StatCard — reusable metric card used across dashboard pages.
 *
 * Props:
 *  - count:   string | number — the value to display
 *  - label:   string          — description below the count
 *  - icon:    component       — MUI or Tabler icon component
 *  - color:   string          — icon color (default: 'primary')
 *  - loading: bool            — shows a spinner instead of count when true
 */
const StatCard = ({ count, label, icon: Icon, color = 'primary', loading }) => {
  const { isCardShadow } = useContext(CustomizerContext);
  const theme = useTheme();

  // Dynamic colors for premium styling
  const resolvedBgColor = theme.palette[color]?.light || theme.palette.primary.light;
  const resolvedIconColor = theme.palette[color]?.main || theme.palette.primary.main;
  const borderColor = theme.palette.mode === 'dark' ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100];

  return (
    <Paper
      elevation={0}
      variant={!isCardShadow ? 'outlined' : undefined}
      sx={{
        borderRadius: '16px',
        p: 3,
        width: '100%',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        // border: `2px solid ${borderColor}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 10px 30px rgba(0,0,0,0.35)'
            : '0 0 20px rgba(0,0,0,.10)'
        // transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        // '&:hover': {
        //   transform: 'translateY(-4px)',
        //   boxShadow: isCardShadow
        //     ? theme.palette.mode === 'dark'
        //       ? '0px 10px 25px rgba(0, 0, 0, 0.4)'
        //       : '0px 10px 20px rgba(0, 0, 0, 0.08)'
        //     : 'none',
        // },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          bgcolor: resolvedBgColor,
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
              color: resolvedIconColor,
            }}
          />
        )}
      </Box>

      <Box sx={{ textAlign: 'right', flexGrow: 1, pl: 2 }}>
        {loading ? (
          <CircularProgress size={24} />
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
  loading: PropTypes.bool,
};

export default StatCard;
