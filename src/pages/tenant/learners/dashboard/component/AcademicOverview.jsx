import React from 'react';
import { Box, Card, Typography, Stack, LinearProgress, Avatar, Tooltip } from '@mui/material';
import {
  AssignmentTurnedInOutlined,
  QuizOutlined,
  DescriptionOutlined,
  ImageOutlined,
  EmojiEventsOutlined,
  EmojiEvents,
  PersonOutlined,
} from '@mui/icons-material';

const cardSx = {
  borderRadius: '14px',
  border: '1px solid #cbd5e1',
  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)',
  bgcolor: '#fff',
};

const clickableSx = {
  cursor: 'pointer',
  transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
  '&:hover': {
    borderColor: '#94a3b8',
    transform: 'translateY(-3px)',
    boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 16px 32px rgba(15, 23, 42, 0.12)',
  },
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

const MiniStatCard = ({ icon: Icon, iconBg, iconColor, label, value, onClick, sub }) => (
  <Tooltip title={`Click to view ${label} breakdown`} placement="top" arrow>
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        ...cardSx,
        ...clickableSx,
        p: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '8px',
          bgcolor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 17 }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.62rem', color: '#6B7280', fontWeight: 600, lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}
        </Typography>
        <Typography fontWeight="800" sx={{ fontSize: '1.1rem', color: '#111827', lineHeight: 1.1 }}>
          {value}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 500, lineHeight: 1.1 }}>
            {sub}
          </Typography>
        )}
      </Box>
    </Card>
  </Tooltip>
);

const MetricCard = ({ label, value, subtext, color, onClick }) => (
  <Tooltip title={`Click to view ${label} breakdown`} placement="top" arrow>
    <Card
      elevation={0}
      onClick={onClick}
      sx={{ ...cardSx, ...clickableSx, p: '10px 12px' }}
    >
      <Typography fontWeight="700" sx={{ fontSize: '0.72rem', color: '#111827', mb: 0.35 }}>
        {label}
      </Typography>
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography fontWeight="800" sx={{ fontSize: '1.2rem', color: '#111827', lineHeight: 1 }}>
          {value}%
        </Typography>
        <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF', fontWeight: 500 }}>
          {subtext}
        </Typography>
      </Stack>
      <Box sx={{ mt: 0.75 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 5,
            borderRadius: 3,
            bgcolor: '#F3F4F6',
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
          }}
        />
      </Box>
    </Card>
  </Tooltip>
);

const AcademicOverview = ({ data = {}, onCardClick }) => {
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
        p: '14px 16px',
      }}
    >
      {/* Header */}
      <Box mb={1.5}>
        <Typography fontWeight="800" sx={{ fontSize: '0.95rem', color: '#111827' }}>
          Academic Overview
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', color: '#6B7280', mt: 0.15 }}>
          Overview of your academic activities this term
        </Typography>
      </Box>

      {/* Row 1: 4 Stat Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} mb={1.25}>
        <Box sx={{ flex: 1 }}>
          <MiniStatCard
            icon={AssignmentTurnedInOutlined}
            iconBg="#dcfce7"
            iconColor="#16a34a"
            label="Assignments Submitted"
            value={d.assignmentsSubmitted}
            sub={`${d.submissionRate}% on-time`}
            onClick={() => onCardClick('assignments_submitted')}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MiniStatCard
            icon={QuizOutlined}
            iconBg="#ffedd5"
            iconColor="#ea580c"
            label="Quizzes Taken"
            value={d.quizzesTaken}
            onClick={() => onCardClick('quizzes_taken')}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MiniStatCard
            icon={DescriptionOutlined}
            iconBg="#dbeafe"
            iconColor="#2563eb"
            label="Tests / Exams Taken"
            value={d.testsExamsTaken}
            onClick={() => onCardClick('tests_exams_taken')}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MiniStatCard
            icon={ImageOutlined}
            iconBg="#f3e8ff"
            iconColor="#9333ea"
            label="Resources Accessed"
            value={d.resourcesAccessed}
            onClick={() => onCardClick('resources_accessed')}
          />
        </Box>
      </Stack>

      {/* Row 2: 3 Metric Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} mb={1.25}>
        <Box sx={{ flex: 1 }}>
          <MetricCard
            label="Submission Rate"
            value={d.submissionRate}
            subtext="On-time submissions"
            color="#16a34a"
            onClick={() => onCardClick('submission_rate')}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MetricCard
            label="Quiz Average Score"
            value={d.quizAverageScore}
            subtext="Across all quizzes"
            color="#3B82F6"
            onClick={() => onCardClick('quiz_average_score')}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MetricCard
            label="Overall Average Score"
            value={d.overallAverageScore}
            subtext="Across all subjects"
            color="#9333ea"
            onClick={() => onCardClick('overall_average_score')}
          />
        </Box>
      </Stack>{/* Row 3: 2 Detail Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
        {/* Subject Strength */}
        <Tooltip title="Click to view subject strength breakdown" placement="top" arrow>
          <Card
            elevation={0}
            onClick={() => onCardClick('subject_strength')}
            sx={{ ...cardSx, ...clickableSx, flex: 1.2, p: '12px 14px' }}
          >
          <Typography fontWeight="700" sx={{ fontSize: '0.78rem', color: '#111827', mb: 1 }}>
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
        </Tooltip>

        {/* Class Standing */}
        <Tooltip title="Click to view class standing breakdown" placement="top" arrow>
          <Card
            elevation={0}
            onClick={() => onCardClick('class_standing')}
            sx={{ ...cardSx, ...clickableSx, flex: 0.8, p: '12px 14px' }}
          >
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography fontWeight="700" sx={{ fontSize: '0.78rem', color: '#111827' }}>
              Class Standing
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EmojiEvents sx={{ fontSize: 14, color: '#9333ea' }} />
              <Typography fontWeight="800" sx={{ fontSize: '0.82rem', color: '#9333ea' }}>
                Top {d.classStanding.rank}%
              </Typography>
            </Box>
          </Stack>

          <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF', mb: 1 }}>
            Out of {d.classStanding.total} students
          </Typography>

          {/* Human avatars row — show rank position with colored avatars */}
          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
            {Array.from({ length: 10 }).map((_, i) => {
              const isTop = i < Math.ceil(d.classStanding.rank / 10);
              const isMe = i === Math.floor(d.classStanding.rank / 10) - 1;
              return (
                <Avatar
                  key={i}
                  sx={{
                    width: isMe ? 26 : 22,
                    height: isMe ? 26 : 22,
                    bgcolor: isMe ? '#9333ea' : isTop ? '#C4B5FD' : '#E5E7EB',
                    color: isMe ? '#fff' : isTop ? '#7C3AED' : '#9CA3AF',
                    border: isMe ? '2px solid #9333ea' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <PersonOutlined sx={{ fontSize: isMe ? 15 : 12 }} />
                </Avatar>
              );
            })}
          </Stack>
        </Card>
        </Tooltip>
      </Stack>
    </Card>
  );
};

export default AcademicOverview;
