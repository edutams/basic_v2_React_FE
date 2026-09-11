import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Stack,
  Card,
  useTheme,
  Skeleton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import Chart from 'react-apexcharts';
import StandardModal from '@/components/shared/StandardModal';
import { IconBuildingBank } from '@tabler/icons-react';
const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const TopCard = ({ label, value, colorIndex = 0, icon: Icon }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex % schemeMap.length];

  return (
    <Card
      sx={{
        p: '14px',
        borderRadius: '14px',
        bgcolor: '#ffffff',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        height: '100%',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : scheme.bg,
            color: isDark ? '#ffffff' : scheme.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={18} color="currentColor" />
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography
            fontWeight={800}
            sx={{ fontSize: '18px', color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.2 }}
          >
            {value}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} mt={0.3} justifyContent="flex-end">
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: scheme.color }} />
            <Typography
              variant="caption"
              sx={{
                color: isDark ? '#ffffff' : '#4B5563',
                fontWeight: 500,
                fontSize: '12px',
              }}
            >
              {label}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};

// Names are shown two at a time, then "+N more" — however long the full
// list (or any single name) is, the row stays a single line instead of
// wrapping and pushing every other plan further down the panel. The full,
// untruncated list is always available on hover/focus via the tooltip, and
// the full table of organizations opens on click.
const MAX_VISIBLE_ORGS = 2;

const SideStatRow = ({ label, count, colorIndex, icon: Icon, organizations = [], onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex % schemeMap.length];
  const names = organizations.map((org) => org.name);
  const visibleOrgs = names.slice(0, MAX_VISIBLE_ORGS);
  const remainingOrgs = names.length - visibleOrgs.length;

  return (
    <Stack
      spacing={0.5}
      onClick={onClick}
      sx={{
        py: 1.2,
        px: 0.5,
        mx: -0.5,
        borderRadius: '6px',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}`,
        '&:last-child': { borderBottom: 'none' },
        '&:hover': onClick ? { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' } : undefined,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : scheme.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={16} color={isDark ? '#ffffff' : scheme.color} />
          </Box>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: scheme.color }} />
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: isDark ? '#ffffff' : '#4B5563', fontSize: '12px' }}
            >
              {label}
            </Typography>
          </Stack>
        </Stack>
        <Box
          sx={{
            bgcolor: scheme.color,
            color: '#fff',
            px: 1.5,
            py: 0.3,
            borderRadius: '4px',
            minWidth: 36,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" fontWeight={700}>
            {count}
          </Typography>
        </Box>
      </Stack>
      {organizations.length > 0 && (
        <Tooltip title={names.join(', ')} arrow placement="bottom-start">
          <Typography
            variant="caption"
            sx={{
              color: isDark ? '#aaa' : '#64748B',
              fontSize: '11px',
              pl: '44px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'default',
            }}
          >
            {visibleOrgs.join(', ')}
            {remainingOrgs > 0 ? ` +${remainingOrgs} more` : ''}
          </Typography>
        </Tooltip>
      )}
    </Stack>
  );
};

// Drill-down from a single plan row — every organization currently on that
// plan, in a proper table instead of the truncated "+N more" summary.
const PlanOrganizationsTableModal = ({ open, onClose, plan }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const organizations = plan?.organizations ?? [];

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title={plan ? `${plan.label} — Organizations` : 'Organizations'}
      maxWidth="sm"
      padding={1.5}
      dividers={false}
      headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
      sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
    >
      <TableContainer sx={{ maxHeight: 420, overflowY: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '12px' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '12px' }}>Organization</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '12px' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '12px' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.length > 0 ? (
              organizations.map((org, i) => (
                <TableRow key={org.id ?? i} hover>
                  <TableCell sx={{ fontSize: '12px' }}>{i + 1}</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>{org.name}</TableCell>
                  <TableCell sx={{ fontSize: '12px' }}>{org.email || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={org.status || 'unknown'}
                      size="small"
                      sx={{
                        textTransform: 'capitalize',
                        fontSize: '11px',
                        height: 20,
                        bgcolor: org.status === 'active' ? (isDark ? 'rgba(34,197,94,0.2)' : '#DCFCE7') : (isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9'),
                        color: org.status === 'active' ? (isDark ? '#4ade80' : '#166534') : theme.palette.text.secondary,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3, color: theme.palette.text.secondary }}>
                  No organizations on this plan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </StandardModal>
  );
};

const PlanDistributionModal = ({ open, onClose, planDistribution = [], totalOrganizations = 0 }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
      foreColor: isDark ? '#aaa' : '#64748B',
    },
    plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 4, distributed: true } },
    dataLabels: { enabled: false },
    colors: schemeMap.map((s) => s.color),
    xaxis: {
      categories: planDistribution.map((p) => p.label),
      title: { text: 'Organizations', style: { fontWeight: 700, fontSize: '12px', color: isDark ? '#fff' : '#333' } },
      labels: { style: { colors: isDark ? '#aaa' : '#333' } },
    },
    yaxis: {
      labels: { style: { colors: isDark ? '#aaa' : '#333', fontWeight: 600 } },
    },
    legend: { show: false },
    grid: { borderColor: isDark ? '#333' : '#f1f1f1', strokeDashArray: 4 },
    tooltip: { theme: isDark ? 'dark' : 'light' },
  };

  const chartSeries = [{ name: 'Organizations', data: planDistribution.map((p) => p.total) }];

  // Fixed viewport for the side panel — it scrolls internally past this
  // instead of growing the modal without bound when there are many plans
  // (each with a potentially long organization-name list underneath).
  const PANEL_HEIGHT = 420;

  return (
    <>
    <StandardModal
      open={open}
      onClose={onClose}
      title="Plan Distribution"
      maxWidth="lg"
      padding={1.5}
      dividers={false}
      headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
      sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
    >
      {/* Top KPI cards — deliberately a FIXED count (2), not one card per
          plan. One-card-per-plan grows forever (every active plan rolls out
          to every organization automatically, so the plan list is genuinely
          unbounded) — the per-plan breakdown lives entirely in the chart and
          the "Plan per Organization" list below, both of which already
          scale/scroll. This row never grows no matter how many plans exist. */}
      <Grid container spacing={1.5} mb={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          {planDistribution.length > 0 ? (
            <TopCard label="Total Plans" value={planDistribution.length} colorIndex={0} icon={IconBuildingBank} />
          ) : (
            <Card sx={{ p: '14px', borderRadius: '14px', height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
                <Box sx={{ textAlign: 'right', flex: 1 }}>
                  <Skeleton variant="text" width={60} height={28} sx={{ ml: 'auto' }} />
                  <Skeleton variant="text" width={80} height={16} sx={{ ml: 'auto' }} />
                </Box>
              </Stack>
            </Card>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {planDistribution.length > 0 ? (
            <TopCard label="Total Organizations" value={totalOrganizations} colorIndex={1} icon={IconBuildingBank} />
          ) : (
            <Card sx={{ p: '14px', borderRadius: '14px', height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
                <Box sx={{ textAlign: 'right', flex: 1 }}>
                  <Skeleton variant="text" width={60} height={28} sx={{ ml: 'auto' }} />
                  <Skeleton variant="text" width={80} height={16} sx={{ ml: 'auto' }} />
                </Box>
              </Stack>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Chart md:9 + side panel md:3 */}
      <Grid container spacing={2} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 9 }}>
          <Box
            sx={{
              border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`,
              borderRadius: '10px',
              bgcolor: isDark ? '#1e1e1e' : 'white',
              p: 1,
            }}
          >
            {planDistribution.length > 0 ? (
              <Chart options={chartOptions} series={chartSeries} type="bar" height={360} />
            ) : (
              <Box sx={{ p: 2 }}>
                <Skeleton variant="rounded" height={360} sx={{ borderRadius: '8px' }} />
              </Box>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box
            sx={{
              border: `1px solid ${isDark ? '#444' : '#f0f0f0'}`,
              borderRadius: '10px',
              bgcolor: isDark ? theme.palette.background.paper : '#fff',
              p: 1.25,
              maxHeight: PANEL_HEIGHT,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 1.5, color: isDark ? '#fff' : '#1a1a1a', flexShrink: 0 }}
            >
              Plan per Organization
            </Typography>

            {/* Scrolls on its own — the title above stays pinned in view
                regardless of how many plans there are. */}
            <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0, pr: 0.5 }}>
              {planDistribution.length > 0 ? (
                planDistribution.map((plan, i) => (
                  <SideStatRow
                    key={plan.label}
                    label={plan.label}
                    count={plan.total}
                    colorIndex={i}
                    icon={IconBuildingBank}
                    organizations={plan.organizations || []}
                    onClick={() => setSelectedPlan(plan)}
                  />
                ))
              ) : (
                [...Array(4)].map((_, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ py: 1.2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '8px' }} />
                      <Skeleton variant="text" width={70} height={16} />
                    </Stack>
                    <Skeleton variant="rounded" width={36} height={24} sx={{ borderRadius: '4px' }} />
                  </Stack>
                ))
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </StandardModal>

    <PlanOrganizationsTableModal
      open={Boolean(selectedPlan)}
      onClose={() => setSelectedPlan(null)}
      plan={selectedPlan}
    />
    </>
  );
};

export default PlanDistributionModal;
