import React from 'react';
import { Box } from '@mui/material';
import ReusableSparkline from '@/components/shared/charts/ReusableSparkline';

// Upward trend sparkline — recharts-based, same soft green gradient fill as the
// original SVG (reuses the shared ReusableSparkline component).
const GROWTH_SPARK_DATA = Array.from({ length: 10 }, (_, i) => ({
  v: 8 + i * 2.8,
}));

const GrowthSparkline = () => (
  <Box sx={{ width: 76, flexShrink: 0 }}>
    <ReusableSparkline
      data={GROWTH_SPARK_DATA}
      dataKey="v"
      color="#22C55E"
      height={40}
      gradientOpacity={0.28}
      strokeWidth={2.5}
      activeDot={false}
      margin={{ top: 4, right: 3, left: 3, bottom: 0 }}
    />
  </Box>
);

export default GrowthSparkline;
