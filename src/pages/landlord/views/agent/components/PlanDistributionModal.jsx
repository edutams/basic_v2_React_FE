import React from 'react';
import { Grid, Box, Typography, Stack, Card, useTheme } from '@mui/material';
import Chart from 'react-apexcharts';
import StandardModal from '@/components/shared/StandardModal';
import { IconBuildingBank } from '@tabler/icons-react';
import { getStatCardColor } from '@/utils/statCardColors';

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FFE4E6', color: '#E11D48' },
];

const TopCard = ({ label, value, colorIndex = 0, icon: Icon }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex % schemeMap.length];

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: '14px',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#94a3b8',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        },
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

const SideStatRow = ({ label, count, colorIndex, icon: Icon }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(null, colorIndex, isDark, theme);

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      justifyContent="space-between"
      sx={{
        py: 1.2,
        borderBottom: `1px solid ${colors.borderColor}`,
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: colors.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={16} color={colors.iconColor || '#fff'} />
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: colors.accentColor }} />
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
          bgcolor: colors.accentColor,
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
  );
};

const PlanDistributionModal = ({ open, onClose, planDistribution = [] }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const totalOrganizations = planDistribution.reduce((sum, p) => sum + (p.total ?? 0), 0);

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

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title="Plan Distribution"
      maxWidth="lg"
      padding={3}
      dividers={false}
      headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
      sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
    >
      {/* Top card per plan */}
      <Grid container spacing={2} mb={3}>
        {planDistribution.map((plan, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={plan.label}>
            <TopCard label={plan.label} value={plan.total} colorIndex={i} icon={IconBuildingBank} />
          </Grid>
        ))}
        {planDistribution.length === 0 && (
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No active plan assignments yet.
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Chart md:9 + side panel md:3 */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 9 }}>
          <Box
            sx={{
              border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`,
              borderRadius: '10px',
              bgcolor: isDark ? '#1e1e1e' : 'white',
              p: 1,
            }}
          >
            <Chart options={chartOptions} series={chartSeries} type="bar" height={360} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box
            sx={{
              border: `1px solid ${isDark ? '#444' : '#f0f0f0'}`,
              borderRadius: '10px',
              bgcolor: isDark ? theme.palette.background.paper : '#fff',
              p: 2,
              height: '100%',
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 1.5, color: isDark ? '#fff' : '#1a1a1a' }}
            >
              Plan per Organization
            </Typography>
            {planDistribution.map((plan, i) => (
              <SideStatRow
                key={plan.label}
                label={plan.label}
                count={plan.total}
                colorIndex={i}
                icon={IconBuildingBank}
              />
            ))}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ mt: 1.5 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: theme.palette.primary.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconBuildingBank size={18} color="#4a3aff" />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  fontWeight={800}
                  sx={{ fontSize: '20px', color: isDark ? '#fff' : '#1E3A5F', lineHeight: 1 }}
                >
                  {totalOrganizations.toLocaleString()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: isDark ? '#aaa' : '#64748B', fontSize: '11px' }}
                >
                  Total Organizations
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </StandardModal>
  );
};

export default PlanDistributionModal;
