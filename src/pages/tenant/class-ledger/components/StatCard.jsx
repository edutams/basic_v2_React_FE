import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Divider, useTheme } from '@mui/material';
import { IconChartBar } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import { getStatCardColor } from '@/utils/statCardColors';

/**
 * Reusable dashboard stat card matching the new design:
 * - Title top-left, chart icon top-right
 * - Large highlighted value box
 * - Bottom row with sub-stats separated by dividers
 */
const StatCard = ({
  title,
  value,
  valueColor,
  valueBg,
  subStats = [],
  onIconClick,
  onClick,
  colorIndex = 0,
  color,
  sx = {},
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { cardBg, iconBg, iconGlow, accentColor, borderColor } = getStatCardColor(
    color,
    colorIndex,
    isDark,
    theme,
  );

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        borderRadius: '16px',
        background: isDark ? theme.palette.background.paper : `${cardBg} !important`,
        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : `1px solid ${borderColor}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 6px 24px rgba(0,0,0,0.28)'
            : '0 4px 20px rgba(0,0,0,0.07)',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 8px 30px rgba(0,0,0,0.35)'
                  : '0 6px 24px rgba(0,0,0,0.12)',
              transform: 'translateY(-4px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }
          : {},
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...sx,
      }}
    >
      <CardContent
        sx={{
          p: '20px !important',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="subtitle2"
            fontWeight="900"
            sx={{ color: isDark ? '#ccc' : '#555', fontSize: '13px' }}
          >
            {title}
          </Typography>
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onIconClick?.();
            }}
            sx={{
              background: iconBg,
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : `0 4px 14px ${iconGlow}`,
              p: 0.75,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: onIconClick ? 'pointer' : 'default',
            }}
          >
            <IconChartBar size={18} color="white" />
          </Box>
        </Box>

        {/* Value */}
        <Box
          sx={{
            bgcolor: valueBg || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'),
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
            sx={{
              color: valueColor || (isDark ? '#ffffff' : accentColor),
              fontSize: '32px',
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        </Box>

        {/* Sub Stats */}
        {subStats.length > 0 && (
          <Stack
            direction="row"
            spacing={0}
            divider={<Divider orientation="vertical" flexItem />}
            sx={{ mt: 'auto' }}
          >
            {subStats.map((stat, i) => (
              <Box
                key={i}
                sx={{ flex: 1, px: i === 0 ? 0 : 2, pr: i === subStats.length - 1 ? 0 : 2 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? '#aaa' : '#333333',
                    fontWeight: 800,
                    display: 'block',
                    mb: 0.3,
                    fontSize: '13px',
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight="700"
                  sx={{ color: isDark ? '#fff' : '#1a1a1a', fontSize: '15px' }}
                >
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
  color: PropTypes.string,
  sx: PropTypes.object,
};

export default StatCard;
