import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Divider, useTheme } from '@mui/material';
import { IconChartBar } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const StatCard = ({
  title,
  value,
  valueColor,
  valueBg,
  subStats = [],
  onIconClick,
  onClick,
  colorIndex = 0,
  sx = {},
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex % schemeMap.length];

  return (
    <Card
      onClick={onClick}
      sx={{
        p: '0px !important',
        height: '100%',
        borderRadius: '14px',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#94a3b8',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        },
        ...sx,
      }}
    >
      <CardContent sx={{ p: '14px !important', '&:last-child': { pb: '14px !important' }, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'text.secondary', fontSize: '13px' }}>
            {title}
          </Typography>
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onIconClick?.();
            }}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : scheme.bg,
              color: isDark ? '#ffffff' : scheme.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: onIconClick ? 'pointer' : 'default',
              '&:hover': onIconClick ? { opacity: 0.85 } : {},
            }}
          >
            <IconChartBar size={18} color="currentColor" />
          </Box>
        </Box>

        <Box
          sx={{
            borderRadius: '8px',
            display: 'inline-flex',
            alignSelf: 'flex-start',
          }}
        >
          <Typography
            variant="h3"
            fontWeight="800"
          >
            {value}
          </Typography>
        </Box>

        {subStats.length > 0 && (
          <Stack direction="row" spacing={0} divider={<Divider orientation="vertical" flexItem />} sx={{ mt: 'auto' }}>
            {subStats.map((stat, i) => (
              <Box key={i} sx={{ flex: 1, px: i === 0 ? 0 : 2, pr: i === subStats.length - 1 ? 0 : 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.3, fontSize: '12px' }}>
                  {stat.label}
                </Typography>
                <Typography variant="subtitle2" fontWeight="700" sx={{ color: isDark ? '#fff' : '#1a1a1a', fontSize: '15px' }}>
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  valueColor: PropTypes.string,
  valueBg: PropTypes.string,
  subStats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ),
  onIconClick: PropTypes.func,
  onClick: PropTypes.func,
  colorIndex: PropTypes.number,
  sx: PropTypes.object,
};

export default StatCard;
