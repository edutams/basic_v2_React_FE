import React from 'react';
import { Box, Grid, Typography, Stack, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  HowToReg,
  ReportProblem,
  WarningAmber,
  CheckCircle,
  TrendingDown,
  TaskAlt,
  Star,
  PlayCircle,
  AutoStories,
  Quiz,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import { Panel, SectionHeader, LegendItem } from '../common';
import { BLUE, GREEN, ORANGE, PURPLE, RED, num } from '../constants';
import MetricTile from './MetricTile';

/**
 * Learner Analytics — metric tiles, attendance donut, exam performance bars
 * and resource engagement.
 */
const LearnerAnalyticsPanel = ({ la, attendanceDonut, examData, onViewAll }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Panel>
      <SectionHeader
        icon={HowToReg}
        title="Learner Analytics"
        color={theme.palette.secondary.main}
        action="View all"
        onAction={onViewAll}
      />
      <Grid container columns={6} spacing={1.5}>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <MetricTile
            icon={ReportProblem}
            color={RED}
            label="Underperforming Learners"
            value={num(la.underperforming_learners).toLocaleString()}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <MetricTile
            icon={WarningAmber}
            color={ORANGE}
            label="At-Risk (Grade)"
            value={num(la.at_risk_grade).toLocaleString()}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <MetricTile
            icon={CheckCircle}
            color={GREEN}
            label="Attendance Rate"
            value={`${num(la.attendance_rate)}%`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <MetricTile
            icon={TrendingDown}
            color={PURPLE}
            label="Drop-Out Risk"
            value={num(la.drop_out_risk).toLocaleString()}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <MetricTile
            icon={TaskAlt}
            color={BLUE}
            label="Assignment Completion"
            value={`${num(la.assignment_completion)}%`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <MetricTile
            icon={Star}
            color={PURPLE}
            label="Exam Performance (Avg.)"
            value={`${num(la.exam_performance)}%`}
          />
        </Grid>
      </Grid>

      {/* Attendance Overview | Exam Performance Overview */}
      <Grid container spacing={1.5} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: '14px',
              border: (t) => `1px solid ${t.palette.divider}`,
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.50'),
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, mb: 0.5 }}>
              Attendance Overview
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: '55%' }}>
                <ReusableDonutChart
                  data={attendanceDonut}
                  height={130}
                  innerRadius={34}
                  outerRadius={50}
                  centerValue={`${num(la.attendance_rate)}%`}
                  centerTitle="Average Attendance"
                />
              </Box>
              <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                {attendanceDonut.map((d) => (
                  <LegendItem key={d.name} color={d.color} label={d.name} value={`${d.value}%`} />
                ))}
              </Stack>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: '14px',
              border: (t) => `1px solid ${t.palette.divider}`,
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.50'),
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, mb: 1 }}>
              Exam Performance Overview
            </Typography>
            <Box sx={{ height: 148 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examData} margin={{ top: 16, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 8 }}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v.includes('(') ? v.split(' ')[0] : v)}
                  />
                  <YAxis tick={{ fontSize: 8.5 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Learners" radius={[4, 4, 0, 0]} maxBarSize={26}>
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(v) => `${v}%`}
                      style={{ fontSize: 8.5, fontWeight: 800, fill: isDark ? 'rgba(255,255,255,0.85)' : '#1F2937' }}
                    />
                    {examData.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Resource Engagement by Learners */}
      <Box
        sx={{
          mt: 1.5,
          p: 1.75,
          borderRadius: '14px',
          border: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.50'),
        }}
      >
        <Typography sx={{ fontSize: 11.5, fontWeight: 700, mb: 1.25 }}>
          Resource Engagement (by Learners)
        </Typography>
        <Grid container spacing={1.5}>
          {(la.resource_engagement || []).map((re, i) => {
            const meta = [
              { icon: PlayCircle, color: PURPLE },
              { icon: AutoStories, color: GREEN },
              { icon: Quiz, color: ORANGE },
            ][i % 3];
            const Icon = meta.icon;
            return (
              <Grid size={{ xs: 12, sm: 4 }} key={i}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.25,
                    borderRadius: '12px',
                    bgcolor: alpha(meta.color, 0.08),
                    border: `1px solid ${alpha(meta.color, 0.18)}`,
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '10px',
                      bgcolor: alpha(meta.color, 0.14),
                      color: meta.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 15 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.1 }}>
                      {num(re.value).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: 9.5, color: 'text.secondary', display: 'block', lineHeight: 1.2 }}>
                      {re.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Panel>
  );
};

export default LearnerAnalyticsPanel;
