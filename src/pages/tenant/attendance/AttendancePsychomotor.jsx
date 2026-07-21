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
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  useTheme,
  TablePagination,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  FilterAlt as FilterIcon,
  Email as EmailIcon,
  NotificationsActive as NotificationsActiveIcon,
  Add as AddIcon,
  PeopleOutline as PeopleOutlineIcon,
  FileDownload as DownloadIcon,
  Save as SaveIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  AnalyticsOutlined as AnalyticsIcon,
  WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Attendance & Psychomotor' },
];

const AFFECTIVE_TRAITS = ['Punctuality', 'Neatness', 'Honesty'];
const PSYCHOMOTOR_TRAITS = ['Handwriting', 'Games & Sports', 'Drawing & Painting'];

const ATTENDANCE_LEARNERS = [
  {
    id: 1,
    name: 'ABDULMOJEED HIKMOT OLUWAKEMI',
    gender: 'FEMALE',
    tags: ['DROPOUT RISK'],
    attendance: { Monday: 'absent', Tuesday: 'holiday', Wednesday: 'unknown', Thursday: 'present', Friday: 'present' },
  },
  {
    id: 2,
    name: 'ABUDAZEEZ ABUDQUDIRI OLUWADAMILARE',
    gender: 'MALE',
    tags: [],
    attendance: { Monday: 'present', Tuesday: 'holiday', Wednesday: 'present', Thursday: 'present', Friday: 'present' },
  },
  {
    id: 3,
    name: 'ADEBAYO Olawalarami Loveth',
    gender: 'FEMALE',
    tags: [],
    attendance: { Monday: 'present', Tuesday: 'holiday', Wednesday: 'present', Thursday: 'present', Friday: 'present' },
  },
];

const PSYCHOMOTOR_LEARNERS = [
  {
    id: 1,
    name: 'BADMUS Jamai Ayodele',
    gender: 'MALE',
    initials: 'BJ',
    reg: '2025/JSS1A/004',
    color: '#1a2e4a',
    affective: { Punctuality: 4, Neatness: 4, Honesty: 5 },
    psychomotor: { Handwriting: 3, 'Games & Sports': 5, 'Drawing & Painting': 4 },
  },
  {
    id: 2,
    name: 'BALOGUN Joseph Itunidun',
    gender: 'MALE',
    initials: 'BJ',
    reg: '2025/JSS1A/012',
    color: '#2e7d32',
    affective: { Punctuality: 2, Neatness: 3, Honesty: 4 },
    psychomotor: { Handwriting: 5, 'Games & Sports': 2, 'Drawing & Painting': 4 },
  },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const weeklyTotal = (att) => {
  return Object.values(att).filter((v) => v === 'present').length;
};

const AttendancePsychomotor = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState(0); // 0 = Mark Attendance, 1 = Mark Psychomotor
  const [attendanceType, setAttendanceType] = useState('morning');
  
  // Active Analytics Modal state
  const [analyticsModal, setAnalyticsModal] = useState({ open: false, title: '', content: null });

  const [attendanceData, setAttendanceData] = useState(
    ATTENDANCE_LEARNERS.reduce((acc, l) => {
      acc[l.id] = { ...l.attendance };
      return acc;
    }, {}),
  );

  const [assessments, setAssessments] = useState(
    PSYCHOMOTOR_LEARNERS.reduce((acc, l) => {
      acc[l.id] = {
        affective: { ...l.affective },
        psychomotor: { ...l.psychomotor },
      };
      return acc;
    }, {}),
  );

  // Dynamic metrics affected by filters
  const [attendanceMetrics, setAttendanceMetrics] = useState({
    daysOpen: 97,
    weekRate: 56,
    termRate: 44,
    totalAbsentees: 72,
    atRisk: 1,
  });

  const [psychomotorMetrics, setPsychomotorMetrics] = useState({
    avgAffective: 4.2,
    avgPsychomotor: 3.8,
    needingSupport: 12,
    maleRating: 4.1,
    femaleRating: 4.3,
  });

  // Filters
  const [attSession, setAttSession] = useState('2023/2024');
  const [attTerm, setAttTerm] = useState('First Term');
  const [attWeek, setAttWeek] = useState('Week 8');
  const [attDay, setAttDay] = useState('2023-11-24');
  const [attProgramme, setAttProgramme] = useState('Junior Secondary');
  const [attClass, setAttClass] = useState('JS 1 A');

  const [pSession, setPSession] = useState('2025/2026');
  const [pTerm, setPTerm] = useState('Third Term');
  const [pProgramme, setPProgramme] = useState('Junior Secondary');
  const [pClassArm, setPClassArm] = useState('Junior Secondary 1A');

  // Pagination for psychomotor
  const [pPage, setPPage] = useState(0);
  const [pRowsPerPage, setPRowsPerPage] = useState(10);

  const handleApplyAttFilter = () => {
    const isJS = attProgramme === 'Junior Secondary';
    setAttendanceMetrics({
      daysOpen: 97,
      weekRate: isJS ? 56 : 64,
      termRate: isJS ? 44 : 52,
      totalAbsentees: isJS ? 72 : 48,
      atRisk: isJS ? 1 : 0,
    });
  };

  const handleApplyPsyFilter = () => {
    const isThirdTerm = pTerm === 'Third Term';
    setPsychomotorMetrics({
      avgAffective: isThirdTerm ? 4.2 : 4.0,
      avgPsychomotor: isThirdTerm ? 3.8 : 3.6,
      needingSupport: isThirdTerm ? 12 : 8,
      maleRating: 4.1,
      femaleRating: 4.3,
    });
  };

  const setRating = (studentId, domain, trait, value) => {
    setAssessments((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [domain]: { ...prev[studentId][domain], [trait]: value },
      },
    }));
  };

  const setDayStatus = (learnerId, day, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [learnerId]: {
        ...prev[learnerId],
        [day]: status,
      },
    }));
  };

  const bulkSetDayStatus = (day, status) => {
    setAttendanceData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        if (updated[id][day] !== 'holiday') {
          updated[id][day] = status;
        }
      });
      return updated;
    });
  };

  const openCardModal = (cardTitle, modalBody) => {
    setAnalyticsModal({
      open: true,
      title: cardTitle,
      content: modalBody,
    });
  };

  return (
    <PageContainer title="Attendance & Psychomotor" description="Mark attendance and psychomotor assessments">
      <Breadcrumb title="Attendance & Psychomotor" items={BCrumb} />

      {/* ── Dynamic Analytics Cards (Full-width Grid) ───────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {activeTab === 0 ? (
          <>
            {/* Card 1: DAYS SCHOOL OPEN — NOT CLICKABLE */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
                  bgcolor: isDark ? 'background.paper' : '#fff',
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
                  height: '100%',
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">DAYS SCHOOL OPEN</Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{attendanceMetrics.daysOpen}%</Typography>
                <LinearProgress variant="determinate" value={attendanceMetrics.daysOpen} color="success" sx={{ my: 1, height: 4, borderRadius: 2 }} />
                <Typography variant="caption" color="text.secondary">126 out of 130</Typography>
              </Paper>
            </Grid>

            {/* Card 2: WEEK ATTENDANCE RATE — CLICKABLE */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper
                elevation={0}
                onClick={() =>
                  openCardModal('Week Attendance Rate Analysis', (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Detailed weekly breakdown by days and class arms for Week 8.
                      </Typography>
                      <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Day</TableCell>
                              <TableCell>Present</TableCell>
                              <TableCell>Absent</TableCell>
                              <TableCell>Rate</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow><TableCell>Monday</TableCell><TableCell>98</TableCell><TableCell>11</TableCell><TableCell>89.9%</TableCell></TableRow>
                            <TableRow><TableCell>Tuesday</TableCell><TableCell>105</TableCell><TableCell>4</TableCell><TableCell>96.3%</TableCell></TableRow>
                            <TableRow><TableCell>Wednesday</TableCell><TableCell>92</TableCell><TableCell>17</TableCell><TableCell>84.4%</TableCell></TableRow>
                            <TableRow><TableCell>Thursday</TableCell><TableCell>101</TableCell><TableCell>8</TableCell><TableCell>92.6%</TableCell></TableRow>
                            <TableRow><TableCell>Friday</TableCell><TableCell>99</TableCell><TableCell>10</TableCell><TableCell>90.8%</TableCell></TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))
                }
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
                  bgcolor: isDark ? 'background.paper' : '#fff',
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-3px)' },
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">WEEK ATTENDANCE RATE</Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{attendanceMetrics.weekRate}%</Typography>
                <LinearProgress variant="determinate" value={attendanceMetrics.weekRate} color="error" sx={{ my: 1, height: 4, borderRadius: 2 }} />
                <Typography variant="caption" color="text.secondary">0% Same as last week</Typography>
              </Paper>
            </Grid>

            {/* Card 3: TERM ATTENDANCE RATE — CLICKABLE */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper
                elevation={0}
                onClick={() =>
                  openCardModal('Term Attendance Trend', (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Term-to-date attendance performance trend across all weeks.
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box><Typography variant="caption" fontWeight={700}>Week 1–4 Average: 88%</Typography><LinearProgress variant="determinate" value={88} color="success" sx={{ height: 6, borderRadius: 3 }} /></Box>
                        <Box><Typography variant="caption" fontWeight={700}>Week 5–8 Average: 91%</Typography><LinearProgress variant="determinate" value={91} color="success" sx={{ height: 6, borderRadius: 3 }} /></Box>
                        <Box><Typography variant="caption" fontWeight={700}>Week 9–13 Projection: 94%</Typography><LinearProgress variant="determinate" value={94} color="primary" sx={{ height: 6, borderRadius: 3 }} /></Box>
                      </Stack>
                    </Box>
                  ))
                }
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
                  bgcolor: isDark ? 'background.paper' : '#fff',
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-3px)' },
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">TERM ATTENDANCE RATE</Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{attendanceMetrics.termRate}%</Typography>
                <LinearProgress variant="determinate" value={attendanceMetrics.termRate} color="success" sx={{ my: 1, height: 4, borderRadius: 2 }} />
                <Typography variant="caption" color="success.main" fontWeight={600}>↑ 44% Higher last term</Typography>
              </Paper>
            </Grid>

            {/* Card 4: TOTAL ABSENTEES — CLICKABLE */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper
                elevation={0}
                onClick={() =>
                  openCardModal('Absentees Summary List', (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Total absentees recorded for current term session.
                      </Typography>
                      <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow><TableCell>Learner Name</TableCell><TableCell>Class</TableCell><TableCell>Absences</TableCell></TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow><TableCell>ABDULMOJEED Hikmot</TableCell><TableCell>JS 1 A</TableCell><TableCell>4 days</TableCell></TableRow>
                            <TableRow><TableCell>OKONKWO Chidi</TableCell><TableCell>JS 1 B</TableCell><TableCell>3 days</TableCell></TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))
                }
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
                  bgcolor: isDark ? 'background.paper' : '#fff',
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
                  height: '100%',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-3px)' },
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">TOTAL ABSENTEES</Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{attendanceMetrics.totalAbsentees}</Typography>
                <LinearProgress variant="determinate" value={30} color="error" sx={{ my: 1, height: 4, borderRadius: 2 }} />
                <Typography variant="caption" color="text.secondary">Current Session</Typography>
                <Box sx={{ position: 'absolute', right: 12, bottom: 12, opacity: 0.1 }}>
                  <PeopleOutlineIcon sx={{ fontSize: 36 }} />
                </Box>
              </Paper>
            </Grid>

            {/* Card 5: AT-RISK STUDENTS — CLICKABLE */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper
                elevation={0}
                onClick={() =>
                  openCardModal('At-Risk Learners Alert List', (
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                        <WarningIcon color="error" />
                        <Typography variant="body2" color="error.main" fontWeight={600}>
                          Learners with 1+ Week Consecutive Absence
                        </Typography>
                      </Stack>
                      <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow><TableCell>Learner</TableCell><TableCell>Class</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell></TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>ABDULMOJEED Hikmot</TableCell>
                              <TableCell>JS 1 A</TableCell>
                              <TableCell><Chip label="DROPOUT RISK" size="small" color="error" sx={{ fontSize: 9, fontWeight: 700 }} /></TableCell>
                              <TableCell><Button size="small" variant="contained" color="error">Send Alert</Button></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))
                }
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  border: `2px solid ${theme.palette.error.main}`,
                  bgcolor: isDark ? 'background.paper' : '#fff',
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-3px)' },
                }}
              >
                <Typography variant="caption" fontWeight={700} color="error.main">AT-RISK STUDENTS</Typography>
                <Typography variant="h4" fontWeight={700} color="error.main" sx={{ my: 0.5 }}>{attendanceMetrics.atRisk}</Typography>
                <LinearProgress variant="determinate" value={15} color="error" sx={{ my: 1, height: 4, borderRadius: 2 }} />
                <Typography variant="caption" color="error.main">1+ Week Absence</Typography>
              </Paper>
            </Grid>
          </>
        ) : (
          <>
            {/* Card 1: AVG. AFFECTIVE RATING — NOT CLICKABLE */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
                  bgcolor: isDark ? 'background.paper' : '#fff',
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
                  height: '100%',
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">AVG. AFFECTIVE RATING</Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{psychomotorMetrics.avgAffective}/5</Typography>
                <LinearProgress variant="determinate" value={84} color="success" sx={{ my: 1, height: 4, borderRadius: 2 }} />
                <Typography variant="caption" color="success.main" fontWeight={600}>+0.4 from last term</Typography>
              </Paper>
            </Grid>

            {/* Card 2: AVG. PSYCHOMOTOR RATING — CLICKABLE */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                onClick={() =>
                  openCardModal('Psychomotor Rating Breakdown', (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Average rating distribution per psychomotor skill.
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box><Typography variant="caption" fontWeight={700}>Handwriting: 4.1 / 5</Typography><LinearProgress variant="determinate" value={82} color="primary" sx={{ height: 6, borderRadius: 3 }} /></Box>
                        <Box><Typography variant="caption" fontWeight={700}>Games & Sports: 3.6 / 5</Typography><LinearProgress variant="determinate" value={72} color="primary" sx={{ height: 6, borderRadius: 3 }} /></Box>
                        <Box><Typography variant="caption" fontWeight={700}>Drawing & Painting: 3.7 / 5</Typography><LinearProgress variant="determinate" value={74} color="primary" sx={{ height: 6, borderRadius: 3 }} /></Box>
                      </Stack>
                    </Box>
                  ))
                }
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
                  bgcolor: isDark ? 'background.paper' : '#fff',
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-3px)' },
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">AVG. PSYCHOMOTOR RATING</Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{psychomotorMetrics.avgPsychomotor}/5</Typography>
                <LinearProgress variant="determinate" value={76} color="primary" sx={{ my: 1, height: 4, borderRadius: 2 }} />
                <Typography variant="caption" color="text.secondary">→ Stable performance</Typography>
              </Paper>
            </Grid>

            {/* Card 3: NEEDING SUPPORT — CLICKABLE */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                onClick={() =>
                  openCardModal('Learners Needing Support List', (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Students with rating scores under 3.0 needing targeted support.
                      </Typography>
                      <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow><TableCell>Learner</TableCell><TableCell>Weak Domain</TableCell><TableCell>Score</TableCell></TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow><TableCell>BALOGUN Joseph</TableCell><TableCell>Punctuality</TableCell><TableCell>2 / 5</TableCell></TableRow>
                            <TableRow><TableCell>ADEKUNLE Ibrahim</TableCell><TableCell>Games & Sports</TableCell><TableCell>2 / 5</TableCell></TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))
                }
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
                  bgcolor: isDark ? 'background.paper' : '#fff',
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-3px)' },
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" fontWeight={700} color="text.secondary">NEEDING SUPPORT</Typography>
                  <Chip label="URGENT" size="small" color="error" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
                </Stack>
                <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{psychomotorMetrics.needingSupport}</Typography>
                <Button size="small" variant="outlined" sx={{ mt: 0.5, textTransform: 'none' }}>
                  View Details
                </Button>
              </Paper>
            </Grid>

            {/* Card 4: RATING BY GENDER — CLICKABLE */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                onClick={() =>
                  openCardModal('Gender Rating Detailed Comparison', (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Detailed affective vs psychomotor comparison by gender.
                      </Typography>
                      <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow><TableCell>Gender</TableCell><TableCell>Affective Avg</TableCell><TableCell>Psychomotor Avg</TableCell></TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow><TableCell>Male</TableCell><TableCell>4.1 / 5</TableCell><TableCell>3.7 / 5</TableCell></TableRow>
                            <TableRow><TableCell>Female</TableCell><TableCell>4.3 / 5</TableCell><TableCell>3.9 / 5</TableCell></TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))
                }
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
                  bgcolor: isDark ? 'background.paper' : '#fff',
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-3px)' },
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  RATING BY GENDER
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.25}>
                      <Typography variant="caption" fontWeight={700}>MALE</Typography>
                      <Typography variant="caption" fontWeight={700}>{psychomotorMetrics.maleRating}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={82} color="primary" sx={{ height: 4, borderRadius: 2 }} />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.25}>
                      <Typography variant="caption" fontWeight={700}>FEMALE</Typography>
                      <Typography variant="caption" fontWeight={700}>{psychomotorMetrics.femaleRating}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={86} color="success" sx={{ height: 4, borderRadius: 2 }} />
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>

      {/* ── Main Section Wrapped in ParentCard (PROJECT STANDARD TABS) ───── */}
      <ParentCard
        title={
          <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
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
              <Tab label="1. Mark Attendance" />
              <Tab label="2. Mark Psychomotor" />
            </Tabs>
          </Box>
        }
      >
        {/* ── MARK ATTENDANCE CONTENT ────────────────────────────────────── */}
        {activeTab === 0 && (
          <Box sx={{ pt: 1 }}>
            {/* Action buttons row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={1.5}>
              <Typography variant="h6" fontWeight={700}>
                Learner Attendance
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="outlined" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<EmailIcon />}>
                  Send Alerts
                </Button>
                <Button variant="outlined" color="error" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<NotificationsActiveIcon />}>
                  Risk Alerts
                </Button>
                <Button variant="contained" color="success" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<AddIcon />}>
                  Attendance Report
                </Button>
              </Stack>
            </Stack>

            {/* Filter grid */}
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Session</InputLabel>
                  <Select value={attSession} label="Session" onChange={(e) => setAttSession(e.target.value)}>
                    <MenuItem value="2023/2024">2023/2024</MenuItem>
                    <MenuItem value="2024/2025">2024/2025</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Term</InputLabel>
                  <Select value={attTerm} label="Term" onChange={(e) => setAttTerm(e.target.value)}>
                    <MenuItem value="First Term">First Term</MenuItem>
                    <MenuItem value="Second Term">Second Term</MenuItem>
                    <MenuItem value="Third Term">Third Term</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Weeks</InputLabel>
                  <Select value={attWeek} label="Weeks" onChange={(e) => setAttWeek(e.target.value)}>
                    <MenuItem value="Week 8">Week 8</MenuItem>
                    <MenuItem value="Week 9">Week 9</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Days</InputLabel>
                  <Select value={attDay} label="Days" onChange={(e) => setAttDay(e.target.value)}>
                    <MenuItem value="2023-11-24">2023-11-24</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Programme</InputLabel>
                  <Select value={attProgramme} label="Programme" onChange={(e) => setAttProgramme(e.target.value)}>
                    <MenuItem value="Junior Secondary">Junior Secondary</MenuItem>
                    <MenuItem value="Senior Secondary">Senior Secondary</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                <Button variant="contained" size="small" fullWidth startIcon={<FilterIcon />} onClick={handleApplyAttFilter}>
                  Filter
                </Button>
              </Grid>
            </Grid>

            {/* Radio toggle for Morning/Afternoon */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              <RadioGroup row value={attendanceType} onChange={(e) => setAttendanceType(e.target.value)}>
                <FormControlLabel value="morning" control={<Radio size="small" />} label="Morning" />
                <FormControlLabel value="afternoon" control={<Radio size="small" />} label="Afternoon" />
              </RadioGroup>
            </Box>

            {/* Attendance Table & Summary Grid */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 9 }}>
                <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>S/N</TableCell>
                        <TableCell sx={{ minWidth: 200 }}>Learner's Name</TableCell>
                        {DAYS.map((day) => (
                          <TableCell key={day} align="center" sx={{ minWidth: 100 }}>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {day}
                            </Typography>
                            {/* Radio buttons in header for bulk toggle */}
                            <Stack direction="row" spacing={0.25} justifyContent="center" mt={0.5}>
                              <Tooltip title={`Mark all ${day} Present`}>
                                <IconButton size="small" onClick={() => bulkSetDayStatus(day, 'present')}>
                                  <CheckCircleIcon color="success" fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={`Mark all ${day} Absent`}>
                                <IconButton size="small" onClick={() => bulkSetDayStatus(day, 'absent')}>
                                  <CancelOutlinedIcon color="error" fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={`Clear all ${day}`}>
                                <IconButton size="small" onClick={() => bulkSetDayStatus(day, 'unknown')}>
                                  <RadioButtonUncheckedIcon color="action" fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        ))}
                        <TableCell align="center">Weekly Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ATTENDANCE_LEARNERS.map((learner, idx) => {
                        const att = attendanceData[learner.id];
                        return (
                          <TableRow key={learner.id} hover>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {learner.name}
                                </Typography>
                                {/* Project standard gender chip */}
                                <Chip
                                  icon={learner.gender === 'MALE' ? <MaleIcon fontSize="small" /> : <FemaleIcon fontSize="small" />}
                                  label={learner.gender}
                                  size="small"
                                  color={learner.gender === 'MALE' ? 'primary' : 'success'}
                                  variant="soft"
                                  sx={{ height: 20, fontSize: '10px', fontWeight: 600 }}
                                />
                              </Box>
                              {learner.tags.map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  color="error"
                                  sx={{ height: 16, fontSize: '9px', fontWeight: 700, mt: 0.25 }}
                                />
                              ))}
                            </TableCell>
                            {DAYS.map((day) => (
                              <TableCell key={day} align="center">
                                {att[day] === 'holiday' ? (
                                  <Typography variant="caption" color="text.secondary" fontStyle="italic">Holiday</Typography>
                                ) : (
                                  <RadioGroup
                                    row
                                    value={att[day]}
                                    onChange={(e) => setDayStatus(learner.id, day, e.target.value)}
                                    sx={{ justifyContent: 'center' }}
                                  >
                                    <FormControlLabel
                                      value="present"
                                      control={<Radio size="small" color="success" sx={{ p: 0.25 }} />}
                                      label=""
                                      sx={{ m: 0 }}
                                    />
                                    <FormControlLabel
                                      value="absent"
                                      control={<Radio size="small" color="error" sx={{ p: 0.25 }} />}
                                      label=""
                                      sx={{ m: 0 }}
                                    />
                                    <FormControlLabel
                                      value="unknown"
                                      control={<Radio size="small" color="default" sx={{ p: 0.25 }} />}
                                      label=""
                                      sx={{ m: 0 }}
                                    />
                                  </RadioGroup>
                                )}
                              </TableCell>
                            ))}
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight={700}>
                                {weeklyTotal(att)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }}>
                    Submit Attendance
                  </Button>
                </Box>
              </Grid>

              {/* Right Summary Card */}
              <Grid size={{ xs: 12, lg: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '12px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.grey[200]}`,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      TOTAL ATTENDANCE
                    </Typography>
                    <Typography variant="h2" fontWeight={800} color="text.primary" sx={{ my: 1 }}>
                      90%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      98 present out of 109 learners
                    </Typography>
                    <Typography variant="caption" color="success.main" fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
                      ↑ 90% Higher than yesterday
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 3 }}>
                    Powered by EduTAMS
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ── MARK PSYCHOMOTOR CONTENT ───────────────────────────────────── */}
        {activeTab === 1 && (
          <Box sx={{ pt: 1 }}>
            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Session</InputLabel>
                  <Select value={pSession} label="Session" onChange={(e) => setPSession(e.target.value)}>
                    <MenuItem value="2025/2026">2025/2026</MenuItem>
                    <MenuItem value="2024/2025">2024/2025</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Term</InputLabel>
                  <Select value={pTerm} label="Term" onChange={(e) => setPTerm(e.target.value)}>
                    <MenuItem value="Third Term">Third Term</MenuItem>
                    <MenuItem value="Second Term">Second Term</MenuItem>
                    <MenuItem value="First Term">First Term</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Programme</InputLabel>
                  <Select value={pProgramme} label="Programme" onChange={(e) => setPProgramme(e.target.value)}>
                    <MenuItem value="Junior Secondary">Junior Secondary</MenuItem>
                    <MenuItem value="Senior Secondary">Senior Secondary</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class/Arm</InputLabel>
                  <Select value={pClassArm} label="Class/Arm" onChange={(e) => setPClassArm(e.target.value)}>
                    <MenuItem value="Junior Secondary 1A">Junior Secondary 1A</MenuItem>
                    <MenuItem value="Junior Secondary 1B">Junior Secondary 1B</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Filter Action Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap">
              <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<FilterIcon />} onClick={handleApplyPsyFilter}>
                Filter Results
              </Button>
              <Button variant="contained" color="success" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<SaveIcon />}>
                Save Selections
              </Button>
              <Button variant="outlined" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<DownloadIcon />}>
                Export Report
              </Button>
            </Stack>

            {/* Student Assessments Table */}
            <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>S/N</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>Learner's Name</TableCell>
                    <TableCell sx={{ minWidth: 280 }}>Mark Affective Domain</TableCell>
                    <TableCell sx={{ minWidth: 280 }}>Mark Psychomotor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PSYCHOMOTOR_LEARNERS.map((learner, idx) => (
                    <TableRow key={learner.id} hover sx={{ verticalAlign: 'top' }}>
                      <TableCell>{String(idx + 1).padStart(2, '0')}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: learner.color, fontSize: 13, fontWeight: 700 }}>
                            {learner.initials}
                          </Avatar>
                          <Box>
                            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1}>
                              <Typography variant="body2" fontWeight={600}>
                                {learner.name}
                              </Typography>
                              {/* Project standard gender chip */}
                              <Chip
                                icon={learner.gender === 'MALE' ? <MaleIcon fontSize="small" /> : <FemaleIcon fontSize="small" />}
                                label={learner.gender}
                                size="small"
                                color={learner.gender === 'MALE' ? 'primary' : 'success'}
                                variant="soft"
                                sx={{ height: 20, fontSize: '10px', fontWeight: 600 }}
                              />
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              REG: {learner.reg}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      {/* Affective domain */}
                      <TableCell>
                        <Stack spacing={1}>
                          {AFFECTIVE_TRAITS.map((trait) => (
                            <Stack key={trait} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1}>
                              <Typography variant="caption" sx={{ minWidth: 80, color: 'text.secondary', fontWeight: 500 }}>
                                {trait}
                              </Typography>
                              <RadioGroup
                                row
                                value={assessments[learner.id]?.affective[trait] ?? ''}
                                onChange={(e) => setRating(learner.id, 'affective', trait, Number(e.target.value))}
                              >
                                {[1, 2, 3, 4, 5].map((val) => (
                                  <FormControlLabel
                                    key={val}
                                    value={val}
                                    control={<Radio size="small" sx={{ p: 0.5 }} />}
                                    label={val}
                                    labelPlacement="bottom"
                                    sx={{ mx: 0.25, '& .MuiFormControlLabel-label': { fontSize: '10px' } }}
                                  />
                                ))}
                              </RadioGroup>
                            </Stack>
                          ))}
                        </Stack>
                      </TableCell>
                      {/* Psychomotor domain */}
                      <TableCell>
                        <Stack spacing={1}>
                          {PSYCHOMOTOR_TRAITS.map((trait) => (
                            <Stack key={trait} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1}>
                              <Typography variant="caption" sx={{ minWidth: 110, color: 'text.secondary', fontWeight: 500 }}>
                                {trait}
                              </Typography>
                              <RadioGroup
                                row
                                value={assessments[learner.id]?.psychomotor[trait] ?? ''}
                                onChange={(e) => setRating(learner.id, 'psychomotor', trait, Number(e.target.value))}
                              >
                                {[1, 2, 3, 4, 5].map((val) => (
                                  <FormControlLabel
                                    key={val}
                                    value={val}
                                    control={<Radio size="small" sx={{ p: 0.5 }} />}
                                    label={val}
                                    labelPlacement="bottom"
                                    sx={{ mx: 0.25, '& .MuiFormControlLabel-label': { fontSize: '10px' } }}
                                  />
                                ))}
                              </RadioGroup>
                            </Stack>
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ pt: 2 }}>
              <TablePagination
                component="div"
                count={42}
                page={pPage}
                onPageChange={(_, newPage) => setPPage(newPage)}
                rowsPerPage={pRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setPRowsPerPage(parseInt(e.target.value, 10));
                  setPPage(0);
                }}
              />
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Autosave active. Last synced at 10:42 AM.
              </Typography>
              <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }}>
                SUBMIT FINAL ASSESSMENTS
              </Button>
            </Box>
          </Box>
        )}
      </ParentCard>

      {/* ── Analytics Detail Modal ────────────────────────────────────────── */}
      <Dialog
        open={analyticsModal.open}
        onClose={() => setAnalyticsModal({ open: false, title: '', content: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon color="primary" />
          {analyticsModal.title}
        </DialogTitle>
        <DialogContent dividers>
          {analyticsModal.content}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsModal({ open: false, title: '', content: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default AttendancePsychomotor;
