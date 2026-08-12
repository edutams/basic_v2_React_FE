import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { CardShell, LegendItem } from '../common';
import { BLUE, GREEN } from '../constants';

/**
 * Enrollment Across Classes — grouped bar chart (Applications vs Enrollments).
 * The class dropdown filters the chart via the enrollment-insights endpoint.
 */
const EnrollmentAcrossClasses = ({ byClass, classes = [], selectedClass = 'all', onClassChange }) => (
  <CardShell sx={{ p: 2.5, height: 'auto' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 12.5 }}>
        Enrollment Across Classes
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
      <LegendItem color={BLUE} label="Applications" />
      <LegendItem color={GREEN} label="Enrollments (Accepted)" />
    </Box>

    <Box sx={{ height: 230 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={byClass}
          margin={{ top: 20, right: 8, left: -14, bottom: 0 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F7" />
          <XAxis
            dataKey="class_name"
            tick={{ fontSize: 8.5 }}
            interval={0}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey="applications" name="Applications" fill={BLUE} radius={[4, 4, 0, 0]} maxBarSize={14}>
            <LabelList
              dataKey="applications"
              position="top"
              style={{ fontSize: 8.5, fontWeight: 700, fill: BLUE }}
            />
          </Bar>
          <Bar dataKey="enrollments" name="Enrollments" fill={GREEN} radius={[4, 4, 0, 0]} maxBarSize={14}>
            <LabelList
              dataKey="enrollments"
              position="top"
              style={{ fontSize: 8.5, fontWeight: 700, fill: GREEN }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  </CardShell>
);

export default EnrollmentAcrossClasses;
