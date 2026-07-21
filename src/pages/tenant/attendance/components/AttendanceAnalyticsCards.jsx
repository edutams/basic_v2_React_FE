import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Stack,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  useTheme,
} from '@mui/material';
import {
  PeopleOutline as PeopleOutlineIcon,
  WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material';
import AnalyticsModal from './AnalyticsModal';

const AttendanceAnalyticsCards = ({
  metrics,
  onFilterAttendance,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [analyticsModal, setAnalyticsModal] = useState({ open: false, title: '', content: null });

  const openCardModal = (cardTitle, modalBody) => {
    setAnalyticsModal({ open: true, title: cardTitle, content: modalBody });
  };

  const cardSx = {
    p: 2.5,
    borderRadius: '16px',
    border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
    bgcolor: isDark ? 'background.paper' : '#fff',
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
    height: '100%',
  };

  const clickableCardSx = {
    ...cardSx,
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': { transform: 'translateY(-3px)' },
  };

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Card 1: DAYS SCHOOL OPEN */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper elevation={0} sx={cardSx}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">DAYS SCHOOL OPEN</Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{metrics.daysOpen}%</Typography>
            <LinearProgress variant="determinate" value={metrics.daysOpen} color="success" sx={{ my: 1, height: 4, borderRadius: 2 }} />
            <Typography variant="caption" color="text.secondary">126 out of 130</Typography>
          </Paper>
        </Grid>

        {/* Card 2: WEEK ATTENDANCE RATE */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper
            elevation={0}
            onClick={() =>
              openCardModal('Week Attendance Rate Analysis', (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Detailed weekly breakdown by days and class arms for selected week.
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
            sx={clickableCardSx}
          >
            <Typography variant="caption" fontWeight={700} color="text.secondary">WEEK ATTENDANCE RATE</Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{metrics.weekRate}%</Typography>
            <LinearProgress variant="determinate" value={metrics.weekRate} color="error" sx={{ my: 1, height: 4, borderRadius: 2 }} />
            <Typography variant="caption" color="text.secondary">0% Same as last week</Typography>
          </Paper>
        </Grid>

        {/* Card 3: TERM ATTENDANCE RATE */}
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
            sx={clickableCardSx}
          >
            <Typography variant="caption" fontWeight={700} color="text.secondary">TERM ATTENDANCE RATE</Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{metrics.termRate}%</Typography>
            <LinearProgress variant="determinate" value={metrics.termRate} color="success" sx={{ my: 1, height: 4, borderRadius: 2 }} />
            <Typography variant="caption" color="success.main" fontWeight={600}>↑ 44% Higher last term</Typography>
          </Paper>
        </Grid>

        {/* Card 4: TOTAL ABSENTEES */}
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
            sx={{ ...clickableCardSx, position: 'relative' }}
          >
            <Typography variant="caption" fontWeight={700} color="text.secondary">TOTAL ABSENTEES</Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{metrics.totalAbsentees}</Typography>
            <LinearProgress variant="determinate" value={30} color="error" sx={{ my: 1, height: 4, borderRadius: 2 }} />
            <Typography variant="caption" color="text.secondary">Current Session</Typography>
            <Box sx={{ position: 'absolute', right: 12, bottom: 12, opacity: 0.1 }}>
              <PeopleOutlineIcon sx={{ fontSize: 36 }} />
            </Box>
          </Paper>
        </Grid>

        {/* Card 5: AT-RISK STUDENTS */}
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
              ...cardSx,
              border: `2px solid ${theme.palette.error.main}`,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-3px)' },
            }}
          >
            <Typography variant="caption" fontWeight={700} color="error.main">AT-RISK STUDENTS</Typography>
            <Typography variant="h4" fontWeight={700} color="error.main" sx={{ my: 0.5 }}>{metrics.atRisk}</Typography>
            <LinearProgress variant="determinate" value={15} color="error" sx={{ my: 1, height: 4, borderRadius: 2 }} />
            <Typography variant="caption" color="error.main">1+ Week Absence</Typography>
          </Paper>
        </Grid>
      </Grid>

      <AnalyticsModal
        open={analyticsModal.open}
        onClose={() => setAnalyticsModal({ open: false, title: '', content: null })}
        title={analyticsModal.title}
        content={analyticsModal.content}
      />
    </>
  );
};

export default AttendanceAnalyticsCards;
