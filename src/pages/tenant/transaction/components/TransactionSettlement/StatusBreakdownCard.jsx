import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, useTheme } from '@mui/material';
import { Wallet, CalendarToday, DateRange, TrendingUp } from '@mui/icons-material';

const StatusBreakdownCard = ({ items = [] }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const icons = [Wallet, CalendarToday, DateRange, TrendingUp];
  const bgColors = ['#EAF4FF', '#FDF1F3', '#EEF9F2', '#EEF0FF'];
  const textColors = ['#4DA3F5', '#E95A71', '#6BC68D', '#3247C6'];

  return (
    <Box>
      <Typography
        sx={{
          fontSize: '15px',
          // fontWeight: 600,
          color: isDark ? '#fff' : '#1f2937',
          mb: 2,
        }}
      >
        TOTAL SETTLEMENT
      </Typography>

      {items.map((item, index) => {
        const IconComponent = icons[index] || Wallet;
        const bgColor = bgColors[index] || '#EAF4FF';
        const textColor = textColors[index] || '#4DA3F5';

        return (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
              mb: 1.5,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : bgColor,
            }}
          >
            {/* Icon Box */}
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isDark ? `${textColor}20` : 'white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}
            >
              <IconComponent sx={{ fontSize: 20, color: textColor }} />
            </Box>

            {/* Amount & Label */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '1.rem',
                  fontWeight: 700,
                  color: textColor,
                  lineHeight: 1.2,
                }}
              >
                {item.value}
              </Typography>
              <Typography
                sx={{
                  fontSize: '13px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  mt: 0.4,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

StatusBreakdownCard.propTypes = {
  items: PropTypes.array,
};

export default StatusBreakdownCard;
