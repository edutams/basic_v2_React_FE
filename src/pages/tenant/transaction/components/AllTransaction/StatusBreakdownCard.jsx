import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, LinearProgress, useTheme, Divider } from '@mui/material';

const StatusBreakdownCard = ({ title = 'Distribution', items = [] }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
      <Typography sx={{ fontSize: 12, letterSpacing: 2, fontWeight: 700, color: '#6B7280', mb: 3 }}>
        STATUS BREAKDOWN
      </Typography>

      {items.map((item, index) => (
        <Box key={item.label} sx={{ mb: index === items.length - 1 ? 0 : 4 }}>
          {/* Amount - Progress Bar - Percentage on ONE LINE */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
              mb: 1.5,
            }}
          >
            {/* Amount */}
            <Typography
              sx={{
                fontWeight: 700,
                color: item.color,
                fontSize: 24,
                minWidth: 110,
              }}
            >
              ₦{Number(item.amount || 0).toLocaleString()}
            </Typography>

            {/* Progress Bar */}
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={item.value}
                sx={{
                  height: 8,
                  borderRadius: 10,
                  bgcolor: isDark ? '#2A2A2A' : '#E5E7EB',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 10,
                    background: `linear-gradient(90deg, ${item.color}, ${item.color}CC)`,
                  },
                }}
              />
            </Box>

            {/* Percentage */}
            <Typography
              sx={{
                fontWeight: 700,
                color: item.color,
                fontSize: 15.5,
                minWidth: 50,
                textAlign: 'right',
              }}
            >
              {item.value}%
            </Typography>
          </Box>

          {/* Label with Color Dot */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
            <Typography sx={{ fontWeight: 500, color: isDark ? '#fff' : '#111827', fontSize: 14 }}>
              {item.label}
            </Typography>
          </Box>

          {/* Divider between items */}
          {index !== items.length - 1 && (
            <Divider sx={{ mt: 3.5, borderColor: isDark ? '#333' : '#E5E7EB', opacity: 0.6 }} />
          )}
        </Box>
      ))}
    </Box>
  );
};

StatusBreakdownCard.propTypes = {
  title: PropTypes.string,
  items: PropTypes.array,
};

export default StatusBreakdownCard;
