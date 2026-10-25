import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, useTheme } from '@mui/material';
import { IconChartBar } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const StatCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  studentCount,
  value,
  progressCaption,
  progressPercent,
  progressColor = 'success',
  loading,
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
      <CardContent
        sx={{
          p: '14px !important',
          '&:last-child': { pb: '14px !important' },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: iconBg,
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
            </Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ color: 'text.secondary', fontSize: '12.5px', lineHeight: 1.2 }}
            >
              {label}
            </Typography>
          </Box>
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onIconClick?.();
            }}
            sx={{
              width: 26,
              height: 26,
              borderRadius: '6px',
              bgcolor: isDark ? 'rgba(37,99,235,0.15)' : '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: onIconClick ? 'pointer' : 'default',
              '&:hover': onIconClick ? { opacity: 0.8 } : {},
            }}
          >
            <IconChartBar size={15} color="currentColor" />
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11.5px' }}>
          {loading ? '—' : studentCount}
        </Typography>

        <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.15 }}>
          {loading ? <LinearProgress sx={{ width: 90, borderRadius: 1 }} /> : value}
        </Typography>

        {!loading && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11.5px' }}>
              {progressCaption}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, progressPercent || 0))}
              color={progressColor}
              sx={{
                height: 6,
                borderRadius: 3,
                mt: 0.25,
                bgcolor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconBg: PropTypes.string.isRequired,
  iconColor: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  studentCount: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  progressCaption: PropTypes.string,
  progressPercent: PropTypes.number,
  progressColor: PropTypes.oneOf(['success', 'warning', 'error', 'info', 'primary']),
  loading: PropTypes.bool,
  onIconClick: PropTypes.func,
  onClick: PropTypes.func,
  sx: PropTypes.object,
};

export default StatCard;
