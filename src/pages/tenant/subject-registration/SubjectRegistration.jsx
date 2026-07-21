import React, { useState } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import {
  Box,
  Typography,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
  BarChart as BarChartIcon,
  GridView as GridViewIcon,
  FilterAlt as FilterIcon,
} from '@mui/icons-material';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Subject Registration' },
];

const GENERAL_SUBJECTS = [
  { id: 'bs', name: 'BUSINESS STUDIES', count: 107 },
  { id: 'crs', name: 'CHRISTIAN RELIGIOUS STUDIES', count: 57 },
  { id: 'cca', name: 'CULTURE & CREATIVE ARTS', count: 107 },
  { id: 'dt', name: 'DIGITAL TECHNOLOGIES', count: 107 },
  { id: 'eng', name: 'ENGLISH LANGUAGE', count: 107 },
  { id: 'fr', name: 'FRENCH LANGUAGE', count: 0 },
  { id: 'math', name: 'MATHEMATICS', count: 107 },
  { id: 'bsc', name: 'BASIC SCIENCE', count: 104 },
];

const OPTIONAL_SUBJECTS = [
  { id: 'music', name: 'MUSIC', count: 42 },
  { id: 'home_ec', name: 'HOME ECONOMICS', count: 65 },
  { id: 'agric', name: 'AGRICULTURAL SCIENCE', count: 80 },
  { id: 'pru', name: 'ARABIC LANGUAGE', count: 15 },
];

const INITIAL_LEARNERS = [
  {
    id: 1,
    name: 'ABDULMOJEED Hikmot Oluwakemi',
    registered: { bs: true, crs: false, cca: true, dt: true, eng: true, fr: false, math: true, bsc: true, music: true, home_ec: false, agric: true, pru: false },
  },
  {
    id: 2,
    name: 'ABUAZEEZ Abudqudiri Oluwadamilare',
    registered: { bs: true, crs: false, cca: false, dt: true, eng: true, fr: false, math: true, bsc: true, music: false, home_ec: true, agric: true, pru: false },
  },
  {
    id: 3,
    name: 'ADEBAYO Olawalarami Loveth',
    registered: { bs: true, crs: true, cca: true, dt: true, eng: true, fr: false, math: true, bsc: false, music: true, home_ec: true, agric: false, pru: false },
  },
  {
    id: 4,
    name: 'ADEKUNLE Ibrahim Babatunde',
    registered: { bs: true, crs: true, cca: true, dt: false, eng: true, fr: true, math: true, bsc: true, music: false, home_ec: false, agric: true, pru: true },
  },
  {
    id: 5,
    name: 'AKINTOLA Fatimah Oluwaseun',
    registered: { bs: false, crs: true, cca: true, dt: true, eng: true, fr: false, math: true, bsc: true, music: true, home_ec: true, agric: true, pru: false },
  },
];

const SubjectRegistration = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState(0); // 0 = General Subjects, 1 = Optional Subjects
  const [session, setSession] = useState('2025/2026');
  const [term, setTerm] = useState('Third Term');
  const [programme, setProgramme] = useState('Junior Secondary');
  const [classLevel, setClassLevel] = useState('Junior Secondary 1');
  const [classArm, setClassArm] = useState('A');
  const [learners, setLearners] = useState(INITIAL_LEARNERS);

  const activeSubjects = activeTab === 0 ? GENERAL_SUBJECTS : OPTIONAL_SUBJECTS;

  const toggleRegistration = (learnerId, subjectId) => {
    setLearners((prev) =>
      prev.map((l) =>
        l.id === learnerId
          ? { ...l, registered: { ...l.registered, [subjectId]: !l.registered[subjectId] } }
          : l,
      ),
    );
  };

  const registerAll = (subjectId) => {
    setLearners((prev) =>
      prev.map((l) => ({ ...l, registered: { ...l.registered, [subjectId]: true } })),
    );
  };

  const unregisterAll = (subjectId) => {
    setLearners((prev) =>
      prev.map((l) => ({ ...l, registered: { ...l.registered, [subjectId]: false } })),
    );
  };

  const handleApplyFilter = () => {
    // Filter trigger
  };

  return (
    <PageContainer title="Subject Registration" description="Manage learner subject registration">
      <Breadcrumb title="Subject Registration" items={BCrumb} />

      {/* ── Top Header & Analytics Cards ─────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
              bgcolor: isDark ? 'background.paper' : '#fff',
              boxShadow: isDark
                ? '0 10px 30px rgba(0,0,0,0.35)'
                : '0 0 20px rgba(0,0,0,.10)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '18px', md: '22px' } }}>
              Unity High School (junior), Ijoko
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <Box component="span" color="success.main" fontWeight={600}>
                Active Term:
              </Box>{' '}
              {session} | {term} | Week 13
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
              bgcolor: isDark ? 'background.paper' : '#fff',
              boxShadow: isDark
                ? '0 10px 30px rgba(0,0,0,0.35)'
                : '0 0 20px rgba(0,0,0,.10)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'success.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BarChartIcon sx={{ color: 'success.main', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {GENERAL_SUBJECTS.length + OPTIONAL_SUBJECTS.length}
              </Typography>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                REGISTERED SUBJECTS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Male 52 | Female 55
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
              bgcolor: isDark ? 'background.paper' : '#fff',
              boxShadow: isDark
                ? '0 10px 30px rgba(0,0,0,0.35)'
                : '0 0 20px rgba(0,0,0,.10)',
              height: '100%',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                LEARNER PROGRESS
              </Typography>
              <GridViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Stack>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              98%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={98}
              color="success"
              sx={{ my: 1, height: 6, borderRadius: 3 }}
            />
            <Typography variant="body2" color="text.secondary">
              107 out of 109 Learners
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Main Section wrapped in ParentCard ─────────────────────────────── */}
      <ParentCard title={`Learners Subject Registration ${session} - ${term}`}>
        <Box sx={{ pt: 1 }}>
          {/* General / Optional Subjects Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                  py: 1.5,
                },
              }}
            >
              <Tab label="1. General Subjects" />
              <Tab label="2. Optional Subjects" />
            </Tabs>
          </Box>

          {/* Filters + Filter Button on the SAME ROW (Fully Responsive Grid) */}
          <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session</InputLabel>
                <Select value={session} label="Session" onChange={(e) => setSession(e.target.value)}>
                  <MenuItem value="2025/2026">2025/2026</MenuItem>
                  <MenuItem value="2024/2025">2024/2025</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Term</InputLabel>
                <Select value={term} label="Term" onChange={(e) => setTerm(e.target.value)}>
                  <MenuItem value="Third Term">Third Term</MenuItem>
                  <MenuItem value="Second Term">Second Term</MenuItem>
                  <MenuItem value="First Term">First Term</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select value={programme} label="Programme" onChange={(e) => setProgramme(e.target.value)}>
                  <MenuItem value="Junior Secondary">Junior Secondary</MenuItem>
                  <MenuItem value="Senior Secondary">Senior Secondary</MenuItem>
                  <MenuItem value="Primary">Primary</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select value={classLevel} label="Class" onChange={(e) => setClassLevel(e.target.value)}>
                  <MenuItem value="Junior Secondary 1">Junior Secondary 1</MenuItem>
                  <MenuItem value="Junior Secondary 2">Junior Secondary 2</MenuItem>
                  <MenuItem value="Junior Secondary 3">Junior Secondary 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 1.4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Arm</InputLabel>
                <Select value={classArm} label="Arm" onChange={(e) => setClassArm(e.target.value)}>
                  {['A', 'B', 'C', 'D'].map((arm) => (
                    <MenuItem key={arm} value={arm}>{arm}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 1.4 }}>
              <Button
                variant="contained"
                size="small"
                fullWidth
                startIcon={<FilterIcon />}
                onClick={handleApplyFilter}
                sx={{ height: 40 }}
              >
                Filter
              </Button>
            </Grid>
          </Grid>

          {/* Matrix Table */}
          <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      minWidth: 240,
                      fontWeight: 700,
                      position: 'sticky',
                      left: 0,
                      bgcolor: isDark ? '#1e2a3a' : '#f8f9fa',
                      zIndex: 2,
                      borderRight: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    Learner's Name
                  </TableCell>
                  {activeSubjects.map((subj) => (
                    <TableCell key={subj.id} align="center" sx={{ minWidth: 140, verticalAlign: 'top', pt: 2 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ display: 'block', textTransform: 'uppercase' }}>
                        {subj.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        ({subj.count} learners)
                      </Typography>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title={`Register all for ${subj.name}`}>
                          <IconButton size="small" onClick={() => registerAll(subj.id)}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={`Unregister all for ${subj.name}`}>
                          <IconButton size="small" onClick={() => unregisterAll(subj.id)}>
                            <CancelOutlinedIcon color="error" fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {learners.map((learner, idx) => (
                  <TableRow key={learner.id} hover>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        bgcolor: 'background.paper',
                        zIndex: 1,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main' }}>
                          {idx + 1}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {learner.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    {activeSubjects.map((subj) => (
                      <TableCell key={subj.id} align="center">
                        <IconButton size="small" onClick={() => toggleRegistration(learner.id, subj.id)}>
                          {learner.registered[subj.id] ? (
                            <CheckCircleIcon color="success" fontSize="medium" />
                          ) : (
                            <CancelOutlinedIcon color="error" fontSize="medium" />
                          )}
                        </IconButton>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

export default SubjectRegistration;
