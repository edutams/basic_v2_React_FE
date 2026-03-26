import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Divider, useTheme } from '@mui/material';
import { IconChartBar } from '@tabler/icons-react';
import PropTypes from 'prop-types';

/**
 * Reusable dashboard stat card matching the new design:
 * - Title top-left, chart icon top-right
 * - Large highlighted value box
 * - Bottom row with sub-stats separated by dividers
 */
const DashboardStatCard = ({
  title,
  value,
  valueColor,
  valueBg,
  subStats = [],
  onIconClick,
  onClick,
  sx = {},
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        borderRadius: '12px',
        boxShadow: 'none',
        border: `1px solid ${isDark ? theme.palette.divider : 'rgba(0,0,0,0.08)'}`,
        bgcolor: isDark ? theme.palette.background.paper : '#fff',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: '0.2s' } : {},
        ...sx,
      }}
    >
      <CardContent sx={{ p: '20px !important', height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight="900" sx={{ color: isDark ? '#ccc' : '#555', fontSize: '13px' }}>
            {title}
          </Typography>
          <Box
            onClick={(e) => { e.stopPropagation(); onIconClick?.(); }}
            sx={{
              bgcolor: isDark ? '#333' : '#333333',
              p: 0.6,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: onIconClick ? 'pointer' : 'default',
              '&:hover': onIconClick ? { bgcolor: '#222' } : {},
            }}
          >
            <IconChartBar size={18} color="white" />
          </Box>
        </Box>

        {/* Value */}
        <Box
          sx={{
            bgcolor: valueBg || (isDark ? '#1e3a5f22' : '#EEF2FF'),
            borderRadius: '8px',
            px: 2,
            py: 1.2,
            display: 'inline-flex',
            alignSelf: 'flex-start',
          }}
        >
          <Typography
            variant="h3"
            fontWeight="800"
            sx={{ color: valueColor || '#4a3aff', fontSize: '32px', lineHeight: 1 }}
          >
            {value}
          </Typography>
        </Box>

        {/* Sub Stats */}
        {subStats.length > 0 && (
          <Stack direction="row" spacing={0} divider={<Divider orientation="vertical" flexItem />} sx={{ mt: 'auto' }}>
            {subStats.map((stat, i) => (
              <Box key={i} sx={{ flex: 1, px: i === 0 ? 0 : 2, pr: i === subStats.length - 1 ? 0 : 2 }}>
                <Typography variant="caption" sx={{ color: isDark ? '#aaa' : '#333333', fontWeight: 800, display: 'block', mb: 0.3 ,fontSize: '13px'}}>
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

DashboardStatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  valueColor: PropTypes.string,
  valueBg: PropTypes.string,
  subStats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ),
  onIconClick: PropTypes.func,
  onClick: PropTypes.func,
  sx: PropTypes.object,
};

export default DashboardStatCard;
