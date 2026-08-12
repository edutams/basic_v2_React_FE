import React from 'react';
import { Box } from '@mui/material';
import ReusableSparkline from '@/components/shared/charts/ReusableSparkline';

/**
 * Revenue-growth sparkline — real weekly collections from the backend's
 * collection_series payload ({ label, v } points) on the Revenue Growth KPI
 * card. Renders flat/empty when the series is empty.
 */
const GrowthSparkline = ({ data = [] }) => (
  <Box sx={{ width: 76, flexShrink: 0 }}>
    <ReusableSparkline
      data={data}
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
