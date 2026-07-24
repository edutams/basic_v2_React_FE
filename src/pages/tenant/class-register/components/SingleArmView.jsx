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
  Menu,
  TablePagination,
  CircularProgress,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FileDownload as ExportIcon,
  FilterAlt as FilterIcon,
  Phone as PhoneIcon,
  VisibilityOutlined as ViewDetailIcon,
  SwapHoriz as ChangeClassIcon,
} from '@mui/icons-material';
import classRegisterApi from '@/api/tenant/class-register/classRegisterApi';
import learnerApi from '@/api/tenant/learners/learnerApi';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { useNotification } from '@/hooks/useNotification';
import StudentDetailModal from './StudentDetailModal';
import ChangeClassModal from './ChangeClassModal';

const SingleArmView = () => {
  const theme = useTheme();

  // ── Filter States ─────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);

  const [saSession, setSaSession] = useState('');
  const [saTerm, setSaTerm] = useState('');
  const [saProgramme, setSaProgramme] = useState('');
  const [saClass, setSaClass] = useState('');
  const [saArm, setSaArm] = useState('');
  const [saSearch, setSaSearch] = useState('');

  // ── Student Data States ───────────────────────────────────
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [meta, setMeta] = useState(null);

  // ── Parent Data (fetched separately per student) ─────────
  const [parentsMap, setParentsMap] = useState({});

  // ── Menu / Modal States ───────────────────────────────────
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [changeClassModalOpen, setChangeClassModalOpen] = useState(false);

  // ── Pagination ────────────────────────────────────────────
  const notify = useNotification();

  const [saPage, setSaPage] = useState(0);
  const [saRowsPerPage, setSaRowsPerPage] = useState(15);

  // ── Load Filter Data ──────────────────────────────────────
  const loadFilterData = useCallback(async () => {
    setLoadingFilters(true);
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
        setSaSession(activeSess.id);
      }
    } catch (error) {
      console.error('Failed to load filter data:', error);
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  useEffect(() => {
    loadFilterData();
  }, [loadFilterData]);

  // ── Load Terms when Session changes ───────────────────────
  useEffect(() => {
    if (!saSession) return;
    const loadTerms = async () => {
      try {
        const res = await fetchTerms(saSession);
        const termsData = Array.isArray(res.data?.data || res.data)
          ? res.data?.data || res.data
          : [];
        setTerms(termsData);
        const activeTerm =
          termsData.find((t) => t.status === 'active' || t.is_current || t.is_active) ||
          termsData[0];
        if (activeTerm) {
          setSaTerm(activeTerm.id);
        }
      } catch (error) {
        console.error('Failed to load terms:', error);
      }
    };
    loadTerms();
  }, [saSession]);

  // ── Load Classes when Programme changes ───────────────────
  useEffect(() => {
    if (!saProgramme) {
      setClasses([]);
      setSaClass('');
      setSaArm('');
      return;
    }
    const loadClasses = async () => {
      try {
        const res = await fetchClassesByProgramme(saProgramme);
        const classesData = Array.isArray(res.data?.data || res.data)
          ? res.data?.data || res.data
          : [];
        setClasses(classesData);
        setSaClass('');
        setSaArm('');
      } catch (error) {
        console.error('Failed to load classes:', error);
      }
    };
    loadClasses();
  }, [saProgramme]);

  // ── Load Arms when Class or Programme changes ───────────────
  useEffect(() => {
    if (!saClass) {
      setArms([]);
      setSaArm('');
      return;
    }
    const loadArms = async () => {
      try {
        const res = await fetchClassArmsByClass(
          saClass,
          saProgramme ? { programme_id: saProgramme } : {}
        );
        const armsData = Array.isArray(res.data?.data || res.data)
          ? res.data?.data || res.data
          : [];
        setArms(armsData);
        setSaArm('');
      } catch (error) {
        console.error('Failed to load arms:', error);
      }
    };
    loadArms();
  }, [saClass, saProgramme]);

  // ── Fetch Students ────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    if (!saArm) return;

    setLoadingStudents(true);
    try {
      const params = {
        class_arm_id: saArm,
        search: saSearch,
        page: saPage + 1,
        per_page: saRowsPerPage,
      };
      const res = await classRegisterApi.getStudentsByClassArm(params);
      if (res.data?.status && res.data?.data) {
        setStudents(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [saArm, saSearch, saPage, saRowsPerPage]);

  // ── Only refetch when pagination changes (not on filter changes) ──
  useEffect(() => {
    if (students.length > 0) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saPage, saRowsPerPage]);

  // ── Fetch parent/guardian data for each student ──────────
  useEffect(() => {
    if (students.length === 0) {
      setParentsMap({});
      return;
    }

    let cancelled = false;

    const fetchParents = async () => {
      // Pre-fill with null so cells show '—' while loading doesn't stick
      const initialMap = {};
      students.forEach((s) => { initialMap[s.student_reg_id] = null; });
      // Don't set yet, wait for results so we don't flash

      const results = await Promise.allSettled(
        students.map((s) => {
          const learnerId = s.user_id || s.users?.id || s.student_reg_id;
          return learnerApi.getParents(learnerId);
        })
      );

      if (cancelled) return;

      const map = { ...initialMap };
      results.forEach((result, idx) => {
        const s = students[idx];
        if (result.status === 'fulfilled') {
          const res = result.value;
          const parents = Array.isArray(res.data?.data) ? res.data.data : [];
          const sid = s.student_reg_id;
          // Show up to 2 guardians
          const displayParents = parents.slice(0, 2).map((p) => {
            const u = p.user || {};
            const fullName = [u.fname, u.lname].filter(Boolean).join(' ');
            return {
              name: fullName || null,
              phone: u.phone || null,
              email: u.email || null,
              relationship: p.relationship || null,
            };
          });
          map[sid] = displayParents.length > 0 ? displayParents : null;
        } else {
          console.warn(`[ClassRegister] Failed to fetch parents for ${s.name}:`, result.reason);
        }
      });
      setParentsMap(map);
    };

    fetchParents();

    return () => { cancelled = true; };
  }, [students]);

  // ── Handlers ──────────────────────────────────────────────
  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenDetail = () => {
    handleMenuClose();
    setDetailModalOpen(true);
  };

  const handleOpenChangeClass = () => {
    handleMenuClose();
    setChangeClassModalOpen(true);
  };

  const handleApplyFilter = () => {
    setSaPage(0);
    fetchStudents();
  };

  const handleExport = async () => {
    if (!saArm) {
      notify.warning('Please select a class and arm, then click Apply Filter first.');
      return;
    }
    try {
      const res = await classRegisterApi.exportStudentList({ class_arm_id: saArm });
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

  return (
    <Box sx={{ pt: 1 }}>
      {/* ── Filter Row ────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select value={saSession} label="Session" onChange={(e) => setSaSession(e.target.value)}>
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.sesname || s.name || s.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Term</InputLabel>
            <Select value={saTerm} label="Term" onChange={(e) => setSaTerm(e.target.value)}>
              {terms.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select value={saProgramme} label="Programme" onChange={(e) => setSaProgramme(e.target.value)}>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.programme_name || p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select value={saClass} label="Class" onChange={(e) => setSaClass(e.target.value)}>
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.class_name || c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Arm</InputLabel>
            <Select value={saArm} label="Arm" onChange={(e) => setSaArm(e.target.value)}>
              {arms.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.arm_names || a.name}</MenuItem>
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
            placeholder="Search by learner name or ID..."
            value={saSearch}
            onChange={(e) => setSaSearch(e.target.value)}
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
            <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<FilterIcon />} onClick={handleApplyFilter}>
              Apply Filter
            </Button>
            <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<ExportIcon />} onClick={handleExport}>
              Export List
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>S/N</TableCell>
              <TableCell>Student Info</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Class/Arm</TableCell>
              <TableCell>Parent/Guardian</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingStudents ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Alert
                    severity="info"
                    sx={{
                      justifyContent: 'center',
                      textAlign: 'center',
                      '& .MuiAlert-icon': { mr: 1.5 },
                    }}
                  >
                    {saArm
                      ? 'No students found for the selected class/arm.'
                      : 'Please select a class and arm, then click Apply Filter.'}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student, index) => (
                <TableRow key={student.student_reg_id || index} hover>
                  <TableCell>{(meta?.current_page - 1) * meta?.per_page + index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={student.avatar}
                        sx={{ width: 38, height: 38, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}
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
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.gender}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        px: 0.5,
                        bgcolor:
                          student.gender?.toUpperCase() === 'MALE'
                            ? 'info.light'
                            : 'success.light',
                        color:
                          student.gender?.toUpperCase() === 'MALE'
                            ? 'info.main'
                            : 'success.main',
                      }}
                    />
                  </TableCell>
                  <TableCell>{student.class_arm || `${student.class_name} (${student.arm_name})`}</TableCell>
                  <TableCell>
                    {(() => {
                      const guardians = parentsMap[student.student_reg_id];
                      if (guardians === undefined) {
                        return (
                          <Typography variant="body2" color="text.disabled">
                            Loading...
                          </Typography>
                        );
                      }
                      if (!guardians || guardians.length === 0) {
                        return (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        );
                      }
                      return (
                        <Box sx={{ minWidth: 0 }}>
                          {guardians.map((g, i) => (
                            <Box key={i} sx={{ mb: i < guardians.length - 1 ? 0.75 : 0 }}>
                              <Typography variant="body2" noWrap fontWeight={500}>
                                {g.name || '—'}
                                {g.relationship && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 0.5, fontStyle: 'italic' }}
                                  >
                                    ({g.relationship})
                                  </Typography>
                                )}
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                {g.phone && (
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {g.phone}
                                  </Typography>
                                )}
                                {g.email && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ fontStyle: 'italic' }}
                                  >
                                    {g.email}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          ))}
                        </Box>
                      );
                    })()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, student)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
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
            page={saPage}
            onPageChange={(_, newPage) => setSaPage(newPage)}
            rowsPerPage={saRowsPerPage}
            onRowsPerPageChange={(e) => {
              setSaRowsPerPage(parseInt(e.target.value, 10));
              setSaPage(0);
            }}
          />
        </Box>
      )}

      {/* ── Context Menu ────────────────────────────────── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
      >
        <MenuItem onClick={handleOpenDetail}>
          <ViewDetailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1.5 }} />
          View Detail
        </MenuItem>
        <MenuItem onClick={handleOpenChangeClass}>
          <ChangeClassIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1.5 }} />
          Change Class
        </MenuItem>
      </Menu>

      {/* ── Modals ──────────────────────────────────────── */}
      <StudentDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        student={selectedRow}
      />
      <ChangeClassModal
        open={changeClassModalOpen}
        onClose={() => setChangeClassModalOpen(false)}
        student={selectedRow}
        onSuccess={fetchStudents}
      />
    </Box>
  );
};

export default SingleArmView;
