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
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
} from '@mui/icons-material';
import SubjectMatrixTable from './SubjectMatrixTable';

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

const INITIAL_LEARNERS = [
  {
    id: 1,
    name: 'ABDULMOJEED Hikmot Oluwakemi',
    registered: { bs: true, crs: false, cca: true, dt: true, eng: true, fr: false, math: true, bsc: true },
  },
  {
    id: 2,
    name: 'ABUAZEEZ Abudqudiri Oluwadamilare',
    registered: { bs: true, crs: false, cca: false, dt: true, eng: true, fr: false, math: true, bsc: true },
  },
  {
    id: 3,
    name: 'ADEBAYO Olawalarami Loveth',
    registered: { bs: true, crs: true, cca: true, dt: true, eng: true, fr: false, math: true, bsc: false },
  },
  {
    id: 4,
    name: 'ADEKUNLE Ibrahim Babatunde',
    registered: { bs: true, crs: true, cca: true, dt: false, eng: true, fr: true, math: true, bsc: true },
  },
  {
    id: 5,
    name: 'AKINTOLA Fatimah Oluwaseun',
    registered: { bs: false, crs: true, cca: true, dt: true, eng: true, fr: false, math: true, bsc: true },
  },
];

const GeneralSubjectsTab = () => {
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
        subjects={GENERAL_SUBJECTS}
        learners={learners}
        onToggle={toggleRegistration}
        onRegisterAll={registerAll}
        onUnregisterAll={unregisterAll}
      />
    </Box>
  );
};

export default GeneralSubjectsTab;
