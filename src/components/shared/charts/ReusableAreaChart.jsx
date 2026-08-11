import React, { useId } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * ReusableAreaChart — a recharts AreaChart with soft gradient fills,
 * hover tooltip, optional value labels and dark-mode awareness.
 *
 * Supports a single series via the simple props (dataKey/name/color/...)
 * OR multiple series via the `series` array, e.g.:
 *
 *   <ReusableAreaChart
 *     data={rows}
 *     nameKey="session"
 *     series={[
 *       { dataKey: 'applications', name: 'Applications', color: '#3B82F6', labelPosition: 'top' },
 *       { dataKey: 'enrollments',  name: 'Enrollments',  color: '#22C55E', labelPosition: 'bottom' },
 *     ]}
 *   />
 */
const ReusableAreaChart = ({
  data,
  dataKey,
  nameKey = 'name',
  name = '',
  color,
  series,
  height = 210,
  margin = { top: 20, right: 16, left: -8, bottom: 0 },
  showLabels = true,
  labelPosition = 'top',
  labelFontSize = 10,
  valueFormatter = (v) => v,
  gradientOpacity = 0.28,
  strokeWidth = 2.5,
  showDots = true,
  dotRadius = 4,
  activeDotRadius = 6,
  xTickFontSize = 10.5,
  yTickFontSize = 9.5,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gridStroke = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';
  const tickFill = isDark ? 'rgba(255,255,255,0.65)' : '#6B7280';
  // Labels use the series color in light mode (matches dashboard designs) and
  // white in dark mode for contrast.
  const labelFill = (seriesColor) => (isDark ? 'rgba(255,255,255,0.85)' : seriesColor);
  // useId guarantees a unique id per instance so multiple charts with the same
  // color on one page never collide on the SVG <linearGradient>.
  const rawId = useId();
  const uid = rawId.replace(/[:]/g, '');

  // Normalize: explicit `series` array wins, otherwise build a single series
  // from the simple props (backward compatible with the single-series API).
  const areas = series?.length
    ? series
    : [{ dataKey, name, color, showLabels, labelPosition, gradientOpacity, strokeWidth, showDots, dotRadius }];

  return (
    <Box sx={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={margin}>
          <defs>
            {areas.map((s, i) => (
              <linearGradient key={i} id={`reusable-area-${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={s.gradientOpacity ?? gradientOpacity} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
          <XAxis
            dataKey={nameKey}
            tick={{ fontSize: xTickFontSize, fill: tickFill }}
            interval={0}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: yTickFontSize, fill: tickFill }}
            axisLine={false}
            tickLine={false}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            formatter={(v, seriesName) => (seriesName ? [valueFormatter(v), seriesName] : valueFormatter(v))}
            contentStyle={{
              borderRadius: 10,
              border: `1px solid ${theme.palette.divider}`,
              background: isDark ? theme.palette.background.paper : '#fff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
              fontSize: 12.5,
            }}
          />
          {areas.map((s, i) => (
            <Area
              key={i}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={s.strokeWidth ?? strokeWidth}
              fill={`url(#reusable-area-${uid}-${i})`}
              dot={(s.showDots ?? showDots) ? { r: s.dotRadius ?? dotRadius, fill: s.color, strokeWidth: 0 } : false}
              activeDot={{ r: s.activeDotRadius ?? activeDotRadius ?? (s.dotRadius ?? dotRadius) + 2 }}
            >
              {(s.showLabels ?? showLabels) && (
                <LabelList
                  dataKey={s.dataKey}
                  position={s.labelPosition ?? labelPosition}
                  formatter={valueFormatter}
                  style={{ fontSize: s.labelFontSize ?? labelFontSize, fontWeight: 800, fill: labelFill(s.color) }}
                />
              )}
            </Area>
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

ReusableAreaChart.propTypes = {
  data: PropTypes.array.isRequired,
  dataKey: PropTypes.string,
  nameKey: PropTypes.string,
  name: PropTypes.string,
  color: PropTypes.string,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string.isRequired,
      showLabels: PropTypes.bool,
      labelPosition: PropTypes.string,
      labelFontSize: PropTypes.number,
      gradientOpacity: PropTypes.number,
      strokeWidth: PropTypes.number,
      showDots: PropTypes.bool,
      dotRadius: PropTypes.number,
      activeDotRadius: PropTypes.number,
    })
  ),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  margin: PropTypes.object,
  showLabels: PropTypes.bool,
  labelPosition: PropTypes.string,
  labelFontSize: PropTypes.number,
  valueFormatter: PropTypes.func,
  gradientOpacity: PropTypes.number,
  strokeWidth: PropTypes.number,
  showDots: PropTypes.bool,
  dotRadius: PropTypes.number,
  activeDotRadius: PropTypes.number,
  xTickFontSize: PropTypes.number,
  yTickFontSize: PropTypes.number,
};

export default ReusableAreaChart;
