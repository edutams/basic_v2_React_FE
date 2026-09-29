import React from 'react';
import { Box, Typography, Paper, Stack, useTheme } from '@mui/material';
import { PieChartOutline } from '@mui/icons-material';

import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import { formatCompact } from '../constants';

/**
 * Revenue Breakdown — donut + legend with the same getStatCardColor stat-card
 * treatment as the fee cards.
 */
const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];
const scheme = schemeMap[0];

const RevenueBreakdownCard = ({ donutData, totalFees }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: '14px',
        borderRadius: '14px',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header: gradient icon tile + uppercase accent caption */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: scheme.bg,
            boxShadow: isDark
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 14px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <PieChartOutline sx={{ fontSize: 16, color: '#fff' }} />
        </Box>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: isDark ? 'rgba(255,255,255,0.72)' : scheme.color,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
            fontSize: '11px',
          }}
        >
          Revenue Breakdown
        </Typography>
      </Box>

      {/* Donut + legend, vertically centered */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          flexGrow: 1,
          mt: 1.5,
        }}
      >
        <Box sx={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
          <ReusableDonutChart
            data={donutData}
            height={110}
            innerRadius={34}
            outerRadius={52}
            centerValue={formatCompact(totalFees)}
            centerTitle="Total"
            valueFontSize={11.5}
            titleFontSize={8.5}
          />
        </Box>

        <Stack spacing={1.25}>
          {donutData.map((d) => (
            <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: d.color }} />
              <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 500 }}>
                {d.name}
              </Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 800 }}>{d.value}%</Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default RevenueBreakdownCard;
