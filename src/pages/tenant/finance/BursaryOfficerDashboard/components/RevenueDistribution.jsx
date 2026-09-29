import React from 'react';
import { Box, Typography, Stack, useTheme } from '@mui/material';
import { PieChartOutline } from '@mui/icons-material';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import { COLORS, formatCompact, formatCurrency } from '../constants';

/**
 * Revenue Distribution — donut chart + per-category legend with amounts.
 */
const RevenueDistribution = ({
  revenue_distribution = [],
  totalRevenue = 0,
  onClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const distData = revenue_distribution;
  const distTotal = distData.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 480,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '14px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1',
        bgcolor: isDark ? theme.palette.background.paper : '#fff',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        '&:hover': onClick
          ? { boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 16px 32px rgba(15, 23, 42, 0.12)', transform: 'translateY(-2px)' }
          : {},
      }}
      onClick={onClick}
    >
      {/* Header */}
      <Box
        sx={{
          px: 1,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: '#EBF5FF',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PieChartOutline sx={{ fontSize: 17 }} />
          </Box>
          <Typography fontWeight={800} sx={{ fontSize: '0.75rem', color: '#111827', letterSpacing: 0.3 }}>
            REVENUE DISTRIBUTION
          </Typography>
        </Box>


      </Box>
      <Box sx={{ mx: 1, borderTop: '1px solid #E5E7EB' }} />

      {/* Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 1, flexGrow: 1, minHeight: 0 }}>
        {distData.length > 0 ? (
          <>
            <Box sx={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}>
              <ReusableDonutChart
                data={distData.map((entry, i) => ({
                  name: entry.category,
                  value: entry.amount,
                  color: COLORS[i % COLORS.length],
                }))}
                dataKey="value"
                height={150}
                innerRadius={52}
                outerRadius={70}
                paddingAngle={2}
                centerValue={formatCompact(totalRevenue || distTotal)}
                centerTitle="Total Revenue"
                valueFontSize={12.5}
                tooltipFormatter={(value) => formatCurrency(value)}
              />
            </Box>

            <Box
              sx={{
                width: '100%',
                minWidth: 0,
                maxHeight: 140,
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#d1d5db', borderRadius: 4 },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              }}
            >
              <Stack spacing={1}>
                {distData.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: COLORS[i % COLORS.length],
                        flexShrink: 0,
                        mt: 0.45,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.3 }}>
                        {item.category}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                        <Typography fontWeight={800} whiteSpace="nowrap" sx={{ flex: '1 1 0%', fontSize: '0.7rem', lineHeight: 1.4 }}>
                          {formatCurrency(item.amount)}
                        </Typography>
                        <Typography color="text.secondary" sx={{ flex: '1 1 0%', fontSize: '0.58rem' }}>
                          ({item.percentage}%)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </>
        ) : (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No revenue distribution data available
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer link — centered in a box */}
      <Box
        sx={{
          mx: 2.5,
          mb: 2,
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.75,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#F9FAFB',
            borderColor: '#2563EB',
          },
        }}
      >
        <Typography
          sx={{
            fontSize: '0.7rem',
            color: '#2563EB',
            fontWeight: 700,
          }}
        >
          View Detailed Revenue Analysis
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700 }}>
          →
        </Typography>
      </Box>
    </Box>
  );
};

export default RevenueDistribution;
