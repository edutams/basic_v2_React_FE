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
  const borderColor = theme.palette.grey[100];

  return (
    <Paper
      elevation={0}
      variant={!isCardShadow ? 'outlined' : undefined}
      sx={{
        borderRadius: 2,
        p: 3,
        width: '100%',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: !isCardShadow ? `1px solid ${borderColor}` : 'none',
        boxShadow: isCardShadow
          ? theme.palette.mode === 'dark'
            ? '0px 0px 20px rgba(0, 0, 0, 0.3)'
            : '0px 0px 15px rgba(0, 0, 0, 0.05)'
          : 'none',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {Icon && <Icon size={22} color={color} />}
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <Typography fontSize={26} fontWeight={700}>
              {count}
            </Typography>
            <Typography fontSize={14} color="text.secondary">
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
