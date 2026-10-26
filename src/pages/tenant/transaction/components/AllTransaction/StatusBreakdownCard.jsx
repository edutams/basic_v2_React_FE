import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, LinearProgress, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';

const ICON_BY_LABEL = {
  Successful: CheckCircleIcon,
  Pending: AccessTimeIcon,
  Declined: CancelIcon,
};

const StatusBreakdownCard = ({ items = [], onViewDetails }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: isDark ? 'rgba(22,163,74,0.18)' : '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: 17 }}>
              Transaction Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Breakdown of transactions by status.
            </Typography>
          </Box>
        </Box>
        {onViewDetails && (
          <Typography
            component="button"
            onClick={onViewDetails}
            sx={{
              border: 0,
              background: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              color: 'primary.main',
              whiteSpace: 'nowrap',
            }}
          >
            View Details →
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          gap: 3,
        }}
      >
        {items.map((item) => {
          const Icon = ICON_BY_LABEL[item.label];

          return (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 130 }}>
                {Icon && (
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      bgcolor: `${item.color}1A`,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 16 }} />
                  </Box>
                )}
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: isDark ? '#fff' : '#111827' }}>
                  {item.label}
                </Typography>
              </Box>

              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={item.value}
                  sx={{
                    height: 10,
                    borderRadius: 10,
                    bgcolor: isDark ? '#2A2A2A' : '#E5E7EB',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 10,
                      bgcolor: item.color,
                    },
                  }}
                />
              </Box>

              <Typography sx={{ fontWeight: 800, color: isDark ? '#fff' : '#111827', fontSize: 18, minWidth: 32, textAlign: 'right' }}>
                {item.count ?? 0}
              </Typography>
              <Typography sx={{ fontWeight: 700, color: item.color, fontSize: 14, minWidth: 50, textAlign: 'right' }}>
                {item.value}%
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

StatusBreakdownCard.propTypes = {
  items: PropTypes.array,
  onViewDetails: PropTypes.func,
};

export default StatusBreakdownCard;
