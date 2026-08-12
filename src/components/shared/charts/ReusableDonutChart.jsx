import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * ReusableDonutChart — a recharts donut (PieChart with innerRadius) that
 * supports colored segments, a hover tooltip, and optional centered content
 * (e.g. a total value + caption).
 *
 *   <ReusableDonutChart
 *     data={[{ name: 'Tuition', value: 72, color: BLUE }, ...]}
 *     height={150}
 *     centerValue="₦158.4M"
 *     centerTitle="Total Collected"
 *   />
 */
const ReusableDonutChart = ({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  colorKey = 'color',
  height = 150,
  innerRadius = 40,
  outerRadius = 62,
  paddingAngle = 3,
  strokeWidth = 0,
  centerTitle,
  centerValue,
  valueFontSize = 18,
  titleFontSize = 10,
  valueFormatter = (v) => `${v}%`,
  tooltipFormatter,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ position: 'relative', width: '100%', height, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : theme.palette.divider}`,
              borderRadius: 10,
              boxShadow: isDark
                ? '0 8px 24px rgba(0,0,0,0.5)'
                : '0 4px 16px rgba(0,0,0,0.1)',
              fontSize: 12,
            }}
            itemStyle={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#1F2937' }}
            labelStyle={{ color: isDark ? 'rgba(255,255,255,0.55)' : '#6B7280', fontWeight: 700 }}
            formatter={
              tooltipFormatter ||
              ((value, name) => [valueFormatter(value), name])
            }
          />
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            strokeWidth={strokeWidth}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d[colorKey]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerTitle || centerValue) && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {centerValue && (
            <Typography sx={{ fontSize: valueFontSize, fontWeight: 800, lineHeight: 1.1, color: 'text.primary' }}>
              {centerValue}
            </Typography>
          )}
          {centerTitle && (
            <Typography
              variant="caption"
              sx={{
                fontSize: titleFontSize,
                color: 'text.secondary',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {centerTitle}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

ReusableDonutChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
      color: PropTypes.string,
    })
  ),
  dataKey: PropTypes.string,
  nameKey: PropTypes.string,
  colorKey: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
  paddingAngle: PropTypes.number,
  strokeWidth: PropTypes.number,
  centerTitle: PropTypes.string,
  centerValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  valueFontSize: PropTypes.number,
  titleFontSize: PropTypes.number,
  valueFormatter: PropTypes.func,
  tooltipFormatter: PropTypes.func,
};

export default ReusableDonutChart;
