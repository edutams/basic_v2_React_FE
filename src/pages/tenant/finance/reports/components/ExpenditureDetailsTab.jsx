import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import ParentCard from '@/components/shared/ParentCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import ReusableAreaChart from '@/components/shared/charts/ReusableAreaChart';
import ReusableSparkline from '@/components/shared/charts/ReusableSparkline';
import { IconClipboardList, IconCalendarEvent, IconChevronRight, IconArrowUpRight, IconCircleCheck } from '@tabler/icons';
import InsightsCard from './InsightsCard';
import {
  expenditureByAccount,
  recentExpenditureTransactions,
  expenditureByCategory,
  expenditureTrend,
  expenditureDetailsInsights,
  EXPENSE_CATEGORY_META,
  formatCompact,
  formatNaira,
} from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

function formatDateDisplayLocal(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ExpenditureDetailsTab = () => {
  const theme = useTheme();
  const totalCategory = expenditureByCategory.reduce((sum, c) => sum + c.value, 0);

  return (
    <Grid container spacing={2}>
      {/* ===================== Left ===================== */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconClipboardList size={17} color={theme.palette.primary.main} />
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                Expenditure by Account (Chart of Accounts)
              </Typography>
            </Box>
          }
          sx={{
            '& .MuiCardHeader-root': { pb: 1, pt: 1.5, px: 2 },
            '& .MuiCardContent-root': { p: 0, '&:last-child': { pb: 0 } },
            mb: 2,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }}>
                <TableCell sx={thCell}>#</TableCell>
                <TableCell sx={thCell}>Expenditure Account</TableCell>
                <TableCell sx={thCell} align="right">Amount (₦)</TableCell>
                <TableCell sx={thCell} align="right">% of Total</TableCell>
                <TableCell sx={thCell} align="right">vs. Prior Term</TableCell>
                <TableCell sx={thCell}>Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenditureByAccount.map((row, idx) => {
                const meta = EXPENSE_CATEGORY_META[row.account];
                return (
                  <TableRow key={row.account} hover>
                    <TableCell sx={tdCell}>{idx + 1}</TableCell>
                    <TableCell sx={{ ...tdCell, fontWeight: 600 }}>{row.account}</TableCell>
                    <TableCell sx={tdCell} align="right">{row.amount.toLocaleString('en-NG')}</TableCell>
                    <TableCell sx={tdCell} align="right">{row.pctOfTotal}%</TableCell>
                    <TableCell sx={{ ...tdCell, color: '#B45309', fontWeight: 600 }} align="right">
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                        <IconArrowUpRight size={13} />+{row.vsPriorTerm}%
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...tdCell, width: 110 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 70 }}>
                          <ReusableSparkline
                            data={row.trend.map((v) => ({ v }))}
                            dataKey="v"
                            color={meta.color}
                            height={28}
                          />
                        </Box>
                        <IconChevronRight size={14} color={theme.palette.text.disabled} />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow sx={{ bgcolor: '#FEE2E2' }}>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} colSpan={2}>Total Expenditure</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                  {expenditureByAccount.reduce((s, r) => s + r.amount, 0).toLocaleString('en-NG')}
                </TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">100.0%</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800, color: '#B45309' }} align="right">+12.4%</TableCell>
                <TableCell sx={tdCell} />
              </TableRow>
            </TableBody>
          </Table>
        </ParentCard>

        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconCalendarEvent size={17} color={theme.palette.primary.main} />
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Recent Expenditure Transactions</Typography>
              </Box>
              <Button
                size="small"
                endIcon={<IconChevronRight size={14} />}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12.5 }}
              >
                View All Transactions
              </Button>
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
                <TableCell sx={thCell}>Date</TableCell>
                <TableCell sx={thCell}>Description / Purpose</TableCell>
                <TableCell sx={thCell}>Expenditure Account</TableCell>
                <TableCell sx={thCell} align="right">Amount (₦)</TableCell>
                <TableCell sx={thCell}>Vendor / Supplier</TableCell>
                <TableCell sx={thCell}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentExpenditureTransactions.map((row) => (
                <TableRow key={`${row.date}-${row.description}`} hover>
                  <TableCell sx={{ ...tdCell, color: 'text.secondary' }}>{formatDateDisplayLocal(row.date)}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 600 }}>{row.description}</TableCell>
                  <TableCell sx={tdCell}>{row.account}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 700 }} align="right">{row.amount.toLocaleString('en-NG')}</TableCell>
                  <TableCell sx={tdCell}>{row.vendor}</TableCell>
                  <TableCell sx={tdCell}>
                    <Chip
                      label={row.status}
                      size="small"
                      icon={<IconCircleCheck size={12} />}
                      sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: 11, height: 22 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ParentCard>
      </Grid>

      {/* ===================== Right ===================== */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <ParentCard
            title={<Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Expenditure by Category</Typography>}
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
              '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
            }}
          >
            <ReusableDonutChart
              data={expenditureByCategory.map((c) => ({
                name: c.name,
                value: c.value,
                color: EXPENSE_CATEGORY_META[c.name].color,
              }))}
              height={150}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              centerValue={formatCompact(totalCategory)}
              centerTitle="Total Expenditure"
              valueFontSize={15}
              tooltipFormatter={(value, name) => [formatNaira(value), name]}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
              {expenditureByCategory.map((c) => {
                const meta = EXPENSE_CATEGORY_META[c.name];
                const pct = ((c.value / totalCategory) * 100).toFixed(0);
                return (
                  <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: meta.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 600, flexGrow: 1 }}>
                      {c.name} ({pct}%)
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
                      {formatCompact(c.value)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </ParentCard>

          <ParentCard
            title={<Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Expenditure Trend (Last 7 Terms)</Typography>}
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
              '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1 } },
            }}
          >
            <ReusableAreaChart
              data={expenditureTrend}
              nameKey="term"
              dataKey="expenditure"
              name="Expenditure"
              color={theme.palette.error.main}
              height={180}
              showLabels={false}
              valueFormatter={formatCompact}
            />
          </ParentCard>

          <InsightsCard items={expenditureDetailsInsights} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default ExpenditureDetailsTab;
