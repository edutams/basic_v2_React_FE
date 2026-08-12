import React from 'react';
import { Box, Typography, Paper, Stack, useTheme } from '@mui/material';
import { PieChartOutline } from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import { formatCompact } from '../constants';

/**
 * Revenue Breakdown — donut + legend with the same getStatCardColor stat-card
 * treatment as the fee cards.
 */
const RevenueBreakdownCard = ({ donutData, totalFees }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor('primary', 0, isDark, theme);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: isDark ? theme.palette.background.paper : colors.cardBg,
        border: isDark ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${colors.borderColor}`,
        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,0.35)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: isDark
            ? '0 8px 30px rgba(0,0,0,0.35)'
            : '0 6px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Header: gradient icon tile + uppercase accent caption */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: `${colors.iconBg} !important`,
            boxShadow: isDark
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : `0 4px 14px ${colors.iconGlow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <PieChartOutline sx={{ fontSize: 16, color: colors.iconColor || '#fff' }} />
        </Box>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: isDark ? 'rgba(255,255,255,0.72)' : colors.accentColor,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
            fontSize: 10,
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
