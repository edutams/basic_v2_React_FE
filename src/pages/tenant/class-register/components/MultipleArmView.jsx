import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';

const MultipleArmView = ({ onEnrollmentChange }) => {
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

  // The tenant's actually-running session-term (getActiveSessionTerm() on
  // the backend) — Session.status/is_current is a separate, independent
  // flag that can point at a different session than what's really active
  // (see SessionManagementController::toggleSessionStatus), so it must
  // never be used to pick this filter's default.
  const activeSessionTermRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [sessRes, progRes, activeRes] = await Promise.all([
          fetchSessions(),
          fetchProgrammes(),
          fetchActiveTenantSessionTerm(),
        ]);
        const sessionsData = Array.isArray(sessRes.data?.data || sessRes.data)
          ? sessRes.data?.data || sessRes.data
          : [];
        const programmesData = Array.isArray(progRes.data?.data || progRes.data)
          ? progRes.data?.data || progRes.data
          : [];

        setSessions(sessionsData);
        setProgrammes(programmesData);

        const activeSessionTerm = activeRes?.status ? activeRes.data : null;
        activeSessionTermRef.current = activeSessionTerm;

        const defaultSession =
          (activeSessionTerm && sessionsData.find((s) => s.id === activeSessionTerm.session_id)) ||
          sessionsData[0];
        if (defaultSession) {
          setSession(defaultSession.id);
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

        const activeSessionTerm = activeSessionTermRef.current;
        const activeTermId =
          activeSessionTerm?.session_id === session ? activeSessionTerm.term_id : null;
        const activeTerm =
          (activeTermId && termsData.find((t) => t.id === activeTermId)) || termsData[0];
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

  // Accepts overrides so a click handler can force an immediate fetch with
  // values that haven't landed in state yet (setState is async — reading
  // maPage/search right after calling their setters would still see the
  // stale, pre-click value).
  const fetchStudents = useCallback(async (overrides = {}) => {
    const effectivePage = overrides.page !== undefined ? overrides.page : maPage;
    const effectiveSearch = overrides.search !== undefined ? overrides.search : search;

    if (!session || !term) return;
    // Unlike Single Arm View, a Class here isn't just one more filter — the
    // arm columns themselves (and their check-all/uncheck-all controls) are
    // populated from classLevel alone (see the fetchClassArmsByClass effect
    // below). Fetching students without a class picked would render a table
    // with rows but zero arm columns to assign them to, which is useless —
    // so Class is mandatory, and Programme/search only narrow within it.
    if (!classLevel) return;

    setLoading(true);
    try {
      const res = await classRegisterApi.getStudentsByClass(classLevel || 'all', null, {
        page: effectivePage + 1,
        per_page: maRowsPerPage,
        programme_id: programme || null,
        session_term_id: term,
        search: effectiveSearch || null,
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

  // Session+Term+Class are all mandatory here — see the note in
  // fetchStudents() above on why Class specifically can't be optional in
  // this view. Programme and search are additional narrowing on top of it.
  const canFetchStudents = !!(session && term && classLevel);

  useEffect(() => {
    if (canFetchStudents) {
      fetchStudents();
    }
  }, [maPage, maRowsPerPage, search]);

  useEffect(() => {
    if (canFetchStudents) {
      setMaPage(0);
      fetchStudents();
    }
  }, [classLevel, programme]);

  // Always runs, unconditionally, with whatever is in the dropdowns/input
  // right now — doesn't rely on search/maPage state having changed (they
  // may not have, e.g. clicking Search again with the same text, or with no
  // text at all but dropdown filters set), so the button works every time
  // it's clicked rather than only when React sees a state diff.
  const handleSearch = () => {
    setSearch(searchInput);
    setMaPage(0);
    fetchStudents({ search: searchInput, page: 0 });
  };

  // Live search: debounce so the table also filters as the user types,
  // without waiting on a Search click. The button/Enter key still exist for
  // an immediate, no-wait trigger.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput);
      setMaPage(0);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const handleClearFilters = () => {
    setProgramme('');
    setClassLevel('');
    setSearchInput('');
    setSearch('');
    setMaPage(0);
  };

  const activeFilterChips = [
    programme && {
      key: 'programme',
      label: `Programme: ${programmes.find((p) => p.id === programme)?.programme_name || programme}`,
      onDelete: () => setProgramme(''),
    },
    classLevel && {
      key: 'class',
      label: `Class: ${classes.find((c) => c.id === classLevel)?.class_name || classLevel}`,
      onDelete: () => setClassLevel(''),
    },
    search && {
      key: 'search',
      label: `Search: "${search}"`,
      onDelete: () => {
        setSearchInput('');
        setSearch('');
      },
    },
  ].filter(Boolean);

  const [armSelections, setArmSelections] = useState({});

  useEffect(() => {
    if (students.length > 0) {
      const initial = {};
      students.forEach((s) => {
        initial[s.student_registration_id] = {};
        arms.forEach((a) => {
          initial[s.student_registration_id][a.id] = s.class_arm_id === a.id;
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
            student_registration_id: Number(studentRegId),
            class_arm_id: Number(selectedArm[0]),
          });
        }
      });

      if (assignments.length > 0) {
        await classRegisterApi.bulkAssignArm({ assignments });
        notify.success('Arm assignments saved successfully');
        fetchStudents();
        if (onEnrollmentChange) onEnrollmentChange();
      }
    } catch (error) {
      console.error('Failed to submit changes:', error);
      notify.error('Failed to save arm assignments');
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
    <Box>
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
                  {t.term_name}
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
                  {p.programme_name}
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
                  {c.class_name}
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
              placeholder={
                classLevel ? 'Search by name, ID, gender...' : 'Select a class first to search'
              }
              value={searchInput}
              disabled={!classLevel}
              onChange={(e) => setSearchInput(e.target.value)}
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
              disabled={!classLevel}
              sx={{ minWidth: 100, whiteSpace: 'nowrap' }}
            >
              Search
            </Button>
            {activeFilterChips.length > 0 && (
              <Button size="small" onClick={handleClearFilters} sx={{ whiteSpace: 'nowrap' }}>
                Clear Filters
              </Button>
            )}
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

      {activeFilterChips.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }} useFlexGap>
          {activeFilterChips.map((chip) => (
            <Chip key={chip.key} label={chip.label} size="small" onDelete={chip.onDelete} />
          ))}
        </Stack>
      )}

      <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 280 }}>Student Basic Info</TableCell>
              <TableCell>Gender</TableCell>
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
                <TableCell colSpan={arms.length + 2} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={arms.length + 2} align="center" sx={{ py: 4 }}>
                  <Alert
                    severity="info"
                    sx={{
                      justifyContent: 'center',
                      textAlign: 'center',
                      '& .MuiAlert-icon': { mr: 1.5 },
                    }}
                  >
                    {!classLevel
                      ? 'Select a class first — its arms need to load before you can view or assign students.'
                      : search
                        ? `No students match "${search}".`
                        : 'No students found for the selected class.'}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student, idx) => (
                <TableRow key={student.student_registration_id || idx} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {(meta?.current_page - 1) * meta?.per_page + idx + 1}
                      </Typography>
                      <Avatar
                        src={student.avatar}
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          fontWeight: 700,
                        }}
                      >
                        {(student.name || '?').charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {student.name}
                        </Typography>
                        <Chip
                          label={student.admission_no}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '11px',
                            fontWeight: 600,
                            mt: 0.25,
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                          }}
                        />
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.gender}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        px: 0.5,
                        bgcolor:
                          student.gender?.toUpperCase() === 'MALE' ? 'info.light' : 'success.light',
                        color:
                          student.gender?.toUpperCase() === 'MALE' ? 'info.main' : 'success.main',
                      }}
                    />
                  </TableCell>
                  {arms.map((arm) => (
                    <TableCell key={arm.id} align="center">
                      <IconButton
                        size="small"
                        onClick={() => toggleArmEnrollment(student.student_registration_id, arm.id)}
                      >
                        {armSelections[student.student_registration_id]?.[arm.id] ? (
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
