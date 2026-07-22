import React, { useState } from 'react';
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
  IconButton,
  Tooltip,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  useTheme,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
  Email as EmailIcon,
  NotificationsActive as NotificationsActiveIcon,
  Add as AddIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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

const weeklyTotal = (att) => Object.values(att).filter((v) => v === 'present').length;

const MarkAttendanceTab = ({ metrics, onFilter }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Filter States ─────────────────────────────────────────
  const [attSession, setAttSession] = useState('2023/2024');
  const [attTerm, setAttTerm] = useState('First Term');
  const [attWeek, setAttWeek] = useState('Week 8');
  const [attDay, setAttDay] = useState('2023-11-24');
  const [attProgramme, setAttProgramme] = useState('Junior Secondary');
  const [attClass, setAttClass] = useState('JS 1 A');
  const [attendanceType, setAttendanceType] = useState('morning');

  // ── Attendance Data ───────────────────────────────────────
  const [attendanceData, setAttendanceData] = useState(
    ATTENDANCE_LEARNERS.reduce((acc, l) => {
      acc[l.id] = { ...l.attendance };
      return acc;
    }, {}),
  );

  // ── Handlers ──────────────────────────────────────────────
  const setDayStatus = (learnerId, day, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [learnerId]: { ...prev[learnerId], [day]: status },
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

  const handleApplyFilter = () => {
    if (onFilter) onFilter(attProgramme);
  };

  const handleSubmitAttendance = () => {
    // Will integrate with API submit endpoint
  };

  // ── Summary Stats ─────────────────────────────────────────
  const totalPresent = Object.values(attendanceData).reduce(
    (sum, att) => sum + weeklyTotal(att), 0
  );
  const totalLearners = ATTENDANCE_LEARNERS.length;
  const attendancePercent = Math.round((totalPresent / (totalLearners * DAYS.length)) * 100);

  return (
    <Box sx={{ pt: 1 }}>
      {/* ── Action Buttons Row ──────────────────────────── */}
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

      {/* ── Filters ─────────────────────────────────────── */}
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
          <Button variant="contained" size="small" fullWidth startIcon={<FilterIcon />} onClick={handleApplyFilter}>
            Filter
          </Button>
        </Grid>
      </Grid>

      {/* ── Morning/Afternoon Toggle ─────────────────────── */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
        <RadioGroup row value={attendanceType} onChange={(e) => setAttendanceType(e.target.value)}>
          <FormControlLabel value="morning" control={<Radio size="small" />} label="Morning" />
          <FormControlLabel value="afternoon" control={<Radio size="small" />} label="Afternoon" />
        </RadioGroup>
      </Box>

      {/* ── Attendance Table & Summary ──────────────────── */}
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
                              <FormControlLabel value="present" control={<Radio size="small" color="success" sx={{ p: 0.25 }} />} label="" sx={{ m: 0 }} />
                              <FormControlLabel value="absent" control={<Radio size="small" color="error" sx={{ p: 0.25 }} />} label="" sx={{ m: 0 }} />
                              <FormControlLabel value="unknown" control={<Radio size="small" color="default" sx={{ p: 0.25 }} />} label="" sx={{ m: 0 }} />
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
            <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }} onClick={handleSubmitAttendance}>
              Submit Attendance
            </Button>
          </Box>
        </Grid>

        {/* ── Right Summary Card ─────────────────────────── */}
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
                {attendancePercent}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalPresent} present out of {totalLearners} learners
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
  );
};

export default MarkAttendanceTab;
