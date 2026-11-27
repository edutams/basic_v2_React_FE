import React, { useMemo, useState } from 'react';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableHead, TableRow, Collapse, Skeleton, useTheme } from '@mui/material';
import ParentCard from '@/components/shared/ParentCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import ReusableTrendChart from '@/components/shared/charts/ReusableTrendChart';
import { IconClipboardList, IconChartDonut, IconCalendarEvent, IconChevronRight } from '@tabler/icons';
import InsightsCard from '../../components/InsightsCard';
import { COLORS, formatCompact, formatNaira } from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

const SectionBand = ({ label, color }) => (
  <TableRow>
    <TableCell colSpan={3} sx={{ bgcolor: color, fontWeight: 700, fontSize: 13, py: 0.75, px: 1.25 }}>
      {label}
    </TableCell>
  </TableRow>
);

const StatementRowsSkeleton = ({ rows = 2 }) => (
  <>
    {Array.from({ length: rows }).map((_, idx) => (
      <TableRow key={idx}>
        <TableCell sx={tdCell}>
          <Skeleton variant="text" width="70%" />
        </TableCell>
        <TableCell sx={tdCell} align="right">
          <Skeleton variant="text" width="60%" sx={{ ml: 'auto' }} />
        </TableCell>
        <TableCell sx={tdCell} align="right">
          <Skeleton variant="text" width="40%" sx={{ ml: 'auto' }} />
        </TableCell>
      </TableRow>
    ))}
  </>
);

function buildInsights(summary) {
  if (!summary) return [];
  const insights = [];

  if (summary.total_assets_change_pct !== null && summary.total_assets_change_pct !== undefined) {
    insights.push(`Total assets ${summary.total_assets_change_pct >= 0 ? 'increased' : 'decreased'} by ${Math.abs(summary.total_assets_change_pct)}% to ${formatNaira(summary.total_assets)}.`);
  } else {
    insights.push(`Total assets are ${formatNaira(summary.total_assets)} as at the selected period.`);
  }

  if (summary.total_liabilities_change_pct !== null && summary.total_liabilities_change_pct !== undefined) {
    insights.push(`Total liabilities ${summary.total_liabilities_change_pct >= 0 ? 'increased' : 'decreased'} by ${Math.abs(summary.total_liabilities_change_pct)}% to ${formatNaira(summary.total_liabilities)}.`);
  }

  if (summary.total_equity_change_pct !== null && summary.total_equity_change_pct !== undefined) {
    insights.push(`Net assets (equity) ${summary.total_equity_change_pct >= 0 ? 'grew' : 'shrank'} by ${Math.abs(summary.total_equity_change_pct)}% to ${formatNaira(summary.total_equity)}.`);
  }

  if (summary.current_ratio !== null && summary.current_ratio !== undefined) {
    insights.push(`Current ratio is ${summary.current_ratio}:1, ${summary.current_ratio >= 1 ? 'indicating a healthy liquidity position' : 'indicating a potential liquidity risk'}.`);
  }

  return insights;
}

const BalanceSheetTab = ({ data, loading }) => {
  const theme = useTheme();
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (key) => setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));

  const summary = data?.summary;
  const assetsRows = data?.statement?.assets || [];
  const liabilitiesRows = data?.statement?.liabilities || [];
  const equityRows = data?.statement?.equity || [];
  const assetsComposition = (data?.assets_composition || []).filter((c) => c.value !== 0);
  const liabilitiesEquityComposition = data?.liabilities_equity_composition || [];
  // BalanceSheetTab wants only the last 4 of the shared 7-term trend array.
  const trend = (data?.trend || []).slice(-4);

  const totalAssets = summary?.total_assets ?? 0;
  const totalLiabilitiesAndEquity = (summary?.total_liabilities ?? 0) + (summary?.total_equity ?? 0);

  const insights = useMemo(() => buildInsights(summary), [summary]);

  const renderGroupRow = (row, key) => {
    const accounts = row.accounts || [];
    const hasAccounts = accounts.length > 0;
    const isOpen = !!expandedRows[key];

    return (
      <React.Fragment key={key}>
        <TableRow hover sx={hasAccounts ? { cursor: 'pointer' } : undefined} onClick={hasAccounts ? () => toggleRow(key) : undefined}>
          <TableCell sx={tdCell}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {hasAccounts ? (
                <IconChevronRight
                  size={14}
                  style={{ transition: 'transform 0.15s ease', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}
                />
              ) : (
                <Box sx={{ width: 14, flexShrink: 0 }} />
              )}
              <span>{row.item}</span>
            </Box>
          </TableCell>
          <TableCell sx={tdCell} align="right">{row.amount.toLocaleString('en-NG')}</TableCell>
          <TableCell sx={tdCell} align="right">{row.pct}%</TableCell>
        </TableRow>
        {hasAccounts && (
          <TableRow>
            <TableCell colSpan={3} sx={{ p: 0, border: 0 }}>
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Box
                  sx={{
                    pl: 4.5,
                    pr: 1.25,
                    py: 0.75,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#FAFBFC',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {accounts.map((a) => (
                    <Box key={a.name} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{a.name}</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{formatNaira(a.balance)}</Typography>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

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
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>As at {data?.period?.label || 'selected period'}</Typography>
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
                {loading ? <StatementRowsSkeleton /> : assetsRows.map((row) => renderGroupRow(row, `assets-${row.item}`))}
                <TableRow sx={{ bgcolor: '#DBEAFE' }}>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Assets</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatNaira(totalAssets)}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">100.0%</TableCell>
                </TableRow>

                <SectionBand label="B. LIABILITIES" color="#FEE2E2" />
                {loading ? <StatementRowsSkeleton /> : liabilitiesRows.map((row) => renderGroupRow(row, `liabilities-${row.item}`))}
                <TableRow sx={{ bgcolor: '#FEE2E2' }}>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Liabilities</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatNaira(summary?.total_liabilities ?? 0)}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                    {totalAssets > 0 ? ((summary?.total_liabilities ?? 0) / totalAssets * 100).toFixed(1) : '0.0'}%
                  </TableCell>
                </TableRow>

                <SectionBand label="C. EQUITY / NET ASSETS" color="#DCFCE7" />
                {loading ? <StatementRowsSkeleton rows={1} /> : equityRows.map((row) => renderGroupRow(row, `equity-${row.item}`))}
                <TableRow sx={{ bgcolor: '#DCFCE7' }}>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Equity (Net Assets)</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatNaira(summary?.total_equity ?? 0)}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                    {totalAssets > 0 ? ((summary?.total_equity ?? 0) / totalAssets * 100).toFixed(1) : '0.0'}%
                  </TableCell>
                </TableRow>

                <TableRow sx={{ borderTop: `2px solid ${theme.palette.divider}` }}>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Liabilities and Equity</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatNaira(totalLiabilitiesAndEquity)}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                    {totalAssets > 0 ? (totalLiabilitiesAndEquity / totalAssets * 100).toFixed(1) : '0.0'}%
                  </TableCell>
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
                {loading ? (
                  <Box sx={{ minHeight: 220 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Skeleton variant="circular" width={128} height={128} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Skeleton variant="text" width="70%" />
                      <Skeleton variant="text" width="55%" />
                    </Box>
                  </Box>
                ) : assetsComposition.length === 0 ? (
                  <Box sx={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>No assets posted yet.</Typography>
                  </Box>
                ) : (
                  <>
                    <ReusableDonutChart
                      data={[
                        { name: 'Non-Current Assets', value: assetsComposition[0]?.value ?? 0, color: COLORS.nonCurrentAssets },
                        { name: 'Current Assets', value: assetsComposition[1]?.value ?? 0, color: COLORS.currentAssets },
                      ]}
                      height={140}
                      innerRadius={46}
                      outerRadius={64}
                      paddingAngle={2}
                      centerValue={formatCompact(totalAssets)}
                      centerTitle="Total Assets"
                      valueFontSize={14}
                      tooltipFormatter={(value, name) => [formatNaira(value), name]}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                      {(data?.assets_composition || []).map((c, idx) => (
                        <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: idx === 0 ? COLORS.nonCurrentAssets : COLORS.currentAssets, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: 11.5, fontWeight: 600, flexGrow: 1 }}>{c.name}</Typography>
                          <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: 'text.secondary' }}>
                            {formatCompact(c.value)} ({totalAssets > 0 ? (c.value / totalAssets * 100).toFixed(1) : 0}%)
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
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
                {loading ? (
                  <Box sx={{ minHeight: 220 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Skeleton variant="circular" width={128} height={128} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Skeleton variant="text" width="70%" />
                      <Skeleton variant="text" width="55%" />
                    </Box>
                  </Box>
                ) : (
                  <>
                    <ReusableDonutChart
                      data={[
                        { name: 'Total Liabilities', value: liabilitiesEquityComposition[0]?.value ?? 0, color: COLORS.liabilities },
                        { name: 'Total Equity', value: liabilitiesEquityComposition[1]?.value ?? 0, color: COLORS.equity },
                      ]}
                      height={140}
                      innerRadius={46}
                      outerRadius={64}
                      paddingAngle={2}
                      centerValue={formatCompact(totalLiabilitiesAndEquity)}
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
                            {formatCompact(c.value)} ({totalLiabilitiesAndEquity > 0 ? (c.value / totalLiabilitiesAndEquity * 100).toFixed(1) : 0}%)
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
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
                {loading ? (
                  <Box sx={{ height: 230, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.25, px: 1 }}>
                    {[85, 65, 75, 50, 70].map((w, idx) => (
                      <Skeleton key={idx} variant="text" width={`${w}%`} height={18} />
                    ))}
                  </Box>
                ) : (
                  <ReusableTrendChart
                    data={trend}
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
                )}
              </ParentCard>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <InsightsCard items={insights} loading={loading} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BalanceSheetTab;
