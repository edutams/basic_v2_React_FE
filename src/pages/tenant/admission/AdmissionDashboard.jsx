import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  HowToReg as HowToRegIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PersonOff as PersonOffIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningAmberIcon,
  InfoOutlined as InfoOutlinedIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FileDownload as ExportIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import Chart from 'react-apexcharts';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import admissionOverviewApi from '@/api/tenant/admission-overview/admissionOverviewApi';
import { fetchAllAdmissionBatches } from '@/api/tenant/admission/admissionProcessingApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Admission Dashboard' }];

// Fixed, CEO-approved series colors — matches the mockup exactly, reused
// consistently across the stat cards, trend chart, donut and funnel so the
// same metric is always the same color everywhere on the page.
const COLOR = {
  applications: '#2563EB',
  admitted: '#16A34A',
  pending: '#D97706',
  declined: '#DC2626',
  accepted_offers: '#9333EA',
};

const STATUS_DONUT_COLORS = [COLOR.admitted, COLOR.pending, COLOR.declined, COLOR.accepted_offers];

// ParentCard only renders a single `title` node — no separate subtitle slot —
// so a two-line header is composed here instead of passed as a second prop.
const cardTitle = (title, subtitle) => (
  <Box>
    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

// Shared tight-padding override — every ParentCard on this page uses it so
// none of them carry the library's default (much larger) header/content
// padding.
const tightCardSx = {
  '& .MuiCardHeader-root': {
    pb: 0.5,
    pt: 1,
    px: 1,
    '& .MuiCardHeader-action': { m: 0, alignSelf: 'center' },
  },
  '& .MuiCardContent-root': { p: 1, '&:last-child': { pb: 1 } },
};

// Fixed per-row heights so every card in a row matches. Content shorter
// than the card (a chart with few data points, a sparse table) is
// vertically CENTERED rather than left pinned to the top — that's what
// turns "dead space stuck at the bottom" into evenly-balanced padding —
// and anything that's somehow still too tall scrolls internally rather
// than stretching the card.
const cardBodySx = (height) => ({
  ...tightCardSx,
  height,
  display: 'flex',
  flexDirection: 'column',
  '& .MuiCardContent-root': {
    ...tightCardSx['& .MuiCardContent-root'],
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
});

const INSIGHT_ICON = {
  positive: { icon: TrendingUpIcon, color: '#16A34A', bg: '#DCFCE7' },
  warning: { icon: WarningAmberIcon, color: '#D97706', bg: '#FEF3C7' },
  info: { icon: InfoOutlinedIcon, color: '#2563EB', bg: '#DBEAFE' },
};

// Bespoke, compact card matching the design exactly — icon + label on one
// row, the big count, then a trend row that's ALWAYS rendered (even with
// no comparison data) so every card in the row stays the same height and
// stays aligned, regardless of which metrics happen to have a prior
// session to compare against.
const AdmissionStatCard = ({ label, count, icon: Icon, color, changePct, loading, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const hasChange = changePct !== null && changePct !== undefined;
  const up = hasChange && changePct >= 0;

  if (loading) {
    return (
      <Box
        sx={{
          p: 1,
          borderRadius: 2,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          bgcolor: 'background.paper',
          height: '100%',
        }}
      >
        <Skeleton variant="circular" width={32} height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="80%" />
      </Box>
    );
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s, transform 0.15s',
        '&:hover': onClick
          ? { boxShadow: '0 4px 10px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' }
          : undefined,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: `${color}1A`,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 16 }} />
        </Box>
        <Typography variant="caption" fontWeight={600} color="text.secondary" noWrap>
          {label}
        </Typography>
      </Stack>

      <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2 }}>
        {count}
      </Typography>

      <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mt: 0.25, flexWrap: 'wrap' }}>
        {hasChange ? (
          <>
            {up ? (
              <ArrowUpwardIcon sx={{ fontSize: 12, color: 'success.main' }} />
            ) : (
              <ArrowDownwardIcon sx={{ fontSize: 12, color: 'error.main' }} />
            )}
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: up ? 'success.main' : 'error.main', fontSize: '0.7rem' }}
            >
              {Math.abs(changePct)}%
            </Typography>
          </>
        ) : null}
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
          vs same period last session
        </Typography>
      </Stack>
    </Box>
  );
};

const AdmissionDashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({
    compare_sessions: '5',
    admission_batch_id: '',
    class_id: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Filter options (independent of the overview payload itself) ──────
  useEffect(() => {
    fetchAllAdmissionBatches()
      .then((res) => setBatches(Array.isArray(res) ? res : (res?.data ?? [])))
      .catch(() => setBatches([]));
    admissionOverviewApi
      .getClasses()
      .then((res) => setClasses(res?.data?.data ?? []))
      .catch(() => setClasses([]));
  }, []);

  const loadOverview = useCallback(async (activeFilters) => {
    setLoading(true);
    try {
      const payload = { sessions_count: Number(activeFilters.compare_sessions) || 5 };
      if (activeFilters.admission_batch_id)
        payload.admission_batch_id = activeFilters.admission_batch_id;
      if (activeFilters.class_id) payload.class_id = activeFilters.class_id;
      if (activeFilters.status) payload.status = activeFilters.status;
      if (activeFilters.date_from) payload.date_from = activeFilters.date_from;
      if (activeFilters.date_to) payload.date_to = activeFilters.date_to;

      const res = await admissionOverviewApi.getOverview(payload);
      setOverview(res?.data?.data ?? null);
    } catch (err) {
      console.error('Failed to load admission overview:', err);
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, loadOverview]);

  const handleFilterChange = (key) => (e) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const stats = overview?.stats ?? {};
  const trend = overview?.trend ?? [];
  const statusBreakdown = overview?.status_breakdown ?? {
    admitted: 0,
    pending: 0,
    declined: 0,
    accepted_offers: 0,
  };
  const funnel = overview?.funnel ?? [];
  const byClass = overview?.by_class ?? [];
  const insights = overview?.insights ?? [];

  // `processStatus` is the status value ProcessApplicationsTable's
  // STATUS_TABS expects — 'accepted_offer' (singular) and '' (All), not a
  // simple echo of `key`.
  const statCardDefs = [
    { key: 'applications', label: 'Applications', icon: PeopleIcon, processStatus: '' },
    { key: 'admitted', label: 'Admitted', icon: HowToRegIcon, processStatus: 'admitted' },
    { key: 'pending', label: 'Pending Review', icon: HourglassEmptyIcon, processStatus: 'pending' },
    { key: 'declined', label: 'Declined', icon: PersonOffIcon, processStatus: 'declined' },
    {
      key: 'accepted_offers',
      label: 'Accepted Offers',
      icon: CheckCircleIcon,
      processStatus: 'accepted_offer',
    },
  ];

  const trendSeries = useMemo(
    () => [
      { name: 'Applications', data: trend.map((t) => t.applications), color: COLOR.applications },
      { name: 'Admitted', data: trend.map((t) => t.admitted), color: COLOR.admitted },
      {
        name: 'Accepted Offers',
        data: trend.map((t) => t.accepted_offers),
        color: COLOR.accepted_offers,
      },
    ],
    [trend],
  );

  const classBarCategories = byClass.map((c) => c.class_name);

  // Real client-side export of the data already on screen — no backend
  // round trip needed, since everything it writes is already in `overview`.
  const handleExportReport = () => {
    const lines = [
      ['Metric', 'Count', 'Change vs Last Session (%)'],
      ...statCardDefs.map((def) => [
        def.label,
        stats[def.key]?.count ?? 0,
        stats[def.key]?.change_pct ?? '',
      ]),
      [],
      ['Class', 'Applications', 'Admitted', 'Accepted', 'Acceptance Rate (%)'],
      ...byClass.map((c) => [
        c.class_name,
        c.applications,
        c.admitted,
        c.accepted,
        c.acceptance_rate,
      ]),
    ];
    const csv = lines.map((row) => row.join(',')).join('\n');
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'admission_dashboard_report.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <PageContainer
      title="Admission Dashboard"
      description="Application data and historical performance overview"
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mb: 1 }}
      >
        <Breadcrumb title="Admission Dashboard" items={BCrumb} />
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ExportIcon fontSize="small" />}
            onClick={handleExportReport}
            disabled={loading || !overview}
          >
            Export Report
          </Button>
          <Button
            variant="contained"
            size="small"
            endIcon={<ArrowForwardIcon fontSize="small" />}
            onClick={() => navigate('/process-applications')}
          >
            View Applications
          </Button>
        </Stack>
      </Stack>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <ParentCard sx={{ mb: 2, ...tightCardSx }}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Compare Sessions</InputLabel>
              <Select
                label="Compare Sessions"
                value={filters.compare_sessions}
                onChange={handleFilterChange('compare_sessions')}
              >
                <MenuItem value="3">Last 3 Sessions</MenuItem>
                <MenuItem value="5">Last 5 Sessions</MenuItem>
                <MenuItem value="10">Last 10 Sessions</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Admission Batch</InputLabel>
              <Select
                label="Admission Batch"
                value={filters.admission_batch_id}
                onChange={handleFilterChange('admission_batch_id')}
              >
                <MenuItem value="">All Batches</MenuItem>
                {batches.map((b) => (
                  <MenuItem key={b.batch_id} value={String(b.batch_id)}>
                    {b.session_name} - {b.prog_name} ({b.batchname})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select
                label="Class"
                value={filters.class_id}
                onChange={handleFilterChange('class_id')}
              >
                <MenuItem value="">All Classes</MenuItem>
                {classes.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.class_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Application Status</InputLabel>
              <Select
                label="Application Status"
                value={filters.status}
                onChange={handleFilterChange('status')}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="admitted">Admitted</MenuItem>
                <MenuItem value="declined">Declined</MenuItem>
                <MenuItem value="revoked">Revoked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="From"
              slotProps={{ inputLabel: { shrink: true } }}
              value={filters.date_from}
              onChange={handleFilterChange('date_from')}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="To"
              slotProps={{ inputLabel: { shrink: true } }}
              value={filters.date_to}
              onChange={handleFilterChange('date_to')}
            />
          </Grid>
        </Grid>
      </ParentCard>

      {/* ── Current Session stat row ───────────────────────────────── */}
      <Grid container spacing={1.5} sx={{ mb: 2 }} alignItems="stretch">
        {statCardDefs.map((def) => {
          const metric = stats[def.key];
          return (
            <Grid key={def.key} size={{ xs: 6, sm: 4, md: 2.4 }}>
              <AdmissionStatCard
                count={metric?.count ?? 0}
                label={def.label}
                icon={def.icon}
                color={COLOR[def.key]}
                changePct={metric?.change_pct}
                loading={loading}
                onClick={() =>
                  navigate('/process-applications', { state: { status: def.processStatus } })
                }
              />
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
        {/* ── Trend line chart ─────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <ParentCard
            title={cardTitle(
              'Applications, Admissions & Accepted Offers Trend',
              'Track performance over the last 5 academic sessions',
            )}
            codeModel={
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={filters.compare_sessions}
                  onChange={handleFilterChange('compare_sessions')}
                >
                  <MenuItem value="3">Last 3 Sessions</MenuItem>
                  <MenuItem value="5">Last 5 Sessions</MenuItem>
                  <MenuItem value="10">Last 10 Sessions</MenuItem>
                </Select>
              </FormControl>
            }
            sx={cardBodySx(360)}
          >
            {loading ? (
              <Skeleton variant="rounded" height={240} />
            ) : trend.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No application data yet.
              </Typography>
            ) : (
              <Chart
                type="line"
                height={240}
                series={trendSeries}
                options={{
                  chart: { toolbar: { show: false } },
                  stroke: { width: 3, curve: 'smooth' },
                  colors: trendSeries.map((s) => s.color),
                  markers: { size: 4 },
                  xaxis: { categories: trend.map((t) => t.session_name) },
                  legend: { position: 'top' },
                  dataLabels: { enabled: false },
                  grid: { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
                }}
              />
            )}
          </ParentCard>
        </Grid>

        {/* ── Status donut ─────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ParentCard title="Current Session Application Status" sx={cardBodySx(360)}>
            {loading ? (
              <Skeleton variant="rounded" height={280} />
            ) : (
              <Box sx={{ width: '100%' }}>
                <Chart
                  type="donut"
                  width="100%"
                  height={280}
                  series={[
                    statusBreakdown.admitted,
                    statusBreakdown.pending,
                    statusBreakdown.declined,
                    statusBreakdown.accepted_offers,
                  ]}
                  options={{
                    labels: ['Admitted', 'Pending Review', 'Declined', 'Accepted Offers'],
                    colors: STATUS_DONUT_COLORS,
                    legend: { position: 'right', offsetY: 40 },
                    dataLabels: { enabled: true, formatter: (v) => `${v.toFixed(1)}%` },
                    plotOptions: {
                      pie: {
                        donut: {
                          labels: {
                            show: true,
                            total: {
                              show: true,
                              label: 'Applications',
                              formatter: () => stats.applications?.count ?? 0,
                            },
                          },
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </ParentCard>
        </Grid>

        {/* ── Conversion funnel ────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 3 }}>
          <ParentCard
            title={
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700 }}>
                  Funnel Conversion (Current Session)
                </Typography>
                <Tooltip title="Share of applications that reach each stage, from first submitted to fully enrolled.">
                  <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                </Tooltip>
              </Stack>
            }
            sx={cardBodySx(360)}
          >
            {loading ? (
              <Skeleton variant="rounded" height={280} />
            ) : (
              <Stack spacing={1.5} justifyContent="space-between" sx={{ height: '100%' }}>
                {funnel.map((step, i) => (
                  <Box key={step.label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {step.label}
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {step.count}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={step.pct}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          bgcolor: Object.values(COLOR)[i % 5],
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {step.pct}% of applications
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </ParentCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
        {/* ── Applications by Class bar chart ──────────────────────── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ParentCard
            title={cardTitle(
              'Applications by Class (Current vs Previous Session)',
              'Compare application volume for each class',
            )}
            sx={cardBodySx(300)}
          >
            {loading ? (
              <Skeleton variant="rounded" height={260} />
            ) : byClass.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No applications by class yet.
              </Typography>
            ) : (
              <Chart
                type="bar"
                height={220}
                series={[
                  { name: 'Previous Session', data: byClass.map((c) => c.previous_applications) },
                  { name: 'Current Session', data: byClass.map((c) => c.applications) },
                ]}
                options={{
                  chart: { toolbar: { show: false } },
                  colors: ['#93C5FD', COLOR.applications],
                  plotOptions: { bar: { columnWidth: '55%', borderRadius: 4 } },
                  xaxis: { categories: classBarCategories },
                  legend: { position: 'top' },
                  dataLabels: { enabled: false },
                  grid: { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
                }}
              />
            )}
          </ParentCard>
        </Grid>

        {/* ── Applications by Class table ──────────────────────────── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ParentCard
            title="Applications by Class (Current Session)"
            codeModel={
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={filters.class_id}
                  onChange={handleFilterChange('class_id')}
                  displayEmpty
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classes.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {c.class_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            }
            sx={cardBodySx(300)}
          >
            {loading ? (
              <Skeleton variant="rounded" height={260} />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Applications
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Admitted
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Accepted
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Acceptance Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {byClass.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No applications by class yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      byClass.map((c) => (
                        <TableRow key={c.class_id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{c.class_name}</TableCell>
                          <TableCell align="center">{c.applications}</TableCell>
                          <TableCell align="center">{c.admitted}</TableCell>
                          <TableCell align="center">{c.accepted}</TableCell>
                          <TableCell sx={{ minWidth: 140 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <LinearProgress
                                variant="determinate"
                                value={c.acceptance_rate}
                                sx={{
                                  flex: 1,
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    bgcolor:
                                      c.acceptance_rate >= 70
                                        ? COLOR.admitted
                                        : c.acceptance_rate >= 40
                                          ? COLOR.pending
                                          : COLOR.declined,
                                  },
                                }}
                              />
                              <Typography variant="caption" fontWeight={700} sx={{ minWidth: 32 }}>
                                {c.acceptance_rate}%
                              </Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </ParentCard>
        </Grid>
      </Grid>

      {/* ── Key Insights & Recommendations ───────────────────────────── */}
      <ParentCard
        title={cardTitle(
          'Key Insights & Recommendations',
          'Rule-based analysis to help make informed enrollment decisions',
        )}
        codeModel={
          <Button
            size="small"
            endIcon={<ArrowForwardIcon fontSize="small" />}
            onClick={() => navigate('/process-applications')}
          >
            View All Insights
          </Button>
        }
        sx={tightCardSx}
      >
        {loading ? (
          <Grid container spacing={1.5}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Skeleton variant="rounded" height={90} />
              </Grid>
            ))}
          </Grid>
        ) : insights.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No notable patterns detected yet.
          </Typography>
        ) : (
          <Grid container spacing={1.5}>
            {insights.map((insight, i) => {
              const scheme = INSIGHT_ICON[insight.type] ?? INSIGHT_ICON.info;
              const Icon = scheme.icon;
              return (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      height: '100%',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: scheme.bg,
                          color: scheme.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon sx={{ fontSize: 16 }} />
                      </Box>
                      <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                        {insight.title}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {insight.description}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </ParentCard>
    </PageContainer>
  );
};

export default AdmissionDashboard;
