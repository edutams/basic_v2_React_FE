import React from 'react';
import { Box, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

/**
 * Horizontal bar chart with value labels on the right.
 */
const HBarChart = ({
  data,
  dataKey,
  nameKey,
  color,
  height = 190,
  formatter,
  domain = [0, 100],
}) => {
  const theme = useTheme();
  const tickFill = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.65)' : '#6B7280';
  return (
    <Box sx={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 52, left: 0, bottom: 0 }}>
          <XAxis type="number" hide domain={domain} />
          <YAxis
            type="category"
            dataKey={nameKey}
            width={100}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 600, fill: tickFill }}
          />
          <Tooltip formatter={formatter} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey={dataKey} fill={color} radius={[0, 6, 6, 0]} barSize={14}>
            <LabelList
              dataKey={dataKey}
              position="right"
              formatter={formatter}
              style={{ fontSize: 10, fontWeight: 800, fill: color }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default HBarChart;
