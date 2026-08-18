import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const ReusableGaugeChart = ({
  value = 0,
  label = '',
  subtitle = '',
  height = 130,
  width = 130,
  minValue = 0,
  maxValue = 100,
  colorRanges = [],
}) => {
  const theme = useTheme();

  // Clamp the raw value into [minValue, maxValue]
  const clampedValue = Math.min(maxValue, Math.max(minValue, value));

  // radialBar always wants a 0-100 percentage for its series data,
  // so we normalize the actual value against min/max before passing it in.
  const range = maxValue - minValue;
  const percentage =
    range > 0 ? ((clampedValue - minValue) / range) * 100 : 0;

  const getColor = () => {
    if (colorRanges.length > 0) {
      for (const r of colorRanges) {
        if (clampedValue >= r.from && clampedValue <= r.to) {
          return r.color;
        }
      }
    }

    // Fall back thresholds are expressed against the real value range,
    // not a hardcoded 0-100 assumption.
    if (percentage >= 75) return theme.palette.success.main;
    if (percentage >= 50) return theme.palette.warning.main;

    return theme.palette.error.main;
  };

  const gaugeColor = getColor();

  const options = {
    chart: {
      type: 'radialBar',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: '#adb0bb',
      toolbar: { show: false },
      sparkline: { enabled: true },
    },

    colors: [gaugeColor],

    plotOptions: {
      radialBar: {
        startAngle: -130,
        endAngle: 130,

        track: {
          background:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.1)'
              : '#e0e0e0',
          // Smaller strokeWidth = thinner ring. Since this is a percentage
          // of the chart's diameter (not a fixed px value), the ring stays
          // proportionally thin no matter what height/width you pass in.
          strokeWidth: '12%',
          margin: 5,
        },

        hollow: {
          margin: 0,
          // hollow.size + track.strokeWidth should add up to roughly 100%
          // (diameter). Growing this is what makes the ring thin.
          size: '80%',
          background: 'transparent',
        },

        dataLabels: {
          show: true,

          name: {
            show: true,
            fontSize: '14px',
            fontWeight: 600,
            color: theme.palette.text.secondary,
            offsetY: -8,
          },

          value: {
            show: true,
            fontSize: '30px',
            fontWeight: 700,
            color: theme.palette.text.primary,
            offsetY: 4,
            // val here is the normalized 0-100 series value, not the real
            // value, so we ignore it and format the actual clampedValue.
            formatter: () => `${Math.round(clampedValue)}`,
          },
        },
      },
    },

    fill: {
      type: 'solid',
      colors: [gaugeColor],
    },

    stroke: {
      lineCap: 'round',
    },

    labels: [label || ''],

    tooltip: {
      enabled: true,
      theme: theme.palette.mode,
      y: {
        // Same deal for the tooltip: show the real value, not the percentage.
        formatter: () => `${Math.round(clampedValue)}`,
      },
    },
  };

  const series = [Math.round(percentage)];

  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 1,
        px: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Chart
        options={options}
        series={series}
        type="radialBar"
        height={height}
        width={width}
      />

      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: -1,
            fontWeight: 500,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

ReusableGaugeChart.propTypes = {
  value: PropTypes.number,
  label: PropTypes.string,
  subtitle: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  colorRanges: PropTypes.arrayOf(
    PropTypes.shape({
      from: PropTypes.number,
      to: PropTypes.number,
      color: PropTypes.string,
    }),
  ),
};

export default ReusableGaugeChart;