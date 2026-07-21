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
  TablePagination,
  useTheme,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
  Save as SaveIcon,
  FileDownload as DownloadIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material';


const AFFECTIVE_TRAITS = ['Punctuality', 'Neatness', 'Honesty'];
const PSYCHOMOTOR_TRAITS = ['Handwriting', 'Games & Sports', 'Drawing & Painting'];

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

const MarkPsychomotorTab = ({ metrics, onFilter }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Filter States ─────────────────────────────────────────
  const [pSession, setPSession] = useState('2025/2026');
  const [pTerm, setPTerm] = useState('Third Term');
  const [pProgramme, setPProgramme] = useState('Junior Secondary');
  const [pClassArm, setPClassArm] = useState('Junior Secondary 1A');

  // ── Assessment Data ───────────────────────────────────────
  const [assessments, setAssessments] = useState(
    PSYCHOMOTOR_LEARNERS.reduce((acc, l) => {
      acc[l.id] = {
        affective: { ...l.affective },
        psychomotor: { ...l.psychomotor },
      };
      return acc;
    }, {}),
  );

  // ── Pagination ────────────────────────────────────────────
  const [pPage, setPPage] = useState(0);
  const [pRowsPerPage, setPRowsPerPage] = useState(10);

  // ── Handlers ──────────────────────────────────────────────
  const setRating = (studentId, domain, trait, value) => {
    setAssessments((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [domain]: { ...prev[studentId][domain], [trait]: value },
      },
    }));
  };

  const handleApplyFilter = () => {
    if (onFilter) onFilter(pTerm);
  };

  const handleSubmit = () => {
    // Will integrate with API submit endpoint
  };

  const handleExport = () => {
    // Will integrate with API export endpoint
  };

  return (
    <Box sx={{ pt: 1 }}>
      {/* ── Filters ─────────────────────────────────────── */}
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

      {/* ── Action Buttons ───────────────────────────────── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap">
        <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<FilterIcon />} onClick={handleApplyFilter}>
          Filter Results
        </Button>
        <Button variant="contained" color="success" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<SaveIcon />} onClick={handleSubmit}>
          Save Selections
        </Button>
        <Button variant="outlined" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<DownloadIcon />} onClick={handleExport}>
          Export Report
        </Button>
      </Stack>

      {/* ── Assessment Table ─────────────────────────────── */}
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

      {/* ── Pagination ──────────────────────────────────── */}
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

      {/* ── Autosave Status ─────────────────────────────── */}
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
        <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }} onClick={handleSubmit}>
          SUBMIT FINAL ASSESSMENTS
        </Button>
      </Box>
    </Box>
  );
};



export default MarkPsychomotorTab;
