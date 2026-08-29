import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Divider, useTheme } from '@mui/material';
import { IconChartBar } from '@tabler/icons-react';
// import { getStatCardColor } from 'src/utils/statCardColors';
import PropTypes from 'prop-types';

const DashboardStatCard = ({
  title,
  value,
  valueColor,
  valueBg,
  colorIndex = 0,
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
        p: '0px !important',
        height: '100%',
        borderRadius: '16px',
        boxShadow: isDark
          ? '0 6px 24px rgba(0,0,0,0.28)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
            boxShadow: isDark
              ? '0 8px 30px rgba(0,0,0,0.35)'
              : '0 6px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-3px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }
          : {},
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...sx,
      }}
    >
      <CardContent sx={{ p: '14px !important', '&:last-child': { pb: '14px !important' }, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'text.secondary', fontSize: '13px' }}>
            {title}
          </Typography>
          <Box
            onClick={(e) => { e.stopPropagation(); onIconClick?.(); }}
            sx={{
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: onIconClick ? 'pointer' : 'default',
              '&:hover': onIconClick ? { opacity: 0.85 } : {},
            }}
          >
            <IconChartBar size={18} color='white' />
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
          // sx={{ color: resolvedValueColor, fontSize: '32px', lineHeight: 1 }}
          >
            {value}
          </Typography>
        </Box>

        {/* Sub Stats */}
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
    </Card >
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
