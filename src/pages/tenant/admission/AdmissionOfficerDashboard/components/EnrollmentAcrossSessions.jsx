import React from 'react';
import { Box, Typography } from '@mui/material';
import ReusableAreaChart from '@/components/shared/charts/ReusableAreaChart';
import { CardShell, ClassSelect, LegendItem } from '../common';
import { BLUE, GREEN, num } from '../constants';

/**
 * Enrollment Across Sessions — multi-series area chart (Applications vs Enrollments).
 */
const EnrollmentAcrossSessions = ({ bySessions }) => (
  <CardShell sx={{ p: 2.5, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 12.5 }}>
        Enrollment Across Sessions
      </Typography>
      <ClassSelect />
    </Box>

    <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
      <LegendItem color={BLUE} label="Applications" square={false} />
      <LegendItem color={GREEN} label="Enrollments" square={false} />
    </Box>

    <ReusableAreaChart
      data={bySessions}
      nameKey="session"
      height={300}
      margin={{ top: 14, right: 8, left: -14, bottom: 0 }}
      valueFormatter={(v) => num(v).toLocaleString()}
      xTickFontSize={9}
      yTickFontSize={9}
      labelFontSize={8}
      series={[
        { dataKey: 'applications', name: 'Applications', color: BLUE, labelPosition: 'top', dotRadius: 3.5 },
        { dataKey: 'enrollments', name: 'Enrollments', color: GREEN, labelPosition: 'bottom', dotRadius: 3.5 },
      ]}
    />
  </CardShell>
);

export default EnrollmentAcrossSessions;
