import React from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import {
  School,
  MenuBook,
  Quiz,
  Assignment,
  VideoLibrary,
  Insights,
} from '@mui/icons-material';
import ReusableSparkline from '@/components/shared/charts/ReusableSparkline';
import { Panel, SectionHeader } from '../common';
import { BLUE, GREEN, ORANGE, PURPLE, MOCK_TOP_RESOURCES, num } from '../constants';
import MetricTile from './MetricTile';
import HBarChart from './HBarChart';

/**
 * Teacher Analytics — metric tiles + top resource usage bar chart.
 */
const TeacherAnalyticsPanel = ({ ta, onViewAll, onTileClick }) => {
  const theme = useTheme();

  // Real monthly resource-creation series from the backend; falls back to an
  // empty array so the sparkline renders flat when there is no history.
  const usageSeries = (ta?.resource_usage_series || []).map((p) => ({
    label: p.label,
    v: num(p.v),
  }));

  return (
    <Panel>
      <SectionHeader
        icon={School}
        title="Teacher Analytics"
        color={theme.palette.info.main}
        action="View all"
        onAction={onViewAll}
      />
      <Grid container columns={{ xs: 4, sm: 6, md: 6 }} spacing={1.5}>
        <Grid size={{ xs: 4, sm: 3, md: 2 }}>
          <MetricTile
            icon={MenuBook}
            color={BLUE}
            label="Lesson Plans Created"
            value={num(ta.lesson_plans_created).toLocaleString()}
            onClick={onTileClick ? () => onTileClick('lesson_plans') : undefined}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 3, md: 2 }}>
          <MetricTile
            icon={Quiz}
            color={GREEN}
            label="Quizzes Created"
            value={num(ta.quizzes_created).toLocaleString()}
            onClick={onTileClick ? () => onTileClick('quizzes') : undefined}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 3, md: 2 }}>
          <MetricTile
            icon={Assignment}
            color={ORANGE}
            label="Assignments Given"
            value={num(ta.assignments_given).toLocaleString()}
            onClick={onTileClick ? () => onTileClick('assignments') : undefined}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 3, md: 2 }}>
          <MetricTile
            icon={VideoLibrary}
            color={PURPLE}
            label="Video Resources Generated"
            value={num(ta.video_resources_generated).toLocaleString()}
            onClick={onTileClick ? () => onTileClick('video_resources') : undefined}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 6, md: 4 }}>
          <MetricTile
            icon={Insights}
            color={BLUE}
            label="Resource Usage (Access by Teachers)"
            value={ta.resource_usage?.level || 'High'}
            right={
              <Box sx={{ width: 76, height: 30 }}>
                <ReusableSparkline
                  data={usageSeries}
                  dataKey="v"
                  color={GREEN}
                  height={30}
                  gradientOpacity={0.3}
                  activeDot={false}
                />
              </Box>
            }
            onClick={onTileClick ? () => onTileClick('resources') : undefined}
          />
        </Grid>
      </Grid>

      {/* Top Resource Usage by Teachers */}
      <Box
        sx={{
          mt: 2,
          p: 1.75,
          borderRadius: '14px',
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.50'),
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Typography sx={{ fontSize: 11.5, fontWeight: 700, mb: 1 }}>
          Top Resource Usage by Teachers
        </Typography>
        <HBarChart
          data={(ta.top_resources || []).length > 0 ? ta.top_resources : MOCK_TOP_RESOURCES}
          dataKey="percentage"
          nameKey="name"
          color={BLUE}
          height={168}
          formatter={(v) => `${v}%`}
        />
      </Box>
    </Panel>
  );
};

export default TeacherAnalyticsPanel;
