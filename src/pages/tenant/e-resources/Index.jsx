import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  Chip,
  Button,
  TextField,
  Paper,
  useTheme,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import {
  IconPlayerPlay,
  IconSchool,
  IconNotes,
  IconCircleCheck,
  IconArrowRight,
  IconSearch,
  IconFileText,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import { usePermissions } from '@/context/TenantContext/permissions';
import StatCard from '@/components/shared/StatCard';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { title: 'E-Resources' },
];

const FILTER_CATEGORIES = [
  { key: 'all', label: 'All Modules' },
  { key: 'teacher', label: 'Teacher & Planning' },
  { key: 'student', label: 'Student Portal' },
  { key: 'media', label: 'Video Tutorials' },
  { key: 'approval', label: 'Review & Approvals' },
];

const Index = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { can } = usePermissions();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = useMemo(() => [
    {
      key: 'video-tutorials',
      category: 'media',
      title: 'Video Tutorials',
      subtitle: 'Scheme of Work Digital Library',
      description: 'Stream weekly video lessons and download supplementary learning materials mapped directly to the school curriculum scheme of work.',
      icon: IconPlayerPlay,
      color: '#2563EB',
      bg: isDark ? 'rgba(37, 99, 235, 0.15)' : '#DBEAFE',
      path: '/e-resources/video-tutorials',
      visible: can('e_resources.view'),
      tag: 'Browse Scheme',
      features: [
        'Week-by-week scheme linking',
        'Direct video streaming & YouTube integration',
        'Downloadable teaching materials',
        'Filter by class, programme & subject',
      ],
      quickLinks: [
        { label: 'Browse Scheme', path: '/e-resources/video-tutorials' },
      ],
    },
    {
      key: 'student',
      category: 'student',
      title: 'Student E-Resources Hub',
      subtitle: 'Learner Portal & Self-Paced Quizzes',
      description: 'Access approved class notes, topic summaries, interactive weekly quizzes, and progress analytics for registered subjects.',
      icon: IconSchool,
      color: '#0284C7',
      bg: isDark ? 'rgba(2, 132, 199, 0.15)' : '#E0F2FE',
      path: '/e-resources/student',
      visible: can('e_resources.lesson_note.student.view'),
      tag: 'Student Access',
      features: [
        'Enrolled subject notes & attachments',
        'Interactive weekly topic quizzes',
        'Personal learning progress tracker',
        'Accessible on mobile & desktop',
      ],
      quickLinks: [
        { label: 'My Subjects', path: '/e-resources/student' },
        { label: 'Browse Materials', path: '/e-resources/student/browse' },
        { label: 'Assessments', path: '/e-resources/student/assessment' },
        { label: 'My Progress', path: '/e-resources/student/progress' },
      ],
    },
    {
      key: 'lesson-note',
      category: 'teacher',
      title: 'Teacher Lesson Notes & Plans',
      subtitle: 'Courseware Authoring & Management',
      description: 'Design structured lesson plans, write rich lesson notes with AI drafting assistance, upload instructional videos, and track syllabus coverage.',
      icon: IconNotes,
      color: '#9333EA',
      bg: isDark ? 'rgba(147, 51, 234, 0.15)' : '#F3E8FF',
      path: '/e-resources/lesson-note',
      visible: can('e_resources.lesson_note.teacher.view'),
      tag: 'Teacher Workspace',
      features: [
        'Rich-text lesson note editor',
        'Structured weekly lesson plan generator',
        'AI Assistant for instant content drafting',
        'Teaching progress & syllabus tracker',
      ],
      quickLinks: [
        { label: 'Notes Desk', path: '/e-resources/lesson-note' },
        { label: 'New Note', path: '/e-resources/lesson-note/note' },
        { label: 'Lesson Plan', path: '/e-resources/lesson-note/plan' },
        { label: 'Video Manager', path: '/e-resources/lesson-note/video' },
        { label: 'Class Progress', path: '/e-resources/lesson-note/progress' },
      ],
    },
    {
      key: 'approval',
      category: 'approval',
      title: 'Lesson Note Approvals',
      subtitle: 'Editorial & Quality Assurance Desk',
      description: 'Review console for Heads of Department and school administrators to evaluate, comment on, and approve submitted lesson notes and plans.',
      icon: IconCircleCheck,
      color: '#16A34A',
      bg: isDark ? 'rgba(22, 163, 74, 0.15)' : '#DCFCE7',
      path: '/e-resources/approval',
      visible: can('e_resources.lesson_note.approval.view'),
      tag: 'Quality Control',
      features: [
        'Unified pending approval queue',
        'Multi-type inspection (Notes, Plans, Videos)',
        'One-click approval or rejection with notes',
        'Audit trail & status history',
      ],
      quickLinks: [
        { label: 'Review Queue', path: '/e-resources/approval' },
      ],
    },
  ], [can, isDark]);

  const visibleSections = useMemo(() => {
    return sections
      .filter((section) => section.visible)
      .filter((section) => {
        if (activeTab === 'all') return true;
        return section.category === activeTab;
      })
      .filter((section) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          section.title.toLowerCase().includes(q) ||
          section.subtitle.toLowerCase().includes(q) ||
          section.description.toLowerCase().includes(q) ||
          section.tag.toLowerCase().includes(q) ||
          section.features.some((f) => f.toLowerCase().includes(q))
        );
      });
  }, [sections, activeTab, searchQuery]);

  return (
    <PageContainer title="E-Resources" description="Manage digital learning resources, lesson notes, and tutorials">
      <Breadcrumb title="E-Resources" items={BCrumb} />

      {/* ── Top KPI Stat Cards ────────────────────────────────────────── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
        <StatCard
          count="Browse"
          label="Video Tutorials"
          subtitle="Scheme-of-work lessons"
          icon={IconPlayerPlay}
          colorIndex={0}
          onClick={() => navigate('/e-resources/video-tutorials')}
        />
        <StatCard
          count="Author"
          label="Lesson Notes"
          subtitle="Teacher notes & outlines"
          icon={IconNotes}
          colorIndex={2}
          onClick={() => navigate('/e-resources/lesson-note')}
        />
        <StatCard
          count="Plan"
          label="Lesson Plans"
          subtitle="Curriculum frameworks"
          icon={IconFileText}
          colorIndex={3}
          onClick={() => navigate('/e-resources/lesson-note/plan')}
        />
        <StatCard
          count="Review"
          label="Approvals Queue"
          subtitle="Quality review & sign-off"
          icon={IconCircleCheck}
          colorIndex={1}
          onClick={() => navigate('/e-resources/approval')}
        />
        <StatCard
          count="Learn"
          label="Student Portal"
          subtitle="Notes, quizzes & progress"
          icon={IconSchool}
          colorIndex={0}
          onClick={() => navigate('/e-resources/student')}
        />
      </Stack>

      {/* ── Filters + Content Card ───────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', md: 'center' }}
            sx={{ flexGrow: 1 }}
          >
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="module-category-label">Category</InputLabel>
              <Select
                labelId="module-category-label"
                label="Category"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                {FILTER_CATEGORIES.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search e-resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <IconSearch size={16} style={{ marginRight: 6, color: '#94a3b8' }} />,
              }}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', md: 260 } }}
            />
          </Stack>

          <Divider sx={{ my: 2.5 }} />

      {/* ── Main Module Cards Grid ───────────────────────────────────── */}
      {visibleSections.length === 0 ? (
        <Card
          variant="outlined"
          sx={{
            borderRadius: '14px',
            borderColor: isDark ? 'divider' : '#E5E7EB',
            py: 6,
            textAlign: 'center',
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              No matching modules found
            </Typography>
            <Typography variant="body2" color="textSecondary" maxWidth={420} mx="auto" mb={2}>
              {searchQuery
                ? `No modules matched your search "${searchQuery}". Try a different keyword.`
                : 'You do not have access to any e-resources section. Contact your administrator if this is unexpected.'}
            </Typography>
            {searchQuery && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
              >
                Reset Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {visibleSections.map((section) => {
            const SectionIcon = section.icon;

            return (
              <Grid size={{ xs: 12, md: 6 }} key={section.key}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                    bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 150ms ease',
                    '&:hover': {
                      borderColor: '#94a3b8',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1.75 }}
                    >
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: section.bg,
                          color: section.color,
                        }}
                      >
                        <SectionIcon size={24} />
                      </Box>
                      <Chip
                        label={section.tag}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          borderRadius: '6px',
                          bgcolor: section.bg,
                          color: section.color,
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: 17,
                        mb: 0.5,
                      }}
                    >
                      {section.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: isDark ? 'text.secondary' : '#64748b',
                        fontSize: 13,
                        lineHeight: 1.6,
                        mb: 2,
                      }}
                    >
                      {section.description}
                    </Typography>

                    {/* Capabilities bullets */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '10px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                        mb: 2,
                      }}
                    >
                      <Grid container spacing={0.75}>
                        {section.features.map((feature, fIdx) => (
                          <Grid size={{ xs: 12, sm: 6 }} key={fIdx}>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <Box
                                sx={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: '50%',
                                  bgcolor: section.color,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                sx={{
                                  fontSize: 11.5,
                                  color: isDark ? '#cbd5e1' : '#475569',
                                  fontWeight: 500,
                                }}
                              >
                                {feature}
                              </Typography>
                            </Stack>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Box>

                  {/* Card Footer: Quick links + Open Button */}
                  <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: isDark ? 'divider' : '#f1f5f9' }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent="space-between"
                      spacing={1.5}
                    >
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {section.quickLinks.map((ql, qIdx) => (
                          <Chip
                            key={qIdx}
                            label={ql.label}
                            size="small"
                            onClick={() => navigate(ql.path)}
                            clickable
                            sx={{
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: '6px',
                              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                              color: isDark ? '#cbd5e1' : '#475569',
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
                              },
                            }}
                          />
                        ))}
                      </Stack>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(section.path)}
                        endIcon={<IconArrowRight size={14} />}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: 12,
                          px: 1.75,
                          py: 0.6,
                          bgcolor: section.color,
                          '&:hover': {
                            bgcolor: section.color,
                            filter: 'brightness(0.92)',
                          },
                        }}
                      >
                        Open
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
            </Grid>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Index;

