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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FileDownload as ExportIcon,
  FilterAlt as FilterIcon,
  VisibilityOutlined as ViewDetailIcon,
  SwapHoriz as ChangeClassIcon,
  PersonRemove as RemoveClassIcon,
  ManageAccounts as StatusIcon,
  PersonAdd as AddIcon,
  ArrowDropDown as ArrowDropDownIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
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

// ── Status config (from students table) ───────────────────────
const STATUS_OPTIONS = [
  { value: 'student', label: 'Student', color: 'success' },
  { value: 'graduate', label: 'Graduated', color: 'info' },
  { value: 'transferred', label: 'Transferred', color: 'secondary' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'warning' },
  { value: 'absconded', label: 'Absconded', color: 'error' },
  { value: 'suspended', label: 'Suspended', color: 'warning' },
];

const getStatusConfig = (status) =>
  STATUS_OPTIONS.find((s) => s.value === status) || { value: status, label: status || 'Unknown', color: 'default' };

const SingleArmView = ({ onEnrollmentChange }) => {
  const theme = useTheme();
  const notify = useNotification();

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

  // ── Parent Data ───────────────────────────────────────────
  const [parentsMap, setParentsMap] = useState({});

  // ── Pagination ────────────────────────────────────────────
  const [saPage, setSaPage] = useState(0);
  const [saRowsPerPage, setSaRowsPerPage] = useState(15);

  // ── Menu / Modal States ───────────────────────────────────
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [changeClassModalOpen, setChangeClassModalOpen] = useState(false);

  // ── Change Status Modal ───────────────────────────────────
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // ── Export dropdown anchor ────────────────────────────────
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  // ── Remove from Class Modal ───────────────────────────────
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removingStudent, setRemovingStudent] = useState(false);

  // ── Add to Class Modal ────────────────────────────────────
  const [addToClassModalOpen, setAddToClassModalOpen] = useState(false);
  const loadFilterData = useCallback(async () => {
    setLoadingFilters(true);
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
      if (activeSess) setSaSession(activeSess.id);
    } catch (error) {
      console.error('Failed to load filter data:', error);
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  useEffect(() => { loadFilterData(); }, [loadFilterData]);

  useEffect(() => {
    if (!saSession) return;
    fetchTerms(saSession).then((res) => {
      const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
      setTerms(data);
      const active = data.find((t) => t.status === 'active' || t.is_current || t.is_active) || data[0];
      if (active) setSaTerm(active.id);
    }).catch(console.error);
  }, [saSession]);

  useEffect(() => {
    if (!saProgramme) { setClasses([]); setSaClass(''); setSaArm(''); return; }
    fetchClassesByProgramme(saProgramme).then((res) => {
      const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
      setClasses(data); setSaClass(''); setSaArm('');
    }).catch(console.error);
  }, [saProgramme]);

  useEffect(() => {
    if (!saClass) { setArms([]); setSaArm(''); return; }
    fetchClassArmsByClass(saClass, saProgramme ? { programme_id: saProgramme } : {})
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setArms(data); setSaArm('');
      }).catch(console.error);
  }, [saClass, saProgramme]);

  // ── Fetch Students ────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    if (!saArm) return;
    setLoadingStudents(true);
    try {
      const res = await classRegisterApi.getStudentsByClassArm({
        class_arm_id: saArm,
        search: saSearch,
        page: saPage + 1,
        per_page: saRowsPerPage,
      });
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

  // Only re-fetch on pagination change if data was already loaded
  useEffect(() => {
    if (students.length > 0) fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saPage, saRowsPerPage]);

  // ── Fetch parent data per student ─────────────────────────
  useEffect(() => {
    if (students.length === 0) { setParentsMap({}); return; }
    let cancelled = false;
    const run = async () => {
      const results = await Promise.allSettled(
        students.map((s) => learnerApi.getParents(s.user_id || s.student_reg_id))
      );
      if (cancelled) return;
      const map = {};
      results.forEach((result, idx) => {
        const sid = students[idx].student_reg_id;
        if (result.status === 'fulfilled') {
          const parents = Array.isArray(result.value.data?.data) ? result.value.data.data : [];
          const display = parents.slice(0, 2).map((p) => {
            const u = p.user || {};
            return {
              name: [u.fname, u.lname].filter(Boolean).join(' ') || null,
              phone: u.phone || null,
              email: u.email || null,
              relationship: p.relationship || null,
            };
          });
          map[sid] = display.length > 0 ? display : null;
        } else {
          map[sid] = null;
        }
      });
      setParentsMap(map);
    };
    run();
    return () => { cancelled = true; };
  }, [students]);

  // ── Handlers ──────────────────────────────────────────────
  const handleMenuOpen = (e, row) => { setAnchorEl(e.currentTarget); setSelectedRow(row); };
  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenDetail = () => { handleMenuClose(); setDetailModalOpen(true); };
  const handleOpenChangeClass = () => { handleMenuClose(); setChangeClassModalOpen(true); };

  const handleOpenStatusModal = () => {
    setSelectedStatus(selectedRow?.status || 'student');
    handleMenuClose();
    setStatusModalOpen(true);
  };

  const handleOpenRemoveModal = () => { handleMenuClose(); setRemoveModalOpen(true); };

  const handleApplyFilter = () => { setSaPage(0); fetchStudents(); };

  const handleSaveStatus = async () => {
    if (!selectedRow || !selectedStatus) return;
    setSavingStatus(true);
    try {
      await classRegisterApi.updateStudentStatus(selectedRow.student_reg_id, selectedStatus);
      notify.success('Student status updated successfully');
      setStudents((prev) =>
        prev.map((s) =>
          s.student_reg_id === selectedRow.student_reg_id ? { ...s, status: selectedStatus } : s
        )
      );
      setStatusModalOpen(false);
    } catch {
      notify.error('Failed to update student status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!selectedRow) return;
    setRemovingStudent(true);
    try {
      await classRegisterApi.removeFromClass(selectedRow.student_reg_id);
      notify.success(`${selectedRow.name} removed from class`);
      setStudents((prev) => prev.filter((s) => s.student_reg_id !== selectedRow.student_reg_id));
      setRemoveModalOpen(false);
      if (onEnrollmentChange) onEnrollmentChange();
    } catch {
      notify.error('Failed to remove student from class');
    } finally {
      setRemovingStudent(false);
    }
  };

  const handleExportExcel = async () => {
    setExportAnchorEl(null);
    if (!saArm) { notify.warning('Please select a class and arm, then click Apply Filter first.'); return; }
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

  const handleExportPdf = async () => {
    setExportAnchorEl(null);
    if (!saArm) { notify.warning('Please select a class and arm, then click Apply Filter first.'); return; }
    try {
      const res = await classRegisterApi.exportStudentListPdf({ class_arm_id: saArm });
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
      {/* ── Filter Row ──────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select value={saSession} label="Session" onChange={(e) => setSaSession(e.target.value)}>
              {sessions.map((s) => <MenuItem key={s.id} value={s.id}>{s.sesname || s.name || s.id}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Term</InputLabel>
            <Select value={saTerm} label="Term" onChange={(e) => setSaTerm(e.target.value)}>
              {terms.map((t) => <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select value={saProgramme} label="Programme" onChange={(e) => setSaProgramme(e.target.value)}>
              {programmes.map((p) => <MenuItem key={p.id} value={p.id}>{p.programme_name || p.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select value={saClass} label="Class" onChange={(e) => setSaClass(e.target.value)}>
              {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.class_name || c.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Arm</InputLabel>
            <Select value={saArm} label="Arm" onChange={(e) => setSaArm(e.target.value)}>
              {arms.map((a) => <MenuItem key={a.id} value={a.id}>{a.arm_names || a.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* ── Search & Action Row ─────────────────────────────── */}
     <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
  {/* Search */}
  <Grid size={{ xs: 12, md: 4 }}>
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

  {/* Action Buttons */}
  <Grid size={{ xs: 12, md: 8 }}>
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
    >
      {/* Left side */}
      <Stack direction="row" spacing={1.5}>
        <Button
          variant="contained"
          size="small"
          startIcon={<FilterIcon />}
          onClick={handleApplyFilter}
        >
          Apply Filter
        </Button>

        <Button
          variant="contained"
          size="small"
          startIcon={<ExportIcon />}
          endIcon={<ArrowDropDownIcon />}
          onClick={(e) => setExportAnchorEl(e.currentTarget)}
        >
          Export
        </Button>
      </Stack>

      {/* Right side */}
      <Button
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        onClick={() => setAddToClassModalOpen(true)}
      >
        Add to Class
      </Button>
    </Stack>

    <Menu
      anchorEl={exportAnchorEl}
      open={Boolean(exportAnchorEl)}
      onClose={() => setExportAnchorEl(null)}
      PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
    >
      <MenuItem onClick={handleExportExcel}>
        <TableChartIcon
          fontSize="small"
          sx={{ mr: 1.5, color: "success.main" }}
        />
        Export Excel
      </MenuItem>
      <MenuItem onClick={handleExportPdf}>
        <PictureAsPdfIcon
          fontSize="small"
          sx={{ mr: 1.5, color: "primary.main" }}
        />
        Export PDF
      </MenuItem>
    </Menu>
  </Grid>
</Grid>

      {/* ── Table ───────────────────────────────────────────── */}
      <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>S/N</TableCell>
              <TableCell>Student Info</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Class/Arm</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Parent/Guardian</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingStudents ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Alert severity="info" sx={{ justifyContent: 'center', textAlign: 'center', '& .MuiAlert-icon': { mr: 1.5 } }}>
                    {saArm ? 'No students found for the selected class/arm.' : 'Please select a class and arm, then click Apply Filter.'}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student, index) => {
                const statusCfg = getStatusConfig(student.status);
                return (
                  <TableRow key={student.student_reg_id || index} hover>
                    <TableCell>{(meta?.current_page - 1) * meta?.per_page + index + 1}</TableCell>

                    {/* Student Info */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={student.avatar}
                          sx={{ width: 38, height: 38, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}
                        >
                          {(student.name || '?').charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{student.name}</Typography>
                          <Chip
                            label={student.admission_no}
                            size="small"
                            sx={{ height: 20, fontSize: '11px', fontWeight: 600, mt: 0.25, bgcolor: 'primary.light', color: 'primary.main' }}
                          />
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Gender */}
                    <TableCell>
                      <Chip
                        label={student.gender}
                        size="small"
                        sx={{
                          fontWeight: 700, px: 0.5,
                          bgcolor: student.gender?.toUpperCase() === 'MALE' ? 'info.light' : 'success.light',
                          color: student.gender?.toUpperCase() === 'MALE' ? 'info.main' : 'success.main',
                        }}
                      />
                    </TableCell>

                    {/* Class/Arm */}
                    <TableCell>{student.class_arm || `${student.class_name} (${student.arm_name})`}</TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={statusCfg.label}
                        size="small"
                        color={statusCfg.color}
                        sx={{ fontWeight: 700, borderRadius: '6px' }}
                      />
                    </TableCell>

                    {/* Parent/Guardian */}
                    <TableCell>
                      {(() => {
                        const guardians = parentsMap[student.student_reg_id];
                        if (guardians === undefined) return <Typography variant="body2" color="text.disabled">Loading...</Typography>;
                        if (!guardians || guardians.length === 0) return <Typography variant="body2" color="text.disabled">—</Typography>;
                        return (
                          <Box sx={{ minWidth: 0 }}>
                            {guardians.map((g, i) => (
                              <Box key={i} sx={{ mb: i < guardians.length - 1 ? 0.75 : 0 }}>
                                <Typography variant="body2" noWrap fontWeight={500}>
                                  {g.name || '—'}
                                  {g.relationship && (
                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5, fontStyle: 'italic' }}>
                                      ({g.relationship})
                                    </Typography>
                                  )}
                                </Typography>
                                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                                  {g.phone && <Typography variant="caption" color="text.secondary" noWrap>{g.phone}</Typography>}
                                  {g.email && <Typography variant="caption" color="text.secondary" noWrap sx={{ fontStyle: 'italic' }}>{g.email}</Typography>}
                                </Stack>
                              </Box>
                            ))}
                          </Box>
                        );
                      })()}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, student)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Pagination ──────────────────────────────────────── */}
      {meta && (
        <Box sx={{ pt: 2 }}>
          <TablePagination
            component="div"
            count={meta.total || 0}
            page={saPage}
            onPageChange={(_, newPage) => setSaPage(newPage)}
            rowsPerPage={saRowsPerPage}
            onRowsPerPageChange={(e) => { setSaRowsPerPage(parseInt(e.target.value, 10)); setSaPage(0); }}
          />
        </Box>
      )}

      {/* ── Context Menu ────────────────────────────────────── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
      >
        <MenuItem onClick={handleOpenDetail}>
          <ViewDetailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1.5 }} />
          View Detail
        </MenuItem>
        <MenuItem onClick={handleOpenChangeClass}>
          <ChangeClassIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1.5 }} />
          Change Class
        </MenuItem>
        <MenuItem onClick={handleOpenStatusModal}>
          <StatusIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1.5 }} />
          Change Status
        </MenuItem>
        <MenuItem onClick={handleOpenRemoveModal} sx={{ color: 'error.main' }}>
          <RemoveClassIcon fontSize="small" sx={{ mr: 1.5 }} />
          Remove from Class
        </MenuItem>
      </Menu>

      {/* ── Change Status Modal ──────────────────────────────── */}
      <Dialog open={statusModalOpen} onClose={() => setStatusModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusIcon color="primary" />
          Change Student Status
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Update status for{' '}
              <Typography component="span" fontWeight={700} color="primary">{selectedRow?.name}</Typography>
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={selectedStatus} label="Status" onChange={(e) => setSelectedStatus(e.target.value)}>
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusModalOpen(false)} disabled={savingStatus}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveStatus} disabled={savingStatus}>
            {savingStatus ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Remove from Class Confirm Modal ─────────────────── */}
      <Dialog open={removeModalOpen} onClose={() => setRemoveModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Remove from Class</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ pt: 1 }}>
            Are you sure you want to remove{' '}
            <strong style={{ color: 'primary' }}>{selectedRow?.name}</strong> from{' '}
            <strong>{selectedRow?.class_arm}</strong>?
            This will unassign them from their current class arm.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveModalOpen(false)} disabled={removingStudent}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmRemove} disabled={removingStudent}>
            {removingStudent ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Other Modals ────────────────────────────────────── */}
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

      {/* ── Add to Class Modal (reuse ChangeClassModal for unassigned students) ── */}
      <ChangeClassModal
        open={addToClassModalOpen}
        onClose={() => setAddToClassModalOpen(false)}
        student={null}
        onSuccess={fetchStudents}
      />
    </Box>
  );
};

export default SingleArmView;
