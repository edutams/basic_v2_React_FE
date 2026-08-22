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
  onTileClick,
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
            onClick={() => onTileClick && onTileClick('applicants')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricTile
            icon={MenuBook}
            color={BLUE}
            label="Total Batches Created"
            value={num(ao.total_batches).toLocaleString()}
            onClick={() => onTileClick && onTileClick('batches')}
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
            onClick={() => onTileClick && onTileClick('admitted')}
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
            onClick={() => onTileClick && onTileClick('accepted')}
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
              border: '1px rgba(69, 67, 67, 1) solid',
              boxShadow: (t) =>
                t.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.07)',
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>
              Enrollment Across Classes
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: BLUE, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>
                  Applications
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: GREEN, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>
                  Enrollments
                </Typography>
              </Box>
            </Box>
            <HBarChart
              data={enrollmentByClass}
              dataKey="enrollments"
              nameKey="class_name"
              color={GREEN}
              height={210}
              formatter={(v) => num(v).toLocaleString()}
              domain={[0, maxEnrollment]}
              series={[
                { dataKey: 'applications', name: 'Applications', color: BLUE },
                { dataKey: 'enrollments', name: 'Enrollments', color: GREEN },
              ]}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: '14px',
              border: '1px rgba(69, 67, 67, 1) solid',
              boxShadow: (t) =>
                t.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.07)',
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>
              Enrollment Across Sessions
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: BLUE, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>
                  Applications
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: GREEN, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>
                  Enrollments
                </Typography>
              </Box>
            </Box>
            <ReusableAreaChart
              data={enrollmentBySession}
              nameKey="session"
              height={210}
              valueFormatter={(v) => num(v).toLocaleString()}
              series={[
                { dataKey: 'applications', name: 'Applications', color: BLUE, labelPosition: 'top', dotRadius: 3.5 },
                { dataKey: 'enrollments', name: 'Enrollments', color: GREEN, labelPosition: 'bottom', dotRadius: 3.5 },
              ]}
            />
          </Box>
        </Grid>
      </Grid>

      <FooterLink text="Go to Admission Dashboard" onClick={onFooterClick} />
    </Panel>
  );
};

export default AdmissionOverviewPanel;
