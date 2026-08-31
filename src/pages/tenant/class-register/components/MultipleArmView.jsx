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
  Alert,
  Menu,
} from '@mui/material';
import {
  Search as SearchIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
  FileDownload as ExportIcon,
  ArrowDropDown as ArrowDropDownIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import classRegisterApi from '@/api/tenant/class-register/classRegisterApi';
import { useNotification } from '@/hooks/useNotification';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

const MultipleArmView = () => {
  const notify = useNotification();
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
  const [searchInput, setSearchInput] = useState('');

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [maPage, setMaPage] = useState(0);
  const [maRowsPerPage, setMaRowsPerPage] = useState(15);
  const [meta, setMeta] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [sessRes, progRes] = await Promise.all([fetchSessions(), fetchProgrammes()]);
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
      setStudents([]);
      return;
    }
    fetchClassesByProgramme(programme)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClasses(data);
        setClassLevel('');
        setArms([]);
        setStudents([]);
      })
      .catch(console.error);
  }, [programme]);

  useEffect(() => {
    if (!classLevel) {
      setArms([]);
      setStudents([]);
      return;
    }
    fetchClassArmsByClass(classLevel, programme ? { programme_id: programme } : {})
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setArms(data);
      })
      .catch(console.error);
  }, [classLevel, programme]);

  const fetchStudents = useCallback(async () => {
    if (!session || !term) return;
    if (!classLevel && !search) return;

    setLoading(true);
    try {
      const res = await classRegisterApi.getStudentsByClass(classLevel || 'all', null, {
        page: maPage + 1,
        per_page: maRowsPerPage,
        programme_id: programme || null,
        session_term_id: term,
        search: search || null,
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
  }, [classLevel, maPage, maRowsPerPage, programme, session, term, search]);

  useEffect(() => {
    if (classLevel || search) {
      fetchStudents();
    }
  }, [maPage, maRowsPerPage, search]);

  useEffect(() => {
    if (classLevel && programme && session && term) {
      setMaPage(0);
      fetchStudents();
    }
  }, [classLevel]);

  const handleSearch = () => {
    setSearch(searchInput);
    setMaPage(0);
  };

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
      const assignments = [];
      Object.entries(armSelections).forEach(([studentRegId, armsMap]) => {
        const selectedArm = Object.entries(armsMap).find(([, selected]) => selected);
        if (selectedArm) {
          assignments.push({
            student_reg_id: Number(studentRegId),
            class_arm_id: Number(selectedArm[0]),
          });
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

  const handleExportExcel = async () => {
    setExportAnchorEl(null);
    try {
      const res = await classRegisterApi.exportStudentList({
        class_id: classLevel || null,
        programme_id: programme || null,
        session_term_id: term || null,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_list.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Student list exported successfully');
    } catch {
      notify.error('Failed to export student list');
    }
  };

  const handleExportPdf = async () => {
    setExportAnchorEl(null);
    try {
      const res = await classRegisterApi.exportStudentListPdf({
        class_id: classLevel || null,
        programme_id: programme || null,
        session_term_id: term || null,
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_list.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Student list exported as PDF');
    } catch {
      notify.error('Failed to export PDF');
    }
  };

  return (
    <Box sx={{ pt: 1 }}>
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select value={session} label="Session" onChange={(e) => setSession(e.target.value)}>
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.session_name || s.name || s.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Term</InputLabel>
            <Select value={term} label="Term" onChange={(e) => setTerm(e.target.value)}>
              {terms.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.term_name || t.display_name || t.name || t.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select
              value={programme}
              label="Programme"
              onChange={(e) => setProgramme(e.target.value)}
            >
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.programme_name || p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select
              value={classLevel}
              label="Class"
              onChange={(e) => setClassLevel(e.target.value)}
            >
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.class_name || c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, ID, gender..."
              value={searchInput}
              onChange={(e) => {
                const val = e.target.value;
                setSearchInput(val);
                if (val === '') {
                  setSearch('');
                  setMaPage(0);
                }
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSearch}
              sx={{ minWidth: 100, whiteSpace: 'nowrap' }}
            >
              Search
            </Button>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<ExportIcon />}
              endIcon={<ArrowDropDownIcon />}
              onClick={(e) => setExportAnchorEl(e.currentTarget)}
            >
              Export
            </Button>
            <Menu
              anchorEl={exportAnchorEl}
              open={Boolean(exportAnchorEl)}
              onClose={() => setExportAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
            >
              <MenuItem onClick={handleExportExcel}>
                <TableChartIcon fontSize="small" sx={{ color: 'success.main', mr: 1.5 }} />
                Export Excel (.xlsx)
              </MenuItem>
              <MenuItem onClick={handleExportPdf}>
                <PictureAsPdfIcon fontSize="small" sx={{ color: 'error.main', mr: 1.5 }} />
                Export PDF (.pdf)
              </MenuItem>
            </Menu>

            <Button
              variant="outlined"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSubmitChanges}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Submit Changes'}
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 280 }}>Student Basic Info</TableCell>
              {arms.map((arm) => (
                <TableCell key={arm.id} align="center" sx={{ minWidth: 120 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {arm.class_arm_names || `Arm ${arm.id}`}
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
            ) : students.length === 0 ? (
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
              students.map((student, idx) => (
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

      {meta && (
        <Box sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSubmitChanges}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Submit Changes'}
            </Button>
          </Box>

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
