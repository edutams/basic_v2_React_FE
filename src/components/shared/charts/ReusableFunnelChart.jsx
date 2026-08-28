import React from 'react';
import Chart from 'react-apexcharts';
import {
  Box,
  Typography,
  Stack,
  LinearProgress,
  CircularProgress,
  Chip,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';
import PropTypes from 'prop-types';

const defaultColors = ['#4A3AFF', '#2CA87F', '#F4A92B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const FunnelStepCard = ({ color, label, value, pct, isDark, compact }) => (
  <Box
    sx={{
      flex: '1 1 0',
      minWidth: 0,
      p: compact ? { xs: 0.75, sm: 1 } : { xs: 1, sm: 1.5 },
      borderRadius: '8px',
      bgcolor: isDark ? alpha(color, 0.12) : alpha(color, 0.08),
      border: '1px solid',
      borderColor: isDark ? alpha(color, 0.32) : alpha(color, 0.2),
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 3px 10px ${alpha(color, 0.2)}`,
      },
    }}
  >
    <Typography
      sx={{
        fontSize: compact ? { xs: 8, sm: 8.5 } : { xs: 9, sm: 10 },
        fontWeight: 700,
        color,
        letterSpacing: 0.3,
        mb: 0.25,
        textTransform: 'uppercase',
        lineHeight: 1.2,
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: compact ? { xs: 12, sm: 13 } : { xs: 14, sm: 16 },
        fontWeight: 800,
        color: 'text.primary',
        lineHeight: 1.1,
        whiteSpace: 'nowrap',
      }}
    >
      {typeof value === 'number' ? value.toLocaleString() : value}
    </Typography>
    {pct !== undefined && (
      <Typography
        sx={{
          fontSize: compact ? { xs: 8, sm: 8.5 } : { xs: 9, sm: 10 },
          fontWeight: 700,
          color,
          mt: 0.25,
          lineHeight: 1,
        }}
      >
        ({typeof pct === 'number' ? Math.round(pct * 10) / 10 : pct}%)
      </Typography>
    )}
  </Box>
);

FunnelStepCard.propTypes = {
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  pct: PropTypes.number,
  isDark: PropTypes.bool,
  compact: PropTypes.bool,
};

const ReusableFunnelChart = ({
  data = [],
  title,
  subtitle,
  layout = 'bars',
  colors,
  showPercentage = true,
  showCount = true,
  loading = false,
  footerLabel,
  onFooterClick,
  cardSx = {},
  barSx = {},
  compact = false,
  maxWidth,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data.length) return null;

  const resolvedColors = colors || defaultColors;
  const maxPct = Math.max(...data.map((d) => d.pct ?? d.percentage ?? 0));

  const renderHeader = () =>
    (title || subtitle) && (
      <Box mb={2}>
        {title && (
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    );

  const renderFooter = () =>
    footerLabel && (
      <Box
        sx={{
          pt: 2,
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
          mt: 2,
        }}
      >
        <Button
          disableRipple
          onClick={onFooterClick}
          endIcon={<ArrowForward sx={{ fontSize: '15px !important' }} />}
        >
          {footerLabel}
        </Button>
      </Box>
    );

  // ─── Layout: bars (centered horizontal bars like AdmissionFunnel) ───
  if (layout === 'bars') {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.25,
          borderRadius: '14px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
          ...cardSx,
        }}
      >
        <Box>
          {renderHeader()}
          <Stack spacing={1.25} sx={{ px: { xs: 0, sm: 1 } }}>
            {data.map((item, i) => {
              const pct = item.pct ?? item.percentage ?? 0;
              const color = item.color ?? resolvedColors[i % resolvedColors.length];
              return (
                <Box key={item.stage ?? item.label ?? i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <Box
                      sx={{
                        width: `${Math.max(pct, 20)}%`,
                        bgcolor: color,
                        color: '#ffffff',
                        py: 0.75,
                        px: 1.5,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease',
                        '&:hover': { filter: 'brightness(1.1)', transform: 'scale(1.02)' },
                        ...barSx,
                      }}
                    >
                      {showCount && (
                        <Typography variant="body2" fontWeight={800} sx={{ fontSize: 12, lineHeight: 1 }}>
                          {(item.count ?? 0).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      width: 80,
                      fontSize: 12,
                      fontWeight: 700,
                      color: isDark ? 'rgba(255,255,255,0.85)' : '#334155',
                      flexShrink: 0,
                    }}
                  >
                    {item.stage ?? item.label}
                  </Typography>
                  {showPercentage && (
                    <Typography
                      sx={{
                        width: 50,
                        fontSize: 12,
                        fontWeight: 800,
                        color: isDark ? '#ffffff' : '#0f172a',
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {pct}%
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>
        {renderFooter()}
      </Paper>
    );
  }

  // ─── Layout: progress (LinearProgress bars with labels like OnboardingFunnel) ───
  if (layout === 'progress') {
    return (
      <Box sx={{ maxWidth, ...cardSx }}>
        {renderHeader()}
        {data.map((item, i) => {
          const pct = item.pct ?? item.percentage ?? 0;
          const color = item.color ?? resolvedColors[i % resolvedColors.length];
          return (
            <Box key={item.stage ?? item.label ?? i} mb={2.5}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" fontWeight={600}>
                  {item.stage ?? item.label}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  {showCount && (
                    <Typography variant="body2" color="text.secondary">
                      {(item.count ?? 0).toLocaleString()}
                    </Typography>
                  )}
                  {showPercentage && (
                    <Chip
                      label={`${pct}%`}
                      size="small"
                      sx={{ bgcolor: color, color: '#fff', fontWeight: 700, fontSize: 11, height: 20 }}
                    />
                  )}
                </Stack>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(pct, 100)}
                sx={{
                  height: compact ? 8 : 10,
                  borderRadius: 4,
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0',
                  '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
                  ...barSx,
                }}
              />
            </Box>
          );
        })}
        {renderFooter()}
      </Box>
    );
  }

  // ─── Layout: steps (compact cards with arrows like RatioAndFunnel) ───
  if (layout === 'steps') {
    return (
      <Box
        sx={{
          p: compact ? 0.75 : 1.25,
          borderRadius: 2,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
          ...cardSx,
        }}
      >
        {renderHeader()}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 0.5, sm: 0.75 },
          }}
        >
          {data.map((item, i) => {
            const pct = item.pct ?? item.percentage;
            const color = item.color ?? resolvedColors[i % resolvedColors.length];
            return (
              <React.Fragment key={item.stage ?? item.label ?? i}>
                <FunnelStepCard
                  color={color}
                  label={item.stage ?? item.label}
                  value={item.count ?? 0}
                  pct={pct}
                  isDark={isDark}
                  compact={compact}
                />
                {i < data.length - 1 && (
                  <ArrowForward
                    sx={{
                      fontSize: compact ? { xs: 14, lg: 13 } : { xs: 16, lg: 15 },
                      color: 'text.disabled',
                      flexShrink: 0,
                      mx: { xs: -0.25, sm: 0 },
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Box>
        {renderFooter()}
      </Box>
    );
  }

  // ─── Layout: classic (tapering funnel bars) ───
  if (layout === 'classic') {
    return (
      <Box sx={{ maxWidth, ...cardSx }}>
        {renderHeader()}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {data.map((item, i) => {
            const pct = item.pct ?? item.percentage ?? 0;
            const color = item.color ?? resolvedColors[i % resolvedColors.length];
            const widthPct = maxPct > 0 ? (pct / maxPct) * 100 : 100;
            return (
              <Box key={item.stage ?? item.label ?? i} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      width: `${Math.max(widthPct, 15)}%`,
                      bgcolor: color,
                      color: '#fff',
                      py: compact ? 0.5 : 0.75,
                      px: 2,
                      borderRadius: i === 0 ? '6px 6px 2px 2px' : i === data.length - 1 ? '2px 2px 6px 6px' : '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 2px 6px ${alpha(color, 0.3)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': { filter: 'brightness(1.1)' },
                      ...barSx,
                    }}
                  >
                    {showCount && (
                      <Typography variant="body2" fontWeight={800} sx={{ fontSize: 12 }}>
                        {(item.count ?? 0).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ width: 100, flexShrink: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isDark ? 'rgba(255,255,255,0.85)' : '#334155',
                    }}
                  >
                    {item.stage ?? item.label}
                  </Typography>
                  {showPercentage && (
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary' }}>
                      {pct}%
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
        {renderFooter()}
      </Box>
    );
  }

  // ─── Layout: apex (ApexCharts trapezoid funnel) ───
  if (layout === 'apex') {
    const ROW_HEIGHT = 46;
    const categories = data.map((item) => item.stage ?? item.label ?? '');
    const seriesData = data.map((item) => item.count ?? 0);
    const apexColors = data.map((item, i) => item.color ?? resolvedColors[i % resolvedColors.length]);
    const chartHeight = data.length * ROW_HEIGHT;

    const apexOptions = {
      chart: {
        type: 'bar',
        toolbar: { show: false },
        fontFamily: theme.typography.fontFamily,
        animations: { enabled: true, speed: 400 },
        sparkline: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '100%',
          distributed: true,
          isFunnel3d: true,
        },
      },
      colors: apexColors,
      dataLabels: {
        enabled: true,
        formatter: (val) => val.toLocaleString(),
        style: { fontSize: '13px', fontWeight: 800, colors: ['#fff'] },
        dropShadow: { enabled: false },
      },
      xaxis: {
        categories,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { show: false } },
      grid: { show: false, padding: { left: 0, right: 0, top: 0, bottom: 0 } },
      legend: { show: false },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: {
          formatter: (val, { dataPointIndex }) =>
            `${val.toLocaleString()} (${data[dataPointIndex]?.pct ?? data[dataPointIndex]?.percentage ?? 0}%)`,
        },
      },
      states: { hover: { filter: { type: 'lighten', value: 0.08 } } },
    };

    const apexSeries = [{ name: title || 'Count', data: seriesData }];

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.25,
          borderRadius: '14px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
          ...cardSx,
        }}
      >
        <Box>
          {renderHeader()}
          {data.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <Typography sx={{ fontSize: '12px', color: '#9CA3AF' }}>
                No data available
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Chart options={apexOptions} series={apexSeries} type="bar" height={chartHeight} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: chartHeight }}>
                {data.map((item, i) => {
                  const pct = item.pct ?? item.percentage ?? 0;
                  return (
                    <Box
                      key={item.stage ?? item.label ?? i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        height: ROW_HEIGHT,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: isDark ? 'rgba(255,255,255,0.85)' : '#334155',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.stage ?? item.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: isDark ? '#ffffff' : '#0f172a',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {pct}%
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
        {renderFooter()}
      </Paper>
    );
  }

  return null;
};

ReusableFunnelChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      stage: PropTypes.string,
      label: PropTypes.string,
      count: PropTypes.number,
      pct: PropTypes.number,
      percentage: PropTypes.number,
      color: PropTypes.string,
    })
  ).isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  layout: PropTypes.oneOf(['bars', 'progress', 'steps', 'classic', 'apex']),
  colors: PropTypes.arrayOf(PropTypes.string),
  showPercentage: PropTypes.bool,
  showCount: PropTypes.bool,
  loading: PropTypes.bool,
  footerLabel: PropTypes.string,
  onFooterClick: PropTypes.func,
  cardSx: PropTypes.object,
  barSx: PropTypes.object,
  compact: PropTypes.bool,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ReusableFunnelChart;
