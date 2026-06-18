import React from 'react';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

const StatusBreakdownCard = ({
  title = 'Total Transaction Value',
  items = [],
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
      <Typography
        variant="subtitle2"
        fontWeight={700}
        sx={{ mb: 1.5, color: isDark ? '#fff' : '#1a1a1a' }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {items.map((item, index) => (
          <Box
            key={item.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 1.2,
              borderBottom: index !== items.length - 1 ? `1px solid ${isDark ? '#333' : '#f0f0f0'}` : 'none',
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: item.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AccountBalanceWalletOutlinedIcon
                sx={{
                  fontSize: 16,
                  color: item.color,
                }}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                fontWeight={800}
                sx={{
                  fontSize: '14px',
                  color: item.color,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? '#aaa' : '#64748B',
                  fontSize: '11px',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default StatusBreakdownCard;