import React from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { HowToReg, Groups, MenuBook, TaskAlt } from '@mui/icons-material';
import ReusableAreaChart from '@/components/shared/charts/ReusableAreaChart';
import { Panel, SectionHeader, FooterLink } from '../common';
import { BLUE, GREEN, ORANGE, PURPLE, num } from '../constants';
import MetricTile from './MetricTile';
import HBarChart from './HBarChart';

/**
 * Admission Overview — summary tiles + enrollment charts + footer link.
 */
const AdmissionOverviewPanel = ({
  ao,
  enrollmentByClass,
  enrollmentBySession,
  maxEnrollment,
  onSwitchRole,
  onFooterClick,
}) => {
  const theme = useTheme();

  return (
    <Panel sx={{ mb: 3 }}>
      <SectionHeader
        icon={HowToReg}
        title="Admission Overview"
        color={theme.palette.info.main}
        action="Switch Role"
        onAction={onSwitchRole}
      />

      {/* Summary cards */}
      <Grid container spacing={2} mb={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            icon={Groups}
            color={PURPLE}
            label="Total Applicants"
            value={num(ao.total_applicants).toLocaleString()}
            sub={
              ao.applicants_growth
                ? `${ao.applicants_growth >= 0 ? '↑' : '↓'}${Math.abs(num(ao.applicants_growth))}%`
                : ''
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            icon={MenuBook}
            color={BLUE}
            label="Total Batches Created"
            value={num(ao.total_batches).toLocaleString()}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            icon={HowToReg}
            color={GREEN}
            label="Total Admitted"
            value={num(ao.total_admitted).toLocaleString()}
            sub={
              ao.admitted_growth
                ? `${ao.admitted_growth >= 0 ? '↑' : '↓'}${Math.abs(num(ao.admitted_growth))}%`
                : ''
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            icon={TaskAlt}
            color={ORANGE}
            label="Total Accepted"
            value={num(ao.total_accepted).toLocaleString()}
            sub={
              ao.accepted_growth
                ? `${ao.accepted_growth >= 0 ? '↑' : '↓'}${Math.abs(num(ao.accepted_growth))}%`
                : ''
            }
          />
        </Grid>
      </Grid>

      {/* Enrollment charts */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: '14px',
              border: (t) => `1px solid ${t.palette.divider}`,
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1.5 }}>
              Enrollment Across Classes
            </Typography>
            <HBarChart
              data={enrollmentByClass}
              dataKey="enrollments"
              nameKey="class_name"
              color={BLUE}
              height={210}
              formatter={(v) => num(v).toLocaleString()}
              domain={[0, maxEnrollment]}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: '14px',
              border: (t) => `1px solid ${t.palette.divider}`,
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1.5 }}>
              Enrollment Across Sessions
            </Typography>
            <ReusableAreaChart
              data={enrollmentBySession}
              dataKey="enrollments"
              nameKey="session"
              name="Enrollments"
              color={GREEN}
              height={210}
              valueFormatter={(v) => num(v).toLocaleString()}
            />
          </Box>
        </Grid>
      </Grid>

      <FooterLink text="Go to Admission Dashboard" onClick={onFooterClick} />
    </Panel>
  );
};

export default AdmissionOverviewPanel;
