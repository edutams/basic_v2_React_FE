import React from 'react';
import { Box, Card, Typography, Stack, LinearProgress } from '@mui/material';
import {
  AssignmentTurnedInOutlined,
  QuizOutlined,
  DescriptionOutlined,
  ImageOutlined,
  EmojiEventsOutlined,
  EmojiEvents,
} from '@mui/icons-material';

const cardSx = {
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  bgcolor: '#fff',
};

// Mocked data — will be replaced with real endpoint data later.
const MOCK_DATA = {
  assignmentsSubmitted: 24,
  quizzesTaken: 18,
  testsExamsTaken: 4,
  resourcesAccessed: 32,
  submissionRate: 92,
  quizAverageScore: 84,
  overallAverageScore: 78,
  strongestSubject: { name: 'Civic Education', score: 90 },
  needsImprovement: { name: 'Further Mathematics', score: 65 },
  classStanding: { rank: 15, total: 120 },
};

const MiniStatCard = ({ icon: Icon, iconBg, iconColor, label, value }) => (
  <Card elevation={0} sx={{ ...cardSx, p: '12px 14px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        bgcolor: iconBg,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: 20 }} />
    </Box>
    <Box>
      <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography fontWeight="800" sx={{ fontSize: '1.35rem', color: '#111827', lineHeight: 1.1 }}>
        {value}
      </Typography>
    </Box>
  </Card>
);

const MetricCard = ({ label, value, subtext, color }) => (
  <Card elevation={0} sx={{ ...cardSx, p: '12px 14px' }}>
    <Typography fontWeight="700" sx={{ fontSize: '0.78rem', color: '#111827', mb: 0.5 }}>
      {label}
    </Typography>
    <Stack direction="row" alignItems="baseline" spacing={1}>
      <Typography fontWeight="800" sx={{ fontSize: '1.35rem', color: '#111827', lineHeight: 1 }}>
        {value}%
      </Typography>
      <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 500 }}>
        {subtext}
      </Typography>
    </Stack>
    <Box sx={{ mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: '#F3F4F6',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
        }}
      />
    </Box>
  </Card>
);

const AcademicOverview = ({ data = {} }) => {
  // Merge any real data with mocked defaults
  const d = {
    assignmentsSubmitted: data.assignments_submitted ?? MOCK_DATA.assignmentsSubmitted,
    quizzesTaken: data.quizzes_taken ?? MOCK_DATA.quizzesTaken,
    testsExamsTaken: data.tests_exams_taken ?? MOCK_DATA.testsExamsTaken,
    resourcesAccessed: data.resources_accessed ?? MOCK_DATA.resourcesAccessed,
    submissionRate: data.submission_rate ?? MOCK_DATA.submissionRate,
    quizAverageScore: data.quiz_average_score ?? MOCK_DATA.quizAverageScore,
    overallAverageScore: data.overall_average_score ?? MOCK_DATA.overallAverageScore,
    strongestSubject: data.strongest_subject ?? MOCK_DATA.strongestSubject,
    needsImprovement: data.needs_improvement ?? MOCK_DATA.needsImprovement,
    classStanding: data.class_standing ?? MOCK_DATA.classStanding,
  };

  return (
    <Card
      elevation={0}
      sx={{
        ...cardSx,
        p: '16px 18px',
      }}
    >
      {/* Header */}
      <Box mb={2}>
        <Typography fontWeight="800" sx={{ fontSize: '1rem', color: '#111827' }}>
          Academic Overview
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', color: '#6B7280', mt: 0.2 }}>
          Overview of your academic activities this term
        </Typography>
      </Box>

      {/* Row 1: 4 Stat Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={1.5}>
        <Box sx={{ flex: 1 }}>
          <MiniStatCard
            icon={AssignmentTurnedInOutlined}
            iconBg="#dcfce7"
            iconColor="#16a34a"
            label="Assignments Submitted"
            value={d.assignmentsSubmitted}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MiniStatCard
            icon={QuizOutlined}
            iconBg="#ffedd5"
            iconColor="#ea580c"
            label="Quizzes Taken"
            value={d.quizzesTaken}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MiniStatCard
            icon={DescriptionOutlined}
            iconBg="#dbeafe"
            iconColor="#2563eb"
            label="Tests / Exams Taken"
            value={d.testsExamsTaken}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MiniStatCard
            icon={ImageOutlined}
            iconBg="#f3e8ff"
            iconColor="#9333ea"
            label="Resources Accessed"
            value={d.resourcesAccessed}
          />
        </Box>
      </Stack>

      {/* Row 2: 3 Metric Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={1.5}>
        <Box sx={{ flex: 1 }}>
          <MetricCard
            label="Submission Rate"
            value={d.submissionRate}
            subtext="On-time submissions"
            color="#16a34a"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MetricCard
            label="Quiz Average Score"
            value={d.quizAverageScore}
            subtext="Across all quizzes"
            color="#3B82F6"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MetricCard
            label="Overall Average Score"
            value={d.overallAverageScore}
            subtext="Across all subjects"
            color="#9333ea"
          />
        </Box>
      </Stack>

      {/* Row 3: 2 Detail Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        {/* Subject Strength */}
        <Card elevation={0} sx={{ ...cardSx, flex: 1.2, p: '14px 16px' }}>
          <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: '#111827', mb: 1.25 }}>
            Subject Strength
          </Typography>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <EmojiEventsOutlined sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 600 }}>
                  Strongest Subject
                </Typography>
                <Typography fontWeight="700" sx={{ fontSize: '0.78rem', color: '#111827', lineHeight: 1.2 }}>
                  {d.strongestSubject.name} ({d.strongestSubject.score}%)
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: '#ffedd5',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <EmojiEvents sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.65rem', color: '#ea580c', fontWeight: 600 }}>
                  Needs Improvement
                </Typography>
                <Typography fontWeight="700" sx={{ fontSize: '0.78rem', color: '#111827', lineHeight: 1.2 }}>
                  {d.needsImprovement.name} ({d.needsImprovement.score}%)
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Card>

        {/* Class Standing */}
        <Card elevation={0} sx={{ ...cardSx, flex: 0.8, p: '14px 16px' }}>
          <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: '#111827', mb: 1.25 }}>
            Class Standing
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                bgcolor: '#f3e8ff',
                color: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <EmojiEvents sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography fontWeight="800" sx={{ fontSize: '1.25rem', color: '#111827', lineHeight: 1 }}>
                Top {d.classStanding.rank}%
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mt: 0.2 }}>
                Out of {d.classStanding.total} students
              </Typography>
            </Box>
          </Stack>

          {/* Student figures visualization */}
          <Stack direction="row" spacing={0.5} mt={1.5} justifyContent="center">
            {Array.from({ length: 10 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 16,
                  height: 20,
                  borderRadius: '3px 3px 0 0',
                  bgcolor: i < Math.ceil(d.classStanding.rank / 10) ? '#9333ea' : '#E5E7EB',
                  transition: 'background-color 0.3s',
                }}
              />
            ))}
          </Stack>
        </Card>
      </Stack>
    </Card>
  );
};

export default AcademicOverview;
