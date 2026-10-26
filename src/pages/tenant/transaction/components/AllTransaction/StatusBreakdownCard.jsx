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
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              bgcolor: isDark ? 'rgba(22,163,74,0.18)' : '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 17 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Transaction Status
            </Typography>
            <Typography variant="caption" color="text.secondary">
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
              fontSize: 12.5,
              fontWeight: 700,
              color: 'primary.main',
              whiteSpace: 'nowrap',
            }}
          >
            View Details →
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {items.map((item) => {
          const Icon = ICON_BY_LABEL[item.label];

          return (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 100 }}>
                {Icon && <Icon sx={{ fontSize: 16, color: item.color }} />}
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: isDark ? '#fff' : '#111827' }}>
                  {item.label}
                </Typography>
              </Box>

              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={item.value}
                  sx={{
                    height: 7,
                    borderRadius: 10,
                    bgcolor: isDark ? '#2A2A2A' : '#E5E7EB',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 10,
                      bgcolor: item.color,
                    },
                  }}
                />
              </Box>

              <Typography sx={{ fontWeight: 800, color: isDark ? '#fff' : '#111827', fontSize: 14, minWidth: 28, textAlign: 'right' }}>
                {item.count ?? 0}
              </Typography>
              <Typography sx={{ fontWeight: 700, color: item.color, fontSize: 12.5, minWidth: 42, textAlign: 'right' }}>
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
