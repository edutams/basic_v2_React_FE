import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
} from '@mui/icons-material';
import classRegisterApi from '@/api/tenant/class-register/classRegisterApi';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

const MultipleArmView = () => {
  // ── Filter States ─────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);

  const [session, setSession] = useState('');
  const [term, setTerm] = useState('');
  const [programme, setProgramme] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [search, setSearch] = useState('');

  // ── Data States ───────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [maPage, setMaPage] = useState(0);
  const [maRowsPerPage, setMaRowsPerPage] = useState(15);
  const [meta, setMeta] = useState(null);

  // ── Load Filter Data ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [sessRes, progRes] = await Promise.all([
          fetchSessions(),
          fetchProgrammes(),
        ]);
        const sessionsData = Array.isArray(sessRes.data?.data || sessRes.data)
          ? sessRes.data?.data || sessRes.data
          : [];
        const programmesData = Array.isArray(progRes.data?.data || progRes.data)
          ? progRes.data?.data || progRes.data
          : [];

        setSessions(sessionsData);
        setProgrammes(programmesData);

        const activeSess =
          sessionsData.find((s) => s.status === 'active' || s.is_current || s.is_active) ||
          sessionsData[0];
        if (activeSess) {
          setSession(activeSess.id);
        }
      } catch (error) {
        console.error('Failed to load filter data:', error);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchTerms(session)
      .then((res) => {
        const termsData = Array.isArray(res.data?.data || res.data)
          ? res.data?.data || res.data
          : [];
        setTerms(termsData);
        const activeTerm =
          termsData.find((t) => t.status === 'active' || t.is_current || t.is_active) ||
          termsData[0];
        if (activeTerm) {
          setTerm(activeTerm.id);
        }
      })
      .catch(console.error);
  }, [session]);

  useEffect(() => {
    if (!programme) {
      setClasses([]);
      setClassLevel('');
      setArms([]);
      return;
    }
    fetchClassesByProgramme(programme)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data)
          ? res.data?.data || res.data
          : [];
        setClasses(data);
        setClassLevel('');
      })
      .catch(console.error);
  }, [programme]);

  useEffect(() => {
    if (!classLevel) return;
    fetchClassArmsByClass(classLevel, programme ? { programme_id: programme } : {})
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data)
          ? res.data?.data || res.data
          : [];
        setArms(data);
      })
      .catch(console.error);
  }, [classLevel, programme]);

  // ── Fetch Students ────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    if (!classLevel) return;
    setLoading(true);
    try {
      const res = await classRegisterApi.getStudentsByClass(classLevel, null, {
        page: maPage + 1,
        per_page: maRowsPerPage,
        search,
        programme_id: programme,
      });
      if (res.data?.status && res.data?.data) {
        setStudents(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [classLevel, maPage, maRowsPerPage, search, programme]);

  useEffect(() => {
    if (classLevel) {
      fetchStudents();
    }
  }, [classLevel, maPage, maRowsPerPage, fetchStudents]);

  // ── Arm toggle state (local only) ─────────────────────────
  const [armSelections, setArmSelections] = useState({});

  useEffect(() => {
    if (students.length > 0) {
      const initial = {};
      students.forEach((s) => {
        initial[s.student_reg_id] = {};
        arms.forEach((a) => {
          initial[s.student_reg_id][a.id] = s.class_arm_id === a.id;
        });
      });
      setArmSelections(initial);
    }
  }, [students, arms]);

  const toggleArmEnrollment = (studentRegId, armId) => {
    // Radio behavior: selecting one arm deselects all others
    setArmSelections((prev) => {
      const updated = {};
      Object.keys(prev[studentRegId] || {}).forEach((key) => {
        updated[key] = key === String(armId);
      });
      return { ...prev, [studentRegId]: updated };
    });
  };

  const handleCheckAll = (armId) => {
    setArmSelections((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = { ...updated[id], [armId]: true };
      });
      return updated;
    });
  };

  const handleUncheckAll = (armId) => {
    setArmSelections((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = { ...updated[id], [armId]: false };
      });
      return updated;
    });
  };

  const handleSubmitChanges = async () => {
    setSaving(true);
    try {
      // Only submit the single arm selected per student
      const assignments = [];
      Object.entries(armSelections).forEach(([studentRegId, armsMap]) => {
        const selectedArm = Object.entries(armsMap).find(([, selected]) => selected);
        if (selectedArm) {
          assignments.push({ student_reg_id: Number(studentRegId), class_arm_id: Number(selectedArm[0]) });
        }
      });

      if (assignments.length > 0) {
        await classRegisterApi.bulkAssignArm({ assignments });
      }
    } catch (error) {
      console.error('Failed to submit changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (s) => search === '' || (s.name || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box sx={{ pt: 1 }}>
      {/* ── Filters ───────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select value={session} label="Session" onChange={(e) => setSession(e.target.value)}>
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.sesname || s.name || s.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Term</InputLabel>
            <Select value={term} label="Term" onChange={(e) => setTerm(e.target.value)}>
              {terms.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.term_name || t.display_name || t.name || t.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select value={programme} label="Programme" onChange={(e) => setProgramme(e.target.value)}>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.programme_name || p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select value={classLevel} label="Class" onChange={(e) => setClassLevel(e.target.value)}>
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.class_name || c.name}</MenuItem>
              ))}
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
            onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
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
            <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<FilterIcon />} onClick={fetchStudents}>
              Filter Results
            </Button>
            <Button variant="outlined" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<SaveIcon />} onClick={handleSubmitChanges} disabled={saving}>
              {saving ? 'Saving...' : 'Submit Changes'}
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
              {arms.map((arm) => (
                <TableCell key={arm.id} align="center" sx={{ minWidth: 120 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {arm.arm_names || `Arm ${arm.id}`}
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={arms.length + 1} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={arms.length + 1} align="center" sx={{ py: 4 }}>
                  <Alert
                    severity="info"
                    sx={{
                      justifyContent: 'center',
                      textAlign: 'center',
                      '& .MuiAlert-icon': { mr: 1.5 },
                    }}
                  >
                    {classLevel
                      ? 'No students found.'
                      : 'Please select a class and click Filter Results.'}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student, idx) => (
                <TableRow key={student.student_reg_id || idx} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {(meta?.current_page - 1) * meta?.per_page + idx + 1}
                      </Typography>
                      <Avatar sx={{ width: 36, height: 36, fontSize: 12 }}>
                        {(student.name || '?').charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {student.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {student.gender || ''}
                        </Typography>
                        <Chip
                          label={student.admission_no}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ height: 18, fontSize: '10px', mt: 0.25 }}
                        />
                      </Box>
                    </Stack>
                  </TableCell>
                  {arms.map((arm) => (
                    <TableCell key={arm.id} align="center">
                      <IconButton
                        size="small"
                        onClick={() => toggleArmEnrollment(student.student_reg_id, arm.id)}
                      >
                        {armSelections[student.student_reg_id]?.[arm.id] ? (
                          <CheckCircleIcon color="success" fontSize="medium" />
                        ) : (
                          <CancelOutlinedIcon color="error" fontSize="medium" />
                        )}
                      </IconButton>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Pagination ──────────────────────────────────── */}
      {meta && (
        <Box sx={{ pt: 2 }}>
          <TablePagination
            component="div"
            count={meta.total || 0}
            page={maPage}
            onPageChange={(_, newPage) => setMaPage(newPage)}
            rowsPerPage={maRowsPerPage}
            onRowsPerPageChange={(e) => {
              setMaRowsPerPage(parseInt(e.target.value, 10));
              setMaPage(0);
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default MultipleArmView;
