import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, LinearProgress, Divider, useTheme } from '@mui/material';

const StatusBreakdownCard = ({
  title = 'Distribution',
  items = [],
  metrics = [],
  minType = 0,
  maxType = 0,
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

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* LEFT: Percentages */}
        <Box sx={{ flex: 1 }}>
          {items.map((item) => (
            <Box key={item.label} sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: item.color,
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: isDark ? '#fff' : '#111827',
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>

                <Typography sx={{ fontWeight: 700, color: '#6B7280' }}>{item.value}%</Typography>
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
        </Box>

        {/* RIGHT: Amounts + Min/Max */}
        <Box sx={{ flex: 1, borderLeft: `1px solid ${isDark ? '#444' : '#E5E7EB'}`, pl: 4 }}>
          <Typography
            sx={{
              fontSize: 12,
              letterSpacing: 2,
              fontWeight: 700,
              color: '#6B7280',
              mb: 2,
            }}
          >
            AMOUNTS
          </Typography>

          {/* Current Metrics (Compulsory / Optional) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
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
                <Typography variant="h4" fontWeight={700} sx={{ color: metric.color }}>
                  {metric.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

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
};

export default StatusBreakdownCard;
