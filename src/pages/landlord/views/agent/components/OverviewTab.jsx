import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  Box,
  Typography,
  Stack,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Alert,
  Skeleton,
  FormControl,
  Select,
  InputLabel,
} from '@mui/material';
import Chart from 'react-apexcharts';
import {
  IconFilter,
  IconChartBar,
  IconHelpCircle,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import ReusablePieChart from '@/components/shared/charts/ReusablePieChart';
import agentApi from '@/api/landlord/organizations/agent';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];



const agentColumnHelper = createColumnHelper();
const schoolColumnHelper = createColumnHelper();

const OverviewTab = ({ data }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const open = Boolean(anchorEl);

  // Transaction chart filters
  const [period, setPeriod] = useState('this_year');
  const [periodValue, setPeriodValue] = useState(null);
  const [chartData, setChartData] = useState({ categories: [], series: [] });
  const [chartLoading, setChartLoading] = useState(true);

  const orgId = data?.raw?.id ?? data?.raw?.organization_id ?? null;

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // ── Transaction chart fetch ──────────────────────────────────────
  const fetchChartData = useCallback(async () => {
    if (!orgId) return;
    setChartLoading(true);
    try {
      const params = { period };
      if (period === 'today' && periodValue) {
        params.periodValue = periodValue;
      } else if (period === 'this_week' && periodValue) {
        params.periodValue = JSON.stringify(periodValue);
      } else if (period === 'this_month' && periodValue) {
        params.periodValue = JSON.stringify(periodValue);
      } else if (period === 'this_year' && periodValue) {
        params.periodValue = periodValue;
      }
      const res = await agentApi.getTransactionChart(orgId, params);
      if (res.status && res.data) {
        setChartData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch chart data', err);
    } finally {
      setChartLoading(false);
    }
  }, [orgId, period, periodValue]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // ── Top Agents columns ──────────────────────────────────────────────
  const agentColumns = useMemo(
    () => [
      agentColumnHelper.display({
        id: 's_n',
        header: () => 'S/N',
        cell: (info) => (
          <Typography variant="body2" color="textSecondary" fontWeight={400}>
            {info.row.index + 1}
          </Typography>
        ),
      }),
      agentColumnHelper.accessor('name', {
        header: () => 'Name',
        cell: (info) => {
          const row = info.row.original;
          const initials = (row.name || 'NA')
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
          return (
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar
                sx={{
                  color: theme.palette.primary.main,
                  bgcolor: theme.palette.primary.light,
                  width: 34,
                  height: 34,
                  fontSize: '11px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  fontSize={12}
                  sx={{ lineHeight: 1.3 }}
                >
                  {row.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block', lineHeight: 1.4 }}
                >
                  {row.handle} | {row.location}
                </Typography>
              </Box>
            </Stack>
          );
        },
      }),
      agentColumnHelper.accessor('level', {
        header: () => 'Level',
        cell: (info) => (
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              borderRadius: '4px',
              px: 1.5,
              py: 0.3,
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {info.getValue()}
          </Box>
        ),
      }),
      agentColumnHelper.accessor('transaction', {
        header: () => 'Transaction',
        cell: (info) => (
          <Typography variant="body2" fontWeight={700} color="textPrimary" fontSize={12}>
            #{info.getValue()}
          </Typography>
        ),
      }),
      agentColumnHelper.display({
        id: 'action',
        header: () => 'Action',
        cell: (info) => (
          <IconButton size="small" onClick={(e) => handleMenuClick(e, info.row.original)}>
            <IconDotsVertical size={18} color={theme.palette.text.secondary} />
          </IconButton>
        ),
      }),
    ],
    [theme],
  );

  // ── Top Schools columns ─────────────────────────────────────────────
  const schoolColumns = useMemo(
    () => [
      schoolColumnHelper.display({
        id: 's_n',
        header: () => 'S/N',
        cell: (info) => (
          <Typography variant="body2" color="textSecondary" fontWeight={400}>
            {info.row.index + 1}
          </Typography>
        ),
      }),
      schoolColumnHelper.accessor('school', {
        header: () => 'School Name',
        cell: (info) => (
          <Typography variant="subtitle2" fontWeight={800} color="textPrimary" fontSize={12}>
            {info.getValue()}
          </Typography>
        ),
      }),
      schoolColumnHelper.accessor('agent', {
        header: () => 'Agent Detail',
        cell: (info) => {
          const row = info.row.original;
          const initials = (row.agent || 'NA')
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
          return (
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'primary.main',
                  bgcolor: 'primary.light',
                  flexShrink: 0,
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ lineHeight: 1.3 }}
                  fontSize={12}
                >
                  {row.agent}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block', lineHeight: 1.4 }}
                >
                  {row.handle}
                </Typography>
              </Box>
            </Stack>
          );
        },
      }),
      schoolColumnHelper.accessor('transaction', {
        header: () => 'Transaction',
        cell: (info) => (
          <Typography variant="body2" fontWeight={700} color="textPrimary" fontSize={12}>
            ₦{info.getValue()}
          </Typography>
        ),
      }),
      schoolColumnHelper.display({
        id: 'action',
        header: () => 'Action',
        cell: (info) => (
          <IconButton size="small" onClick={(e) => handleMenuClick(e, info.row.original)}>
            <IconDotsVertical size={18} color={theme.palette.text.secondary} />
          </IconButton>
        ),
      }),
    ],
    [theme],
  );

  const agentTable = useReactTable({
    data: data.topAgents,
    columns: agentColumns,
    getCoreRowModel: getCoreRowModel(),
  });
  const schoolTable = useReactTable({
    data: data.topRevenueSchools,
    columns: schoolColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const revenueOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      toolbar: { show: false },
      stacked: false,
      fontFamily: "'DM Sans', sans-serif",
      background: 'transparent',
    },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: chartData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary, fontSize: '12px' } },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '12px' },
        formatter: (val) => {
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
          return val.toLocaleString();
        },
      },
    },
    colors: ['#2563EB', '#F59E0B'],
    fill: { opacity: 1 },
    legend: { show: true, position: 'top', horizontalAlign: 'right' },
    tooltip: {
      shared: true,
      intersect: false,
      theme: isDarkMode ? 'dark' : 'light',
      y: { formatter: (val) => `₦${val.toLocaleString()}` },
    },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
  }), [chartData.categories, theme.palette.text.secondary, theme.palette.divider, isDarkMode]);

  const revenueSeries = useMemo(() => chartData.series, [chartData.series]);

  const planDistribution = data.planDistribution ?? [];
  const planSeries = planDistribution.map((p) => p.total ?? 0);
  const planLabels = planDistribution.map((p) => p.label ?? '');
  const planColors = ['#EC468C', '#7987FF', '#FFA5CB', '#8B48E3', '#4CAF50', '#FF9800'];

  return (
    <Box sx={{ p: { xs: 1, md: 1.5 } }}>
      {/* alignItems: 'flex-start' — without it, Grid's default stretch makes
          the shorter Recent Onboarding / Credit Facilities+Plan cards match
          the tall Transaction chart's height, leaving a large dead blank
          area at the bottom of each shorter card. */}
      <Grid container spacing={1.5} alignItems="flex-start">
        {/* Column 1: Transaction Chart */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              px: '3px',
              py: '3px',
              borderRadius: '14px',
              bgcolor: isDarkMode ? theme.palette.background.paper : '#ffffff',
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: '#94a3b8',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800} sx={{ color: theme.palette.text.primary }}>
                Transaction
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select value={period} onChange={(e) => { setPeriod(e.target.value); setPeriodValue(null); }}>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="this_week">This Week</MenuItem>
                    <MenuItem value="this_month">This Month</MenuItem>
                    <MenuItem value="this_year">This Year</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>
            <Box
              sx={{
                '& .apexcharts-canvas': { background: 'transparent !important' },
                '& .apexcharts-svg': { background: 'transparent !important' },
              }}
            >
              {chartLoading ? (
                <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />
              ) : (
                <Chart
                  key={`chart-${period}-${JSON.stringify(chartData.categories)}`}
                  options={revenueOptions}
                  series={revenueSeries}
                  type="bar"
                  height={320}
                  width="100%"
                />
              )}
            </Box>
          </Card>
        </Grid>

        {/* Column 2: Credit Facilities + Plan Distribution side by side, with
            Recent Onboarding School spanning the full width beneath both. */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={1.5}>
            {/* Credit Facilities Card */}
            <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                px: '3px',
                py: '3px',
                borderRadius: '14px',
                bgcolor: isDarkMode ? theme.palette.background.paper : '#ffffff',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#94a3b8',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                },
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header Section */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      fontSize: '14px',
                      letterSpacing: '0.2px',
                    }}
                  >
                    Credit Facilities
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 0.6,
                    background: schemeMap[1].bg,
                    borderRadius: '4px',
                    display: 'flex',
                    color: schemeMap[1].color,
                  }}
                >
                  <IconChartBar size={18} strokeWidth={2.5} />
                </Box>
              </Box>

              {/* Content Section */}
              <Box sx={{  display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    flex: 1.8,
                    bgcolor: schemeMap[1].bg,
                    borderRadius: '4px',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '100px',
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    sx={{
                      color: theme.palette.text.primary,
                      mb: 1,
                      fontSize: '12px',
                      letterSpacing: '0.1px',
                    }}
                  >
                    Total Credit
                  </Typography>
                  <Typography
                    fontWeight={800}
                    sx={{
                      color: schemeMap[1].color,
                      fontSize: '18px',
                      lineHeight: 1,
                      wordBreak: 'break-word',
                    }}
                  >
                    ₦ 100,000,000
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    fontWeight={800}
                    sx={{ color: theme.palette.text.primary, fontSize: '28px', lineHeight: 1 }}
                  >
                    1,000
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                      fontSize: '14px',
                      mt: 0.5,
                    }}
                  >
                    Schools
                  </Typography>
                </Box>
              </Box>
            </Card>
            </Grid>

            {/* Plan Distribution Card */}
            <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                px: '3px',
                py: '3px',
                borderRadius: '14px',
                bgcolor: isDarkMode ? theme.palette.background.paper : '#ffffff',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#94a3b8',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                },
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                color: theme.palette.mode === 'dark' ? '#fff' : '#1E3A5F',
              }}
            >
              {/* Header Section */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      fontSize: '14px',
                      letterSpacing: '0.2px',
                    }}
                  >
                    Plan Distribution
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.3, lineHeight: 1.3 }}
                  >
                    Breakdown of active subscriptions by plan type across all schools.
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 0.6,
                    background: schemeMap[3].bg,
                    borderRadius: '4px',
                    display: 'flex',
                    color: schemeMap[3].color,
                    flexShrink: 0,
                  }}
                >
                  <IconChartBar size={18} strokeWidth={2.5} />
                </Box>
              </Box>

              {/* Chart Section */}
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                {planSeries.length > 0 ? (
                  <ReusablePieChart
                    series={planSeries}
                    colors={planColors}
                    labels={planLabels}
                    height={140}
                    hideCard
                  />
                ) : (
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <Skeleton variant="circular" width={120} height={120} />
                    <Skeleton variant="text" width="60%" height={14} />
                    <Skeleton variant="text" width="40%" height={14} />
                  </Box>
                )}
              </Box>
            </Card>
            </Grid>

            {/* Recent Onboarding School — spans the full width beneath both
                cards above, with its own internal scroll since this list
                only grows over time. */}
            <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '14px',
              bgcolor: isDarkMode ? theme.palette.background.paper : '#ffffff',
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              px: "3px",
              py: "3px",
            }}
          >
            <Box sx={{ px: 1, pt: 1 }}>
              <Typography variant="subtitle2" fontWeight={800} color="textPrimary">
                Recent Onboarding School
              </Typography>
            </Box>
            {/* Fixed height + internal scroll — this list only grows, and we
                don't want the card itself to keep growing with it. */}
            <TableContainer sx={{ maxHeight: 260, overflowY: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead
                  sx={{ bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC' }}
                >
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        fontSize: '11px',
                        color: theme.palette.text.secondary,
                        bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC',
                        width: '45%',
                      }}
                    >
                      School
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        fontSize: '11px',
                        color: theme.palette.text.secondary,
                        bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC',
                      }}
                    >
                      Agent
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        fontSize: '11px',
                        color: theme.palette.text.secondary,
                        bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC',
                      }}
                    >
                      Date
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recentOnboarding.length > 0 ? (
                    data.recentOnboarding.map((row, idx) => (
                      <TableRow
                        key={idx}
                        sx={{
                          '&:nth-of-type(odd)': {
                            bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC',
                          },
                          '& td': { borderBottom: `1px solid ${theme.palette.divider}` },
                        }}
                      >
                        <TableCell sx={{ whiteSpace: 'normal' }}>
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            sx={{
                              color: theme.palette.text.primary,
                              fontSize: '11px',
                              wordBreak: 'break-word',
                            }}
                          >
                            {row.school}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            gap={1}
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                fontWeight={800}
                                sx={{
                                  color: theme.palette.text.primary,
                                  fontSize: '10px',
                                  display: 'block',
                                }}
                              >
                                {row.agent}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: theme.palette.text.secondary, fontSize: '9px' }}
                              >
                                {row.handle}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.created_at}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '9px',
                              fontWeight: 700,
                              bgcolor: isDarkMode ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
                              color: isDarkMode ? '#4ade80' : '#166534',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 2 }}>
                        <Alert
                          severity="info"
                          sx={{ justifyContent: 'center', textAlign: 'center' }}
                        >
                          No schools onboarded yet.
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Bottom Row: Top Agents */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '14px',
              bgcolor: isDarkMode ? theme.palette.background.paper : '#ffffff',
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ px: "2px" }}>
              <Typography variant="subtitle1" fontWeight={800} color="textPrimary">
                TOP 10 AGENT BY REVENUE
              </Typography>
            </Box>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  {agentTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      sx={{ bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC' }}
                    >
                      {headerGroup.headers.map((header) => (
                        <TableCell
                          key={header.id}
                          sx={{
                            fontWeight: 700,
                            fontSize: '12px',
                            color: theme.palette.text.secondary,
                            py: 1.2,
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody>
                  {agentTable.getRowModel().rows.length > 0 ? (
                    agentTable.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{ '& td': { borderBottom: `1px solid ${theme.palette.divider}` } }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={agentTable.getAllColumns().length}
                        align="center"
                        sx={{ py: 4, color: theme.palette.text.secondary }}
                      >
                        No agent revenue data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Bottom Row: Top Schools */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '14px',
              bgcolor: isDarkMode ? theme.palette.background.paper : '#ffffff',
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Box
              sx={{
                px: "3px",
                py: "3px",
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="subtitle1" fontWeight={800} color="textPrimary">
                TOP SCHOOLS BY REVENUE
              </Typography>
              <IconChartBar size={20} color={theme.palette.text.secondary} />
            </Box>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  {schoolTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      sx={{ bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC' }}
                    >
                      {headerGroup.headers.map((header) => (
                        <TableCell
                          key={header.id}
                          sx={{
                            fontWeight: 700,
                            fontSize: '12px',
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody>
                  {schoolTable.getRowModel().rows.length > 0 ? (
                    schoolTable.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{ '& td': { borderBottom: `1px solid ${theme.palette.divider}` } }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={schoolTable.getAllColumns().length}
                        align="center"
                        sx={{ py: 4, color: theme.palette.text.secondary }}
                      >
                        No school revenue data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: '8px',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.shadows[3],
            minWidth: 150,
            '& .MuiMenuItem-root': {
              fontSize: '14px',
              fontWeight: 600,
              color: theme.palette.text.secondary,
              py: 1,
              px: 2,
              '&:hover': {
                bgcolor: isDarkMode ? theme.palette.action.hover : '#F8FAFC',
                color: theme.palette.primary.main,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <IconEye size={18} />
          </ListItemIcon>
          <ListItemText primary="View Detail" />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText primary="Edit Record" />
        </MenuItem>
        <MenuItem
          onClick={handleMenuClose}
          sx={{ color: `${theme.palette.error.main} !important` }}
        >
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <IconTrash size={18} />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Help FAB */}
      <IconButton
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#22C55E',
          color: 'white',
          width: 56,
          height: 56,
          boxShadow: '0 8px 16px rgba(34, 197, 94, 0.4)',
          '&:hover': { bgcolor: '#16A34A', boxShadow: '0 12px 20px rgba(34, 197, 94, 0.5)' },
        }}
      >
        <IconHelpCircle size={32} />
      </IconButton>
    </Box>
  );
};

export default OverviewTab;
