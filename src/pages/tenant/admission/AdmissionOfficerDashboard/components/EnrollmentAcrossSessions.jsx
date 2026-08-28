import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material';
import ReusableAreaChart from '@/components/shared/charts/ReusableAreaChart';
import { CardShell, LegendItem } from '../common';
import { BLUE, GREEN, num } from '../constants';

/**
 * Enrollment Across Sessions — multi-series area chart (Applications vs Enrollments).
 * The class dropdown filters the chart via its own enrollment-by-sessions endpoint.
 */
const EnrollmentAcrossSessions = ({ bySessions, classes = [], selectedClass = 'all', onClassChange }) => (
  <CardShell sx={{ p: 1, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 12.5 }}>
        Enrollment Across Sessions
      </Typography>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          value={selectedClass}
          onChange={(e) => onClassChange(e.target.value)}
          sx={{
            height: 30,
            fontSize: 10.5,
            fontWeight: 600,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
          }}
        >
          <MenuItem value="all">All Classes</MenuItem>
          {classes.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.class_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
