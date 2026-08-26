import { useId } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  useTheme,
} from '@mui/material';
import PropTypes from 'prop-types';

const defaultColors = ['#4A3AFF', '#2CA87F', '#F4A92B', '#EF4444', '#8B5CF6', '#EC4899'];

const ReusableTrendChart = ({
  data = [],
  series = [],
  nameKey = 'label',
  type = 'line',
  height = 280,
  title,
  subtitle,
  showLegend = true,
  showGrid = true,
  showDots = false,
  strokeWidth = 2,
  valueFormatter = (v) => v,
  tooltipFormatter,
  periods,
  activePeriod,
  onPeriodChange,
  yearPicker,
  loading = false,
  stats,
  cardSx = {},
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const uid = useId().replace(/:/g, '');

  const gridStroke = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const tickFill = isDark ? 'rgba(255,255,255,0.65)' : '#6B7280';
  const tooltipBg = isDark ? theme.palette.background.paper : '#ffffff';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0';

  const normalizedSeries = series.length
    ? series
    : data.length > 0
      ? Object.keys(data[0])
          .filter((k) => k !== nameKey)
          .map((key, i) => ({
            dataKey: key,
            name: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            color: defaultColors[i % defaultColors.length],
          }))
      : [];

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  /* eslint-disable react/prop-types */
  const renderTooltipContent = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <Box
        sx={{
          bgcolor: tooltipBg,
          border: `1px solid ${tooltipBorder}`,
          borderRadius: 2,
          p: 1.25,
          boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
        }}
      >
        {label && (
          <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.5, color: 'text.secondary', fontSize: 11 }}>
            {label}
          </Typography>
        )}
        {payload.map((entry, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary', flex: 1 }}>
              {entry.name}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 700, color: 'text.primary' }}>
              {tooltipFormatter
                ? tooltipFormatter(entry.value, entry.name)
                : valueFormatter(entry.value)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };
  /* eslint-enable react/prop-types */

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
        overflow: 'hidden',
        ...cardSx,
      }}
    >
      {/* Header */}
      {(title || periods) && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
          pb={1}
          flexWrap="wrap"
          gap={1.5}
        >
          <Box>
            {title && (
              <Typography variant="subtitle1" fontWeight={700}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box display="flex" gap={1.5} alignItems="center">
            {periods && activePeriod && onPeriodChange && (
              <ToggleButtonGroup
                value={activePeriod}
                exclusive
                size="small"
                onChange={(_, v) => v && onPeriodChange(v)}
              >
                {periods.map((p) => (
                  <ToggleButton key={p} value={p} sx={{ textTransform: 'none', px: 1.5, fontSize: 12 }}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            )}
            {yearPicker}
          </Box>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Chart */}
          <Box sx={{ px: 1.5, pb: 1 }}>
            <ResponsiveContainer width="100%" height={height}>
              <ChartComponent data={data}>
                {type === 'area' && (
                  <defs>
                    {normalizedSeries.map((s, i) => (
                      <linearGradient key={i} id={`trend-grad-${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={s.color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                )}
                {showGrid && (
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={gridStroke}
                  />
                )}
                <XAxis
                  dataKey={nameKey}
                  tick={{ fontSize: 11, fill: tickFill }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: tickFill }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={valueFormatter}
                />
                <Tooltip content={renderTooltipContent} />
                {showLegend && normalizedSeries.length > 1 && (
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                )}
                {normalizedSeries.map((s, i) => {
                  const baseProps = {
                    type: 'monotone',
                    dataKey: s.dataKey,
                    name: s.name,
                    stroke: s.color,
                    strokeWidth: s.strokeWidth ?? strokeWidth,
                  };
                  if (type === 'area') {
                    return (
                      <DataComponent
                        key={i}
                        {...baseProps}
                        fill={`url(#trend-grad-${uid}-${i})`}
                        dot={s.showDots ?? showDots ? { r: 3, fill: s.color, strokeWidth: 0 } : false}
                        activeDot={{ r: 5 }}
                      />
                    );
                  }
                  return (
                    <DataComponent
                      key={i}
                      {...baseProps}
                      dot={s.showDots ?? showDots ? { r: 3, fill: s.color, strokeWidth: 0 } : false}
                      activeDot={{ r: 5 }}
                      strokeDasharray={s.dashed ? '4 4' : undefined}
                    />
                  );
                })}
              </ChartComponent>
            </ResponsiveContainer>
          </Box>

          {/* Stats row */}
          {stats && stats.length > 0 && (
            <Box
              sx={{
                mx: 1.5,
                mb: 1.5,
                p: 1.25,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                display: 'grid',
                gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
              }}
            >
              {stats.map((s, i) => (
                <Box
                  key={i}
                  sx={{
                    textAlign: 'center',
                    px: 1,
                    borderRight: i < stats.length - 1 ? '1px solid' : 'none',
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.25 }}
                  >
                    {s.label}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    sx={{ fontSize: 14, color: s.color || 'text.primary' }}
                  >
                    {s.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

ReusableTrendChart.propTypes = {
  data: PropTypes.array.isRequired,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string,
      strokeWidth: PropTypes.number,
      showDots: PropTypes.bool,
      dashed: PropTypes.bool,
    })
  ),
  nameKey: PropTypes.string,
  type: PropTypes.oneOf(['line', 'area']),
  height: PropTypes.number,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showLegend: PropTypes.bool,
  showGrid: PropTypes.bool,
  showDots: PropTypes.bool,
  strokeWidth: PropTypes.number,
  valueFormatter: PropTypes.func,
  tooltipFormatter: PropTypes.func,
  periods: PropTypes.arrayOf(PropTypes.string),
  activePeriod: PropTypes.string,
  onPeriodChange: PropTypes.func,
  yearPicker: PropTypes.node,
  loading: PropTypes.bool,
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      color: PropTypes.string,
    })
  ),
  cardSx: PropTypes.object,
};

export default ReusableTrendChart;
