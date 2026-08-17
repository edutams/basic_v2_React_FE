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

  const getColor = () => {
    if (colorRanges.length > 0) {
      for (const range of colorRanges) {
        if (value >= range.from && value <= range.to) {
          return range.color;
        }
      }
    }

    if (value >= 75) return theme.palette.success.main;
    if (value >= 50) return theme.palette.warning.main;

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
          strokeWidth: '97%',
          margin: 5,
        },

        hollow: {
          margin: 0,
          size: '35%',
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
            formatter: (val) => `${Math.round(val)}%`,
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
        formatter: (val) => `${Math.round(val)}%`,
      },
    },
  };

  const series = [Math.round(value)];

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
  width: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
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

