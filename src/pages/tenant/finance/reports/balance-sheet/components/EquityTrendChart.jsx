import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';
import { formatCompact, COLORS } from '../constants';

// Accumulated Surplus + Current Period Surplus stack as a bar per term,
// Total Equity overlays as a line — every point gets its own value label
// (unlike Post Expenditure's Posting Trend chart, which only labels the
// most recent one), matching this report's design exactly.
const EquityTrendChart = ({ data, height = 230 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gridStroke = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const tickFill = isDark ? 'rgba(255,255,255,0.65)' : '#6B7280';
  const lineColor = '#9333EA';

  /* eslint-disable react/prop-types */
  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <Box
        sx={{
          bgcolor: isDark ? theme.palette.background.paper : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
          borderRadius: 2,
          p: 1.25,
          boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
        }}
      >
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
        {payload.map((entry) => (
          <Box key={entry.dataKey} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 11, color: 'text.secondary', flex: 1 }}>{entry.name}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{formatCompact(entry.value)}</Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const TotalLabel = (props) => {
    const { x, y, value } = props;
    const text = formatCompact(value);
    const width = 14 + text.length * 6.5;
    return (
      <g>
        <rect x={x - width / 2} y={y - 24} width={width} height={18} rx={5} fill={lineColor} />
        <text x={x} y={y - 11} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">
          {text}
        </text>
      </g>
    );
  };
  /* eslint-enable react/prop-types */

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 24, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
        <XAxis dataKey="term" tick={{ fontSize: 10.5, fill: tickFill }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: tickFill }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
        <Tooltip content={renderTooltip} />
        <Legend wrapperStyle={{ fontSize: 11.5, paddingTop: 6 }} />
        <Bar
          dataKey="accumulatedSurplus"
          name="Accumulated Surplus"
          stackId="equity"
          fill={COLORS.accumulatedSurplus}
          barSize={30}
        />
        <Bar
          dataKey="currentPeriodSurplus"
          name="Current Surplus"
          stackId="equity"
          fill={COLORS.currentPeriodSurplus}
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
        <Line
          type="monotone"
          dataKey="total"
          name="Total Equity"
          stroke={lineColor}
          strokeWidth={2}
          dot={{ r: 4, fill: lineColor, stroke: '#fff', strokeWidth: 1.5 }}
          label={<TotalLabel />}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default EquityTrendChart;
