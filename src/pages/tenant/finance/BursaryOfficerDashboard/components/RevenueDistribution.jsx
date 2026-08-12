import React from 'react';
import { Box, Typography, Stack, useTheme } from '@mui/material';
import { PieChartOutline } from '@mui/icons-material';
import SectionCard from './SectionCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import { COLORS, formatCompact, formatCurrency } from '../constants';

/**
 * Revenue Distribution — donut chart + per-category legend with amounts.
 */
const RevenueDistribution = ({ revenue_distribution = [], totalRevenue = 0 }) => {
  const theme = useTheme();

  return (
    <SectionCard
      icon={PieChartOutline}
      title="Revenue Distribution"
      color={theme.palette.primary.main}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
        <Box sx={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}>
          <ReusableDonutChart
            data={revenue_distribution.map((entry, i) => ({
              name: entry.category,
              value: entry.amount,
              color: COLORS[i % COLORS.length],
            }))}
            dataKey="value"
            height={150}
            innerRadius={52}
            outerRadius={70}
            paddingAngle={2}
            centerValue={formatCompact(totalRevenue)}
            centerTitle="Total Collected"
            valueFontSize={12.5}
            tooltipFormatter={(value) => formatCurrency(value)}
          />
        </Box>

        <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
          {revenue_distribution.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: COLORS[i % COLORS.length],
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 600 }}>
                {item.category}
              </Typography>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography variant="subtitle2" fontWeight={800} whiteSpace="nowrap">
                  {item.percentage}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {formatCurrency(item.amount)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </SectionCard>
  );
};

export default RevenueDistribution;
