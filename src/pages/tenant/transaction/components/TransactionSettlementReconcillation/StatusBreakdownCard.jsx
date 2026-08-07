import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, useTheme, Chip } from '@mui/material';
import {
  AccountBalanceWalletOutlined as WalletIcon,
  CheckCircleOutline as ReconciledIcon,
  WarningAmberOutlined as OutstandingIcon,
  TrendingUp as TotalIcon,
} from '@mui/icons-material';

const StatusBreakdownCard = ({ items = [], title }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const iconMap = {
    wallet: WalletIcon,
    settlement: ReconciledIcon,
    balance: OutstandingIcon,
    revenue: TotalIcon,
  };

  const colorMap = {
    wallet: '#3247C6',
    settlement: '#10B981',
    balance: '#EF4444',
    revenue: '#4DA3F5',
  };

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} sx={{ color: isDark ? '#fff' : '#1f2937' }}>
        {title}
      </Typography>

      {items.map((item, index) => {
        const IconComponent = iconMap[item.icon] || WalletIcon;
        const mainColor = colorMap[item.icon] || '#64748B';

        return (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              mb: index === items.length - 1 ? 0 : 1,
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                flexShrink: 0,
                borderRadius: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isDark ? `${mainColor}20` : `${mainColor}15`,
              }}
            >
              <IconComponent sx={{ fontSize: 30, color: mainColor }} />
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: mainColor,
                  lineHeight: 1.1,
                }}
              >
                {item.value}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#64748B' }}>
                  {item.label}
                </Typography>
              </Box>
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
