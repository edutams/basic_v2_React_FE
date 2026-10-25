import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, useTheme } from '@mui/material';
import { IconChartBar } from '@tabler/icons-react';
import PropTypes from 'prop-types';

/**
 * Summary card for the Student Category Placement page — distinct layout
 * from the generic class-ledger StatCard: icon + label on top, a big value
 * (optionally with a percentage), then two sub-stat columns (New/Returning
 * or a single supporting line) separated by a vertical divider.
 */
const CategoryPlacementStatCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  percent,
  percentColor,
  subStats,
  supportingText,
  loading,
  active,
  onClick,
  analyticsIconColor = '#2563EB',
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
        borderColor: active ? 'primary.main' : isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: active ? '0 0 0 2px rgba(37,99,235,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }
          : {},
        ...sx,
      }}
    >
      <CardContent sx={{ p: '14px !important', '&:last-child': { pb: '14px !important' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
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
            sx={{
              width: 26,
              height: 26,
              borderRadius: '6px',
              bgcolor: isDark ? 'rgba(37,99,235,0.15)' : '#EFF6FF',
              color: analyticsIconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconChartBar size={15} color="currentColor" />
          </Box>
        </Box>

        {loading ? (
          <LinearProgress sx={{ width: 90, borderRadius: 1, mb: 1 }} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mb: 1 }}>
            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.15, color: valueColor }}>
              {value}
            </Typography>
            {percent != null && (
              <Typography variant="body2" fontWeight={700} sx={{ color: percentColor }}>
                ({percent}%)
              </Typography>
            )}
          </Box>
        )}

        {!loading && subStats && (
          <Box sx={{ display: 'flex', borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9', pt: 1 }}>
            <Box sx={{ flex: 1, pr: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '11px' }}>
                {subStats[0].label}
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {subStats[0].value}
              </Typography>
            </Box>
            <Box sx={{ width: '1px', bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB', mx: 1 }} />
            <Box sx={{ flex: 1, pl: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '11px' }}>
                {subStats[1].label}
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {subStats[1].value}
              </Typography>
            </Box>
          </Box>
        )}

        {!loading && supportingText && (
          <Box sx={{ borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9', pt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11.5px' }}>
              {supportingText}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

CategoryPlacementStatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconBg: PropTypes.string.isRequired,
  iconColor: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  valueColor: PropTypes.string,
  percent: PropTypes.number,
  percentColor: PropTypes.string,
  subStats: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
  ),
  supportingText: PropTypes.string,
  loading: PropTypes.bool,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  analyticsIconColor: PropTypes.string,
  sx: PropTypes.object,
};

export default CategoryPlacementStatCard;
