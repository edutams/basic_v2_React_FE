import React, { useState } from 'react';
import {
  Box,
  Typography,
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
  TextField,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
} from '@mui/icons-material';

const ARMS = [
  { id: 'A', label: 'A', count: 109 },
  { id: 'B', label: 'B', count: 98 },
  { id: 'C', label: 'C', count: 5 },
];

const MULTI_ARM_STUDENTS = [
  {
    id: 1,
    name: 'ABDULMOJEED Hikmot Oluwakemi',
    info: 'Female • Junior Secondary 1 (A)',
    admissionNo: '2019C111340051',
    arms: { A: true, B: false, C: false },
  },
  {
    id: 2,
    name: 'ABUDAZEEZ Abudqudiri Oluwadamilare',
    info: 'Male • Junior Secondary 1 (A)',
    admissionNo: '2019C111340059',
    arms: { A: true, B: false, C: false },
  },
  {
    id: 3,
    name: 'ADEBAYO Olawalarami Loveth',
    info: 'Female • Junior Secondary 1 (A)',
    admissionNo: '2024C1111600021',
    arms: { A: true, B: false, C: false },
  },
];

const MultipleArmView = () => {
  const [session, setSession] = useState('2025/2026');
  const [term, setTerm] = useState('Third Term');
  const [programme, setProgramme] = useState('Junior Secondary');
  const [classLevel, setClassLevel] = useState('Junior Secondary 1');
  const [search, setSearch] = useState('');

  const [multiStudents, setMultiStudents] = useState(MULTI_ARM_STUDENTS);
  const [maPage, setMaPage] = useState(0);
  const [maRowsPerPage, setMaRowsPerPage] = useState(10);

  const toggleArmEnrollment = (studentId, armId) => {
    setMultiStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, arms: { ...s.arms, [armId]: !s.arms[armId] } } : s,
      ),
    );
  };

  const handleCheckAll = (armId) => {
    setMultiStudents((prev) =>
      prev.map((s) => ({ ...s, arms: { ...s.arms, [armId]: true } })),
    );
  };

  const handleUncheckAll = (armId) => {
    setMultiStudents((prev) =>
      prev.map((s) => ({ ...s, arms: { ...s.arms, [armId]: false } })),
    );
  };

  const handleSubmitChanges = () => {
    // Will integrate with API bulk assign endpoint
  };

  const filteredStudents = multiStudents.filter(
    (s) => search === '' || s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box sx={{ pt: 1 }}>
      {/* ── Filters ───────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select value={session} label="Session" onChange={(e) => setSession(e.target.value)}>
              <MenuItem value="2025/2026">2025/2026</MenuItem>
              <MenuItem value="2024/2025">2024/2025</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Term</InputLabel>
            <Select value={term} label="Term" onChange={(e) => setTerm(e.target.value)}>
              <MenuItem value="Third Term">Third Term</MenuItem>
              <MenuItem value="Second Term">Second Term</MenuItem>
              <MenuItem value="First Term">First Term</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select value={programme} label="Programme" onChange={(e) => setProgramme(e.target.value)}>
              <MenuItem value="Junior Secondary">Junior Secondary</MenuItem>
              <MenuItem value="Senior Secondary">Senior Secondary</MenuItem>
              <MenuItem value="Primary">Primary</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select value={classLevel} label="Class" onChange={(e) => setClassLevel(e.target.value)}>
              <MenuItem value="Junior Secondary 1">Junior Secondary 1</MenuItem>
              <MenuItem value="Junior Secondary 2">Junior Secondary 2</MenuItem>
              <MenuItem value="Junior Secondary 3">Junior Secondary 3</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* ── Search & Action Row ──────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search learner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<FilterIcon />}>
              Filter Results
            </Button>
            <Button variant="contained" color="success" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<SaveIcon />} onClick={handleSubmitChanges}>
              Submit Changes
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* ── Table ────────────────────────────────────────── */}
      <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 280 }}>Student Basic Info</TableCell>
              {ARMS.map((arm) => (
                <TableCell key={arm.id} align="center" sx={{ minWidth: 120 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Arm {arm.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    ({arm.count} Learners)
                  </Typography>
                  <Stack direction="row" spacing={0.5} justifyContent="center" mt={0.5}>
                    <Tooltip title="Check All">
                      <IconButton size="small" onClick={() => handleCheckAll(arm.id)}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Uncheck All">
                      <IconButton size="small" onClick={() => handleUncheckAll(arm.id)}>
                        <CancelOutlinedIcon color="error" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student, idx) => (
              <TableRow key={student.id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {idx + 1}
                    </Typography>
                    <Avatar sx={{ width: 36, height: 36, fontSize: 12 }}>
                      {student.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {student.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {student.info}
                      </Typography>
                      <Chip
                        label={student.admissionNo}
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ height: 18, fontSize: '10px', mt: 0.25 }}
                      />
                    </Box>
                  </Stack>
                </TableCell>
                {ARMS.map((arm) => (
                  <TableCell key={arm.id} align="center">
                    <IconButton
                      size="small"
                      onClick={() => toggleArmEnrollment(student.id, arm.id)}
                    >
                      {student.arms[arm.id] ? (
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

      {/* ── Pagination ──────────────────────────────────── */}
      <Box sx={{ pt: 2 }}>
        <TablePagination
          component="div"
          count={212}
          page={maPage}
          onPageChange={(_, newPage) => setMaPage(newPage)}
          rowsPerPage={maRowsPerPage}
          onRowsPerPageChange={(e) => {
            setMaRowsPerPage(parseInt(e.target.value, 10));
            setMaPage(0);
          }}
        />
      </Box>
    </Box>
  );
};

export default MultipleArmView;
