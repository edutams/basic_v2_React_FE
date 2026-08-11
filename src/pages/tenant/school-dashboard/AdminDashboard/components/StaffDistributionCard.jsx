import React from 'react';
import { Box, Typography, Paper, Stack, useTheme } from '@mui/material';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import { LegendItem } from '../common';

/**
 * Staff Distribution — donut + legend card with the purple gradient treatment.
 */
const StaffDistributionCard = ({ staffDonut }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: isDark
          ? theme.palette.background.paper
          : 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
        border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #C4B5FD',
        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,0.35)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': { transform: 'translateY(-3px)' },
      }}
    >
      <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11, color: 'text.secondary' }}>
        Staff Distribution
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
        {/* Fixed-width donut wrapper — width:100% on the donut would overflow the card */}
        <Box sx={{ width: 118, height: 120, flexShrink: 0 }}>
          <ReusableDonutChart
            data={staffDonut}
            height={120}
            innerRadius={30}
            outerRadius={48}
            tooltipFormatter={(value, name) => {
              const d = staffDonut.find((s) => s.name === name);
              return [`${value}% · ${d?.count.toLocaleString() || 0} members`, name];
            }}
          />
        </Box>
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          {staffDonut.map((d) => (
            <Box key={d.name}>
              <LegendItem color={d.color} label={d.name} value={`${d.value}%`} />
              <Typography variant="caption" sx={{ fontSize: 9.5, color: 'text.secondary', ml: 1.75, display: 'block' }}>
                {d.count.toLocaleString()} members
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default StaffDistributionCard;
