import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, LinearProgress, Divider, useTheme } from '@mui/material';

const StatusBreakdownCard = ({ title = 'Distribution', items = [], metrics = [] }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 12,
          letterSpacing: 2,
          fontWeight: 700,
          color: '#6B7280',
          mb: 1,
        }}
      >
        STATUS BREAKDOWN
      </Typography>

      {items.map((item) => (
        <Box key={item.label} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
              <Typography sx={{ fontWeight: 500, color: isDark ? '#fff' : '#111827' }}>
                {item.label}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography sx={{ fontWeight: 700, color: '#6B7280' }}>{item.value}%</Typography>
              <Typography
                sx={{ fontWeight: 700, color: item.color, minWidth: 90, textAlign: 'right' }}
              >
                ₦{Number(item.amount || 0).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={item.value}
            sx={{
              height: 10,
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
      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: 3,
        }}
      >
        {metrics.map((metric) => (
          <Box key={metric.label}>
            <Typography
              sx={{
                fontSize: 12,
                letterSpacing: 1,
                fontWeight: 700,
                color: '#6B7280',
                mb: 0.5,
              }}
            >
              {metric.label}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                color: metric.color,
              }}
            >
              {metric.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

StatusBreakdownCard.propTypes = {
  title: PropTypes.string,
  items: PropTypes.array,
  metrics: PropTypes.array,
};

export default StatusBreakdownCard;
