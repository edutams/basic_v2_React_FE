import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Payments,
  WarningAmber,
  TrendingUp,
  TableChart,
} from '@mui/icons-material';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import { Panel, SectionHeader, LegendItem, FooterLink } from '../common';
import { BLUE, GREEN, ORANGE, PURPLE, RED, formatCompact, num } from '../constants';
import MetricTile from './MetricTile';
import HBarChart from './HBarChart';

/**
 * Bursary Overview — summary tiles + revenue distribution, payment categories
 * and the class-level collection matrix.
 */
const BursaryOverviewPanel = ({
  bo,
  revenueDonut,
  paymentData,
  maxPayment,
  matrix,
  onSwitchRole,
  onFooterClick,
}) => {
  const theme = useTheme();

  return (
    <Panel>
      <SectionHeader
        icon={AccountBalanceWallet}
        title="Bursary Overview"
        color={theme.palette.success.main}
        action="Switch Role"
        onAction={onSwitchRole}
      />

      {/* Summary cards */}
      <Grid container spacing={2} mb={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            icon={AccountBalanceWallet}
            color={BLUE}
            label="Total Expected Income"
            value={formatCompact(bo.revenue_performance?.total_expected_income)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            icon={Payments}
            color={GREEN}
            label="Total Collected Income"
            value={formatCompact(bo.revenue_performance?.total_collected_income)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            icon={WarningAmber}
            color={ORANGE}
            label="Total Outstanding Balance"
            value={formatCompact(bo.revenue_performance?.total_outstanding_balance)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            icon={TrendingUp}
            color={PURPLE}
            label="Collection Efficiency"
            value={`${num(bo.revenue_performance?.collection_efficiency)}%`}
            sub="↑ 8.4%"
          />
        </Grid>
      </Grid>

      {/* 3-column: Revenue Distribution | Payment Categories | Class Matrix */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: '14px',
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: (t) =>
                t.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.07)',
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>
              Revenue Distribution
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: '52%' }}>
                <ReusableDonutChart
                  data={revenueDonut}
                  height={150}
                  centerValue={formatCompact(revenueDonut.reduce((s, d) => s + d.amount, 0))}
                  centerTitle="Total Collected"
                />
              </Box>
              <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                {revenueDonut.map((d) => (
                  <Box key={d.name}>
                    <LegendItem color={d.color} label={d.name} value={`${d.value}%`} />
                    <Typography variant="caption" sx={{ fontSize: 9.5, color: 'text.secondary', ml: 1.75, display: 'block' }}>
                      {formatCompact(d.amount)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: '14px',
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: (t) =>
                t.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.07)',
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>
              Payment Categories
            </Typography>
            <HBarChart
              data={paymentData}
              dataKey="amount"
              nameKey="name"
              color={GREEN}
              height={196}
              formatter={(v) => formatCompact(v)}
              domain={[0, maxPayment]}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 12, lg: 4 }}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: '14px',
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: (t) =>
                t.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.07)',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TableChart sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                Class-Level Collection Matrix
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Class', 'Expected', 'Collected', 'Outstanding', 'Rate'].map((h) => (
                      <TableCell
                        key={h}
                        sx={{ fontWeight: 800, fontSize: 9.5, color: 'text.secondary', borderBottom: (t) => `1px solid ${t.palette.divider}` }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matrix.map((row, i) => {
                    const rate = num(row.efficiency);
                    const rateColor = rate >= 75 ? GREEN : rate >= 60 ? ORANGE : RED;
                    return (
                      <TableRow key={i} hover sx={{ '&:last-of-type td': { borderBottom: 'none' } }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5 }}>{row.class}</TableCell>
                        <TableCell sx={{ fontSize: 10.5 }}>{formatCompact(row.expected_fees)}</TableCell>
                        <TableCell sx={{ fontSize: 10.5, fontWeight: 700, color: GREEN }}>
                          {formatCompact(row.collected_fees)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 10.5, color: 'error.main' }}>
                          {formatCompact(row.outstanding_fees)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 10.5, fontWeight: 800, color: rateColor }}>
                          {rate}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Grid>

      <FooterLink text="Go to Bursary Dashboard" onClick={onFooterClick} />
    </Panel>
  );
};

export default BursaryOverviewPanel;
