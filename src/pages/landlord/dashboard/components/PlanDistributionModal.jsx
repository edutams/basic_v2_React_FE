import React, { useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Stack,
  useTheme,
  Divider,
  Card,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import Chart from 'react-apexcharts';
import ReusableModal from '@/components/shared/ReusableModal';
import { IconBuildingBank } from '@tabler/icons-react';
const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const TopCard = ({ label, value, colorIndex = 0, isDark }) => {
  const scheme = schemeMap[colorIndex % schemeMap.length];
  return (
    <Card
      sx={{
        p: '14px',
        borderRadius: '14px',
        bgcolor: '#ffffff',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
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
        <IconBuildingBank size={18} color="currentColor" />
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography
          variant="h6"
          fontWeight="800"
          sx={{ color: isDark ? '#ffffff' : '#0f172a', fontSize: '16px', lineHeight: 1.2 }}
        >
          {value}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} mt={0.3}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: scheme.color }} />
          <Typography
            variant="caption"
            fontWeight="600"
            sx={{ color: isDark ? '#ffffff' : '#4B5563' }}
          >
            {label}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
};

// Drill-down from a single "Plan per Organization" row — every organization
// currently on that plan, in a proper table instead of just the count.
const PlanOrganizationsTableModal = ({ open, onClose, plan }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const organizations = plan?.organizations ?? [];

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      size="medium"
      title={
        <Typography fontSize={20} fontWeight={700} sx={{ color: theme.palette.text.secondary }}>
          {plan ? `${plan.label} — Organizations` : 'Organizations'}
        </Typography>
      }
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
                  No schools/organizations on this plan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </ReusableModal>
  );
};

const PlanDistributionModal = ({ open, onClose, planDistribution = [], totalOrganizations = 0 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = planDistribution.map((p, i) => ({
    label: p.label,
    value: (p.total ?? 0).toLocaleString(),
    schoolCount: p.total ?? 0,
    organizations: p.organizations || [],
    colorIndex: i % schemeMap.length
  }));

  const totalOrgs = totalOrganizations || plans.reduce((sum, p) => sum + (p.schoolCount ?? 0), 0);

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: true },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '70%',
        borderRadius: 0,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 1,
      colors: theme.palette.mode === 'dark' ? ['#333'] : ['#fff'],
    },
    xaxis: {
      categories: plans.map((p) => p.label),
      labels: {
        rotate: -45,
        style: {
          fontSize: '10px',
          fontWeight: 600,
          colors: theme.palette.mode === 'dark' ? '#fff' : '#333',
        },
      },
      title: {
        text: 'Plan',
        style: {
          fontWeight: 700,
          fontSize: '12px',
          color: theme.palette.mode === 'dark' ? '#fff' : '#333',
        },
        offsetY: 85,
      },
      axisBorder: { show: true, color: theme.palette.mode === 'dark' ? '#444' : '#e0e0e0' },
      axisTicks: { show: false },
    },
    yaxis: {
      title: {
        text: 'NO of Organizations',
        style: {
          fontWeight: 700,
          fontSize: '12px',
          color: theme.palette.mode === 'dark' ? '#fff' : '#333',
        },
      },
      labels: {
        style: { colors: theme.palette.mode === 'dark' ? '#fff' : '#333' },
      },
      // No hardcoded min/max — a fixed 0-100 range clipped any plan with
      // more than 100 organizations and left the bars tiny/unreadable when
      // real counts were much smaller. Let ApexCharts scale to the data.
      min: 0,
    },
    fill: { opacity: 1 },
    colors: schemeMap.map((s) => s.color),
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontWeight: 700,
      markers: { radius: 12 },
      itemMargin: { horizontal: 15, vertical: 10 },
    },
    grid: {
      borderColor: theme.palette.mode === 'dark' ? '#444' : '#f1f1f1',
      strokeDashArray: 0,
    },
    theme: { mode: theme.palette.mode },
  };

  const chartSeries = [
    { name: 'Organizations', data: plans.map((p) => p.schoolCount ?? 0) },
  ];

  return (
    <>
    <ReusableModal
      open={open}
      onClose={onClose}
      size="extraLarge"
      padding={0}
      title={
        <Typography
          fontSize={24}
          fontWeight={700}
          sx={{ color: theme.palette.text.secondary }}
        >
          Plan Distribution
        </Typography>
      }
    >
      <Box sx={{ bgcolor: isDark ? theme.palette.background.default : '#f8fafc' }}>
        {/* Top Plan Value Cards — "Total Organizations" joins the row as its
            own card instead of being a separate summary block further down.
            Capped height + its own scroll so this doesn't keep growing as
            more plans get created — new plans are common (every active plan
            rolls out to every organization automatically), so this list is
            genuinely unbounded over time. */}
        <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 3, pr: 0.5 }}>
          <Grid container spacing={2}>
            {plans.length > 0 ? (
              <>
                {plans.map((plan, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={plan.label}>
                    <TopCard label={plan.label} value={plan.value} colorIndex={i} isDark={isDark} />
                  </Grid>
                ))}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TopCard
                    label="Total Organizations"
                    value={totalOrgs.toLocaleString()}
                    colorIndex={plans.length}
                    isDark={isDark}
                  />
                </Grid>
              </>
            ) : (
              [...Array(4)].map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Card
                    sx={{
                      p: '14px',
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
                    <Box sx={{ textAlign: 'right', flex: 1 }}>
                      <Skeleton variant="text" width={50} height={28} sx={{ ml: 'auto' }} />
                      <Skeleton variant="text" width={70} height={16} sx={{ ml: 'auto' }} />
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Chart Section */}
        <Box
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            bgcolor: isDark ? '#1e1e1e' : '#fff',
            border: isDark ? '1px solid #333' : '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Bar Chart */}
              <Grid size={{ xs: 12, md: 8 }}>
                {plans.length > 0 ? (
                  <Chart options={chartOptions} series={chartSeries} type="bar" height={420} />
                ) : (
                  <Skeleton variant="rounded" height={420} sx={{ borderRadius: '8px' }} />
                )}
              </Grid>

              {/* Plan per Organization Summary */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="700"
                    sx={{ color: isDark ? '#fff' : '#1E3A5F', mb: 2, fontSize: '15px' }}
                  >
                    Plan per Organization
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {/* flex:1 + minHeight:0 + overflowY:auto — without this a
                      growing plan list just overflows past the card's
                      bounds instead of scrolling within it. */}
                  <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
                    {plans.length > 0 ? (
                      plans.map((plan, i) => {
                        const scheme = schemeMap[i % schemeMap.length];
                        return (
                          <Box
                            key={i}
                            onClick={() => setSelectedPlan(plan)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              py: 1,
                              px: 1,
                              mx: -1,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' },
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '8px',
                                  bgcolor: isDark ? '#2a2a2a' : scheme.bg,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <IconBuildingBank size={18} color={scheme.color} />
                              </Box>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Box
                                  sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: scheme.color }}
                                />
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="700"
                                  sx={{ color: isDark ? '#fff' : '#1a3353' }}
                                >
                                  {plan.label}
                                </Typography>
                              </Stack>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Typography variant="caption" sx={{ color: isDark ? '#aaa' : '#888' }}>
                                Orgs
                              </Typography>
                              <Box
                                sx={{
                                  bgcolor: scheme.color,
                                  color: '#fff',
                                  px: 1.5,
                                  py: 0.3,
                                  borderRadius: '4px',
                                  minWidth: 40,
                                  textAlign: 'center',
                                }}
                              >
                                <Typography variant="caption" fontWeight="700">
                                  {plan.schoolCount}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        );
                      })
                    ) : (
                      [...Array(4)].map((_, i) => (
                        <Stack key={i} direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
                            <Skeleton variant="text" width={70} height={20} />
                          </Stack>
                          <Skeleton variant="rounded" width={40} height={24} sx={{ borderRadius: '4px' }} />
                        </Stack>
                      ))
                    )}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </ReusableModal>

    <PlanOrganizationsTableModal
      open={Boolean(selectedPlan)}
      onClose={() => setSelectedPlan(null)}
      plan={selectedPlan}
    />
    </>
  );
};

export default PlanDistributionModal;
