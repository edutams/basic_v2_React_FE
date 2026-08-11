import React, { useId } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

// Tooltip content for the sparkline — muted label row + bold colored value
const SparkTooltip = ({ active, payload, isDark, color, labelKey, tooltipValueFormatter }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.75,
        borderRadius: '10px',
        bgcolor: isDark ? 'grey.900' : 'common.white',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
        minWidth: 72,
        textAlign: 'center',
      }}
    >
      {labelKey && point?.payload?.[labelKey] && (
        <Typography
          variant="caption"
          sx={{ fontSize: 9.5, color: 'text.secondary', display: 'block', lineHeight: 1.2 }}
        >
          {point.payload[labelKey]}
        </Typography>
      )}
      <Typography sx={{ fontSize: 13, fontWeight: 800, color, lineHeight: 1.35 }}>
        {tooltipValueFormatter(point.value)}
      </Typography>
    </Box>
  );
};

/**
 * ReusableSparkline — a tiny recharts AreaChart sparkline with a soft
 * gradient fill, no axes/grid, an optional hover tooltip (showing a label +
 * formatted value) and dark-mode awareness.
 *
 * Used for compact trend visuals on stat cards (e.g. the fee-card sparklines
 * on the admission dashboard and the overview trend lines on the admin
 * dashboard).
 *
 *   <ReusableSparkline
 *     data={sparkData}                 // [{ label: 'Wk 1', v: 4200 }, ...]
 *     dataKey="v"
 *     color="#22C55E"
 *     height={48}
 *     showTooltip
 *     labelKey="label"
 *     tooltipValueFormatter={(v) => `₦${v.toLocaleString()}`}
 *   />
 */
const ReusableSparkline = ({
  data,
  dataKey = 'value',
  color,
  height = 40,
  gradientOpacity = 0.35,
  strokeWidth = 2,
  showTooltip = false,
  labelKey,
  tooltipValueFormatter = (v) => v,
  activeDot = true,
  margin,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const rawId = useId();
  const gradId = `reusable-spark-${rawId.replace(/[:]/g, '')}`;

  return (
    <Box sx={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={
            margin || { top: showTooltip ? 12 : 2, right: 0, left: 0, bottom: 0 }
          }
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={gradientOpacity} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showTooltip && (
            <Tooltip
              content={
                <SparkTooltip
                  isDark={isDark}
                  color={color}
                  labelKey={labelKey}
                  tooltipValueFormatter={tooltipValueFormatter}
                />
              }
              cursor={{ stroke: color, strokeWidth: 1.2, strokeDasharray: '4 4' }}
            />
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={strokeWidth}
            fill={`url(#${gradId})`}
            dot={false}
            isAnimationActive={false}
            activeDot={activeDot ? { r: 3.5, fill: color, stroke: '#fff', strokeWidth: 1.5 } : false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

ReusableSparkline.propTypes = {
  data: PropTypes.array.isRequired,
  dataKey: PropTypes.string,
  color: PropTypes.string.isRequired,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  gradientOpacity: PropTypes.number,
  strokeWidth: PropTypes.number,
  showTooltip: PropTypes.bool,
  labelKey: PropTypes.string,
  tooltipValueFormatter: PropTypes.func,
  activeDot: PropTypes.bool,
  margin: PropTypes.object,
};

export default ReusableSparkline;
