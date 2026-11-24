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
import { formatCompact } from '../constants';

// Paid/Balance render as a stacked bar per term, Actual (Total) overlays as
// a line — the one combination ReusableTrendChart doesn't cover (it's
// line/area only), so this stays a small local component rather than a
// shared one until another page needs the same bar+line combo.
const PostingTrendChart = ({ data, height = 230 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gridStroke = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const tickFill = isDark ? 'rgba(255,255,255,0.65)' : '#6B7280';

  const paidColor = '#0D9488';
  const balanceColor = '#D97706';
  const actualColor = theme.palette.primary.main;

  const lastPoint = data[data.length - 1];

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
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
          {label}
        </Typography>
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

  // Only the last point gets a visible dot + its value label, so the chart
  // reads as "here's where we are now" instead of a dot/label on every term.
  const ActualDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.term !== lastPoint.term) return null;
    return <circle cx={cx} cy={cy} r={4} fill={actualColor} stroke="#fff" strokeWidth={1.5} />;
  };

  const ActualLabel = (props) => {
    const { x, y, index } = props;
    if (index !== data.length - 1) return null;
    const text = formatCompact(lastPoint.actual);
    const width = 14 + text.length * 6.5;
    return (
      <g>
        <rect x={x - width / 2} y={y - 28} width={width} height={20} rx={6} fill={actualColor} />
        <text x={x} y={y - 14} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#fff">
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
        <YAxis
          tick={{ fontSize: 10, fill: tickFill }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatCompact}
        />
        <Tooltip content={renderTooltip} />
        <Legend wrapperStyle={{ fontSize: 11.5, paddingTop: 6 }} />
        <Bar dataKey="paid" name="Paid" stackId="posting" fill={paidColor} radius={[0, 0, 0, 0]} barSize={18} />
        <Bar dataKey="balance" name="Balance" stackId="posting" fill={balanceColor} radius={[3, 3, 0, 0]} barSize={18} />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual (Total)"
          stroke={actualColor}
          strokeWidth={2}
          dot={<ActualDot />}
          activeDot={{ r: 5 }}
          label={<ActualLabel />}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default PostingTrendChart;
