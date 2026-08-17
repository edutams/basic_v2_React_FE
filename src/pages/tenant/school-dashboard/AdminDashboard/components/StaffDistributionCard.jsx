import React from 'react';
import { Box, Typography, Paper, Stack, useTheme } from '@mui/material';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import { LegendItem } from '../common';

/**
 * Compact Staff Distribution card — donut + legend without excess padding or dead space.
 */
const StaffDistributionCard = ({ staffDonut }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        py: 1.25,
        px: 1.5,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        background: isDark
          ? theme.palette.background.paper
          : 'linear-gradient(135deg, #F8F5FF 0%, #EDE9FE 100%)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#DDD6FE',
        boxShadow: isDark
          ? '0 4px 14px rgba(0,0,0,0.25)'
          : '0 2px 10px rgba(109, 40, 217, 0.05)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, minWidth: 0 }}>
        {/* Compact donut chart */}
        <Box sx={{ width: 44, height: 44, flexShrink: 0, position: 'relative' }}>
          <ReusableDonutChart
            data={staffDonut}
            height={44}
            innerRadius={11}
            outerRadius={20}
            tooltipFormatter={(value, name) => {
              const d = staffDonut.find((s) => s.name === name);
              return [`${value}% · ${d?.count.toLocaleString() || 0} members`, name];
            }}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: isDark ? '#E9D5FF' : '#5B21B6',
              mb: 0.25,
              lineHeight: 1.1,
            }}
          >
            Staff Distribution
          </Typography>
          <Stack spacing={0.25}>
            {staffDonut.map((d) => (
              <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <LegendItem color={d.color} label={d.name} value={`${d.value}%`} />
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default StaffDistributionCard;
