import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, LinearProgress, Divider, useTheme } from '@mui/material';

const StatusBreakdownCard = ({
  title = 'Distribution',
  items = [],
  metrics = [],
  minType = '',
  maxType = '',
  minRevenue = 0,
  maxRevenue = 0,
}) => {
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
          mb: 3,
        }}
      >
        STATUS BREAKDOWN
      </Typography>

      {/* Main Distribution Items */}
      {items.map((item, index) => (
        <Box key={item.label} sx={{ mb: index === items.length - 1 ? 4 : 4.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
              mb: 1.5,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color: item.color,
                fontSize: 24,
                minWidth: 130,
              }}
            >
              {item.amount}
            </Typography>

            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={item.value}
                sx={{
                  height: 9,
                  borderRadius: 10,
                  bgcolor: isDark ? '#2A2A2A' : '#E5E7EB',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 10,
                    background: `linear-gradient(90deg, ${item.color}, ${item.color}CC)`,
                  },
                }}
              />
            </Box>

            <Typography
              sx={{
                fontWeight: 700,
                color: item.color,
                fontSize: 16,
                minWidth: 55,
                textAlign: 'right',
              }}
            >
              {item.value}%
            </Typography>
          </Box>

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

      <Divider sx={{ my: 4 }} />

      {/* Min & Max Revenue */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: 12,
              letterSpacing: 1,
              fontWeight: 700,
              color: '#6B7280',
              mb: 0.5,
            }}
          >
            MIN REVENUE
          </Typography>
          <Typography variant="caption" color="#6B7280">
            ({minType})
          </Typography>
          <Typography variant="h5" fontWeight={600} color="#EF4444">
            ₦{Number(minRevenue).toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: 12,
              letterSpacing: 1,
              fontWeight: 700,
              color: '#6B7280',
              mb: 0.5,
            }}
          >
            MAX REVENUE
          </Typography>
          <Typography variant="caption" color="#6B7280">
            ({maxType})
          </Typography>
          <Typography variant="h5" fontWeight={600} color="#10B981">
            ₦{Number(maxRevenue).toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

StatusBreakdownCard.propTypes = {
  title: PropTypes.string,
  items: PropTypes.array,
  metrics: PropTypes.array,
  minRevenue: PropTypes.number,
  maxRevenue: PropTypes.number,
  minType: PropTypes.string,
  maxType: PropTypes.string,
};

export default StatusBreakdownCard;
