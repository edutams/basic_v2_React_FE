import React from 'react';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import ParentCard from '@/components/shared/ParentCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import ReusableTrendChart from '@/components/shared/charts/ReusableTrendChart';
import { IconClipboardList, IconChartDonut, IconCalendarEvent } from '@tabler/icons';
import InsightsCard from '../../components/InsightsCard';
import {
  balanceSheetStatement,
  assetsComposition,
  liabilitiesEquityComposition,
  financialPositionTrend,
  balanceSheetInsights,
  balanceSheetStats,
  COLORS,
  formatCompact,
  formatNaira,
} from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

const SectionBand = ({ label, color }) => (
  <TableRow>
    <TableCell colSpan={3} sx={{ bgcolor: color, fontWeight: 700, fontSize: 13, py: 0.75, px: 1.25 }}>
      {label}
    </TableCell>
  </TableRow>
);

const BalanceSheetTab = () => {
  const theme = useTheme();
  const totalAssetsCheck = balanceSheetStats.totalAssets;

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Statement */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <ParentCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconClipboardList size={17} color={theme.palette.primary.main} />
                  <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Balance Sheet Statement</Typography>
                </Box>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>As at 31 Mar, 2026</Typography>
              </Box>
            }
            sx={{
              '& .MuiCardHeader-root': { pb: 1, pt: 1.5, px: 2 },
              '& .MuiCardContent-root': { p: 0, '&:last-child': { pb: 0 } },
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }}>
                  <TableCell sx={thCell}>Account Group</TableCell>
                  <TableCell sx={thCell} align="right">Amount (₦)</TableCell>
                  <TableCell sx={thCell} align="right">% of Total Assets</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <SectionBand label="A. ASSETS" color="#DBEAFE" />
                {balanceSheetStatement.assets.map((row) => (
                  <TableRow key={row.item} hover>
                    <TableCell sx={tdCell}>▸ &nbsp;{row.item}</TableCell>
                    <TableCell sx={tdCell} align="right">{row.amount.toLocaleString('en-NG')}</TableCell>
                    <TableCell sx={tdCell} align="right">{row.pct}%</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#DBEAFE' }}>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Assets</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatNaira(balanceSheetStats.totalAssets)}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">100.0%</TableCell>
                </TableRow>

                <SectionBand label="B. LIABILITIES" color="#FEE2E2" />
                {balanceSheetStatement.liabilities.map((row) => (
                  <TableRow key={row.item} hover>
                    <TableCell sx={tdCell}>▸ &nbsp;{row.item}</TableCell>
                    <TableCell sx={tdCell} align="right">{row.amount.toLocaleString('en-NG')}</TableCell>
                    <TableCell sx={tdCell} align="right">{row.pct}%</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#FEE2E2' }}>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Liabilities</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatNaira(balanceSheetStats.totalLiabilities)}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                    {((balanceSheetStats.totalLiabilities / totalAssetsCheck) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>

                <SectionBand label="C. EQUITY / NET ASSETS" color="#DCFCE7" />
                {balanceSheetStatement.equity.map((row) => (
                  <TableRow key={row.item} hover>
                    <TableCell sx={tdCell}>▸ &nbsp;{row.item}</TableCell>
                    <TableCell sx={tdCell} align="right">{row.amount.toLocaleString('en-NG')}</TableCell>
                    <TableCell sx={tdCell} align="right">{row.pct}%</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#DCFCE7' }}>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Equity (Net Assets)</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatNaira(balanceSheetStats.netAssets)}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                    {((balanceSheetStats.netAssets / totalAssetsCheck) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>

                <TableRow sx={{ borderTop: `2px solid ${theme.palette.divider}` }}>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Liabilities and Equity</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatNaira(totalAssetsCheck)}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">100.0%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ParentCard>
        </Grid>

        {/* Right column: composition donuts, then trend + insights, stacked under them */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* Assets composition */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconChartDonut size={17} color={theme.palette.primary.main} />
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>Assets Composition</Typography>
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 2 },
                  '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
                }}
              >
                <ReusableDonutChart
                  data={[
                    { name: 'Non-Current Assets', value: assetsComposition[0].value, color: COLORS.nonCurrentAssets },
                    { name: 'Current Assets', value: assetsComposition[1].value, color: COLORS.currentAssets },
                  ]}
                  height={140}
                  innerRadius={46}
                  outerRadius={64}
                  paddingAngle={2}
                  centerValue={formatCompact(balanceSheetStats.totalAssets)}
                  centerTitle="Total Assets"
                  valueFontSize={14}
                  tooltipFormatter={(value, name) => [formatNaira(value), name]}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  {assetsComposition.map((c, idx) => (
                    <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: idx === 0 ? COLORS.nonCurrentAssets : COLORS.currentAssets, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 11.5, fontWeight: 600, flexGrow: 1 }}>{c.name}</Typography>
                      <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: 'text.secondary' }}>
                        {formatCompact(c.value)} ({c.pct}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </ParentCard>
            </Grid>

            {/* Liabilities & Equity composition */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconChartDonut size={17} color={theme.palette.primary.main} />
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>Liabilities &amp; Equity</Typography>
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 2 },
                  '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
                }}
              >
                <ReusableDonutChart
                  data={[
                    { name: 'Total Liabilities', value: liabilitiesEquityComposition[0].value, color: COLORS.liabilities },
                    { name: 'Total Equity', value: liabilitiesEquityComposition[1].value, color: COLORS.equity },
                  ]}
                  height={140}
                  innerRadius={46}
                  outerRadius={64}
                  paddingAngle={2}
                  centerValue={formatCompact(totalAssetsCheck)}
                  centerTitle="Total Funds"
                  valueFontSize={14}
                  tooltipFormatter={(value, name) => [formatNaira(value), name]}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  {liabilitiesEquityComposition.map((c, idx) => (
                    <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: idx === 0 ? COLORS.liabilities : COLORS.equity, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 11.5, fontWeight: 600, flexGrow: 1 }}>{c.name}</Typography>
                      <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: 'text.secondary' }}>
                        {formatCompact(c.value)} ({c.pct}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </ParentCard>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconCalendarEvent size={17} color={theme.palette.primary.main} />
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Financial Position Trend (Last 4 Terms)</Typography>
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 2 },
                  '& .MuiCardContent-root': { p: 1.5, pt: 0.5, '&:last-child': { pb: 1 } },
                }}
              >
                <ReusableTrendChart
                  data={financialPositionTrend}
                  nameKey="term"
                  series={[
                    { dataKey: 'assets', name: 'Total Assets', color: COLORS.assets },
                    { dataKey: 'equity', name: 'Total Equity', color: COLORS.equity },
                    { dataKey: 'liabilities', name: 'Total Liabilities', color: COLORS.liabilities },
                  ]}
                  type="line"
                  height={230}
                  showDots
                  valueFormatter={formatCompact}
                  cardSx={{ border: 'none' }}
                />
              </ParentCard>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <InsightsCard items={balanceSheetInsights} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BalanceSheetTab;
