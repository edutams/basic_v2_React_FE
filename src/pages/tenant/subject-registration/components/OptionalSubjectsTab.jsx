import React, { useState } from 'react';
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Grid,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
} from '@mui/icons-material';
import SubjectMatrixTable from './SubjectMatrixTable';

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
    registered: { music: true, home_ec: false, agric: true, pru: false },
  },
  {
    id: 2,
    name: 'ABUAZEEZ Abudqudiri Oluwadamilare',
    registered: { music: false, home_ec: true, agric: true, pru: false },
  },
  {
    id: 3,
    name: 'ADEBAYO Olawalarami Loveth',
    registered: { music: true, home_ec: true, agric: false, pru: false },
  },
  {
    id: 4,
    name: 'ADEKUNLE Ibrahim Babatunde',
    registered: { music: false, home_ec: false, agric: true, pru: true },
  },
  {
    id: 5,
    name: 'AKINTOLA Fatimah Oluwaseun',
    registered: { music: true, home_ec: true, agric: true, pru: false },
  },
];

const OptionalSubjectsTab = () => {
  const [session, setSession] = useState('2025/2026');
  const [term, setTerm] = useState('Third Term');
  const [programme, setProgramme] = useState('Junior Secondary');
  const [classLevel, setClassLevel] = useState('Junior Secondary 1');
  const [classArm, setClassArm] = useState('A');
  const [learners, setLearners] = useState(INITIAL_LEARNERS);

  const toggleRegistration = (learnerId, subjectId) => {
    setLearners((prev) =>
      prev.map((l) =>
        l.id === learnerId
          ? { ...l, registered: { ...l.registered, [subjectId]: !l.registered[subjectId] } }
          : l,
      ),
    );
  };

  const handleApplyFilter = () => {
    // Will integrate with API
  };

  return (
    <Box>
      {/* ── Filters ───────────────────────────────────────── */}
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

      {/* ── Table ────────────────────────────────────────── */}
      <SubjectMatrixTable
        subjects={OPTIONAL_SUBJECTS}
        learners={learners}
        onToggle={toggleRegistration}
      />
    </Box>
  );
};

export default OptionalSubjectsTab;
