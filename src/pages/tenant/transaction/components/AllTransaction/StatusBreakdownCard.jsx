import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, LinearProgress, useTheme } from '@mui/material';

const StatusBreakdownCard = ({ title = 'Distribution', items = [] }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
      <Typography sx={{ fontSize: 12, letterSpacing: 2, fontWeight: 700, color: '#6B7280', mb: 2 }}>
        STATUS BREAKDOWN
      </Typography>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Percentages column */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', mb: 1.5 }}>
            PERCENTAGE
          </Typography>
          {items.map((item) => (
            <Box key={item.label} sx={{ mb: 2.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 0.75,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                  <Typography
                    sx={{ fontWeight: 500, color: isDark ? '#fff' : '#111827', fontSize: 14 }}
                  >
                    {item.label}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, color: item.color }}>{item.value}%</Typography>
              </Box>
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
          ))}
        </Box>

        {/* Amount column */}
        <Box sx={{ flex: 1, borderLeft: `1px solid ${isDark ? '#333' : '#E5E7EB'}`, pl: 3 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', mb: 1.5 }}>
            AMOUNT
          </Typography>
          {items.map((item) => (
            <Box
              key={item.label}
              sx={{ mb: 2.5, display: 'flex', alignItems: 'center', height: 34 }}
            >
              <Typography sx={{ fontWeight: 700, color: item.color, fontSize: 14 }}>
                ₦{Number(item.amount || 0).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

StatusBreakdownCard.propTypes = {
  title: PropTypes.string,
  items: PropTypes.array,
};

export default StatusBreakdownCard;
