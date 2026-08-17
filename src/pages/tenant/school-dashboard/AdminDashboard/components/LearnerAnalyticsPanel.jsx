import React from 'react';
import { Box, Grid, Typography, Stack, Skeleton, useTheme } from '@mui/material';
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
import {
  BLUE,
  GREEN,
  ORANGE,
  PURPLE,
  RED,
  MOCK_EXAM_PERFORMANCE,
  MOCK_RESOURCE_ENGAGEMENT,
  num,
} from '../constants';
import MetricTile from './MetricTile';

/**
 * Built-in skeleton for the chart cards (attendance donut / exam bars):
 * mirrors the card body (title, chart area) with shimmer placeholders so no
 * separate skeleton component is needed.
 */
const ChartCardSkeleton = ({ withLegend = false }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
    <Skeleton
      variant="circular"
      width={100}
      height={100}
      sx={{ flexShrink: 0, mx: 'auto' }}
    />
    {withLegend && (
      <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
        {[0, 1].map((i) => (
          <Stack key={i} spacing={0.5}>
            <Skeleton variant="text" width="70%" height={10} />
            <Skeleton variant="text" width="40%" height={10} />
          </Stack>
        ))}
      </Stack>
    )}
  </Box>
);

/**
 * Built-in skeleton for the resource engagement mini-cards.
 */
const ResourceCardSkeleton = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 1.25,
      borderRadius: '12px',
      height: '100%',
      border: '1px rgba(69, 67, 67, 1) solid',
    }}
  >
    <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: '10px' }} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="50%" height={16} />
      <Skeleton variant="text" width="80%" height={10} />
    </Box>
  </Box>
);

/**
 * Learner Analytics — each stat card fetches its own endpoint and renders its
 * own built-in skeleton while loading (no separate skeleton components).
 *
 * Props are per-card sections of `{ data, loading }`:
 *   attendance / exam / underperforming / atRisk / dropOut / assignment / resources
 */
const LearnerAnalyticsPanel = ({
  attendance,
  exam,
  underperforming,
  atRisk,
  dropOut,
  assignment,
  resources,
  onViewAll,
  onTileClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const aData = attendance?.data || {};
  const eData = exam?.data || {};
  const uData = underperforming?.data || {};
  const arData = atRisk?.data || {};
  const doData = dropOut?.data || {};
  const asData = assignment?.data || {};
  const rData = resources?.data || {};

  const aLoading = attendance?.loading;
  const eLoading = exam?.loading;
  const uLoading = underperforming?.loading;
  const arLoading = atRisk?.loading;
  const doLoading = dropOut?.loading;
  const asLoading = assignment?.loading;
  const rLoading = resources?.loading;

  // Attendance donut — only Present/Absent segments.
  const attendanceColors = { Present: GREEN, Absent: RED };
  const attendanceDonut = (aData.attendance_overview || []).map((a) => ({
    ...a,
    color: attendanceColors[a.name] || BLUE,
  }));

  // Exam performance bars — match by name prefix so "Excellent (80%+)" → Excellent etc.
  const examColors = [
    { match: 'Excellent', color: BLUE },
    { match: 'Good', color: ORANGE },
    { match: 'Average', color: RED },
  ];
  const examSource =
    (eData.exam_performance_overview || []).length > 0
      ? eData.exam_performance_overview
      : MOCK_EXAM_PERFORMANCE;
  const examData = examSource.map((e) => ({
    ...e,
    fill: examColors.find((c) => String(e.name || '').startsWith(c.match))?.color || BLUE,
  }));

  // Resource engagement rows — fall back to mock data until the endpoint returns it.
  const resourceEngagement =
    (rData.resource_engagement || []).length > 0
      ? rData.resource_engagement
      : MOCK_RESOURCE_ENGAGEMENT;

  return (
    <Panel>
      <SectionHeader
        icon={HowToReg}
        title="Learner Analytics"
        color={theme.palette.secondary.main}
        action="View all"
        onAction={onViewAll}
      />
      <Grid container columns={{ xs: 4, sm: 6, md: 6 }} spacing={1.5}>
        <Grid size={{ xs: 4, sm: 3, md: 2 }}>
          <MetricTile
            icon={ReportProblem}
            color={RED}
            label="Underperforming Learners"
            value={num(uData.underperforming_learners).toLocaleString()}
            loading={uLoading}
            onClick={onTileClick ? () => onTileClick('underperforming_learners') : undefined}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 3, md: 2 }}>
          <MetricTile
            icon={WarningAmber}
            color={ORANGE}
            label="At-Risk (Grade)"
            value={num(arData.at_risk_grade).toLocaleString()}
            loading={arLoading}
            onClick={onTileClick ? () => onTileClick('at_risk_grade') : undefined}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 3, md: 2 }}>
          <MetricTile
            icon={CheckCircle}
            color={GREEN}
            label="Attendance Rate"
            value={`${num(aData.attendance_rate)}%`}
            loading={aLoading}
            onClick={onTileClick ? () => onTileClick('attendance_rate') : undefined}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 3, md: 2 }}>
          <MetricTile
            icon={TrendingDown}
            color={PURPLE}
            label="Drop-Out Risk"
            value={num(doData.drop_out_risk).toLocaleString()}
            loading={doLoading}
            onClick={onTileClick ? () => onTileClick('drop_out_risk') : undefined}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 3, md: 2 }}>
          <MetricTile
            icon={TaskAlt}
            color={BLUE}
            label="Assignment Completion"
            value={`${num(asData.assignment_completion)}%`}
            loading={asLoading}
            onClick={onTileClick ? () => onTileClick('assignment_completion') : undefined}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 3, md: 2 }}>
          <MetricTile
            icon={Star}
            color={PURPLE}
            label="Exam Performance (Avg.)"
            value={`${num(eData.exam_performance)}%`}
            loading={eLoading}
            onClick={onTileClick ? () => onTileClick('exam_performance') : undefined}
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
              border: '1px rgba(69, 67, 67, 1) solid',
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.50'),
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, mb: 0.5 }}>
              Attendance Overview
            </Typography>
            {aLoading ? (
              <ChartCardSkeleton withLegend />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: '55%' }}>
                  <ReusableDonutChart
                    data={attendanceDonut}
                    height={130}
                    innerRadius={34}
                    outerRadius={50}
                    centerValue={`${num(aData.attendance_rate)}%`}
                    centerTitle="Avg. Atten."
                  />
                </Box>
                <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                  {attendanceDonut.map((d) => (
                    <LegendItem key={d.name} color={d.color} label={d.name} value={`${d.value}%`} />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: '14px',
              border: '1px rgba(69, 67, 67, 1) solid',
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.50'),
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, mb: 1 }}>
              Exam Performance Overview
            </Typography>
            {eLoading ? (
              <Box sx={{ py: 2 }}>
                <Skeleton variant="rounded" height={100} sx={{ width: '100%' }} />
              </Box>
            ) : (
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
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Resource Engagement by Learners */}
      <Box
        sx={{
          mt: 1.5,
          p: 1.75,
          borderRadius: '14px',
          border: '1px rgba(69, 67, 67, 1) solid',
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.50'),
        }}
      >
        <Typography sx={{ fontSize: 11.5, fontWeight: 700, mb: 1.25 }}>
          Resource Engagement (by Learners)
        </Typography>
        <Grid container spacing={1.5}>
          {rLoading
            ? [0, 1, 2].map((i) => (
                <Grid size={{ xs: 12, sm: 4 }} key={i}>
                  <ResourceCardSkeleton />
                </Grid>
              ))
            : resourceEngagement.map((re, i) => {
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
                        border: '1px rgba(69, 67, 67, 1) solid',
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
