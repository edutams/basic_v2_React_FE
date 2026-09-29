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
  Alert,
  Skeleton,
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
import { fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import { useNotification } from '@/hooks/useNotification';
import StudentDetailModal from './StudentDetailModal';
import ChangeClassModal from './ChangeClassModal';
import AddToClassModal from './AddToClassModal';

const STATUS_OPTIONS = [
  { value: 'student', label: 'Student', color: 'success' },
  { value: 'graduate', label: 'Graduated', color: 'info' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'warning' },
  { value: 'absconded', label: 'Absconded', color: 'error' },
  { value: 'suspended', label: 'Suspended', color: 'warning' },
];

const getStatusConfig = (status) =>
  STATUS_OPTIONS.find((s) => s.value === status) || {
    value: status,
    label: status || 'Unknown',
    color: 'default',
  };

const SingleArmView = ({ onEnrollmentChange, classFilterData }) => {
  const notify = useNotification();

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

  const [tableSearch, setTableSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate input for controlled search

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [meta, setMeta] = useState(null);

  const [parentsMap, setParentsMap] = useState({});

  const [saPage, setSaPage] = useState(0);
  const [saRowsPerPage, setSaRowsPerPage] = useState(15);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [changeClassModalOpen, setChangeClassModalOpen] = useState(false);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removingStudent, setRemovingStudent] = useState(false);

  const [addToClassModalOpen, setAddToClassModalOpen] = useState(false);

  // The tenant's actually-running session-term (getActiveSessionTerm() on the
  // backend) — a ref, not state, since it's only ever read once terms load
  // right after; Session.status/is_current is a separate, independent flag
  // that can point at a different session than what's really active (see
  // SessionManagementController::toggleSessionStatus), so it must never be
  // used to pick this filter's default.
  const activeSessionTermRef = useRef(null);

  const loadFilterData = useCallback(async () => {
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
      if (defaultSession) setSaSession(defaultSession.id);
    } catch (error) {
      console.error('Failed to load filter data:', error);
    }
  }, []);

  useEffect(() => {
    loadFilterData();
  }, [loadFilterData]);

  useEffect(() => {
    if (classFilterData && classFilterData.programme_id && classFilterData.class_id) {
      setSaProgramme(classFilterData.programme_id);

      fetchClassesByProgramme(classFilterData.programme_id)
        .then((res) => {
          const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
          setClasses(data);
          setSaClass(classFilterData.class_id);
        })
        .catch(console.error);
    }
  }, [classFilterData]);

  useEffect(() => {
    if (!saSession) return;
    fetchTerms(saSession)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setTerms(data);

        // Only trust the active session-term's term_id when it actually
        // belongs to the session just selected — if the admin manually
        // browsed to a different session, fall back to the first term
        // rather than a stale reference to some other session's term.
        const activeSessionTerm = activeSessionTermRef.current;
        const activeTermId =
          activeSessionTerm?.session_id === saSession ? activeSessionTerm.term_id : null;
        const active = (activeTermId && data.find((t) => t.id === activeTermId)) || data[0];
        if (active) setSaTerm(active.id);
      })
      .catch(console.error);
  }, [saSession]);

  useEffect(() => {
    if (!saProgramme) {
      setClasses([]);
      setSaClass('');
      setSaArm('');
      setStudents([]);
      return;
    }
    // Skip if classFilterData is being applied (it handles its own class loading)
    if (classFilterData?.programme_id === saProgramme) return;

    fetchClassesByProgramme(saProgramme)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClasses(data);
        setSaClass('');
        setSaArm('');
        setStudents([]);
      })
      .catch(console.error);
  }, [saProgramme, classFilterData]);

  useEffect(() => {
    if (!saClass) {
      setArms([]);
      setSaArm('');
      setStudents([]);
      return;
    }
    fetchClassArmsByClass(saClass, saProgramme ? { programme_id: saProgramme } : {})
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setArms(data);
        setSaArm('');
      })
      .catch(console.error);
  }, [saClass, saProgramme]);

  // Accepts overrides so a click handler can force an immediate fetch with
  // values that haven't landed in state yet (setState is async — reading
  // saPage/tableSearch right after calling their setters would still see
  // the stale, pre-click value).
  const fetchStudents = useCallback(async (overrides = {}) => {
    const effectivePage = overrides.page !== undefined ? overrides.page : saPage;
    const effectiveSearch = overrides.search !== undefined ? overrides.search : tableSearch;

    if (!saSession || !saTerm) return;
    if (!saClass && !saProgramme && !saArm && !effectiveSearch) return;

    setLoadingStudents(true);
    try {
      const res = await classRegisterApi.getStudentsByClass(saClass || 'all', saArm || null, {
        page: effectivePage + 1,
        per_page: saRowsPerPage,
        programme_id: saProgramme || null,
        session_term_id: saTerm,
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
      setLoadingStudents(false);
    }
  }, [saClass, saSession, saTerm, saProgramme, saArm, saPage, saRowsPerPage, tableSearch]);

  // Enough to actually run a search: session+term are always required, and
  // then any one of Programme/Class/Arm or free-text search — matches
  // fetchStudents' own guard, so selecting just a Programme (with no Class
  // yet) already filters the table instead of silently doing nothing.
  const canFetchStudents = !!(
    saSession &&
    saTerm &&
    (saProgramme || saClass || saArm || tableSearch)
  );

  useEffect(() => {
    if (canFetchStudents) {
      if (saPage === 0) {
        fetchStudents();
      } else {
        setSaPage(0);
      }
    }
  }, [saSession, saTerm, saProgramme, saClass]);

  useEffect(() => {
    if (canFetchStudents) {
      if (saPage === 0) {
        fetchStudents();
      } else {
        setSaPage(0);
      }
    }
  }, [saArm]);

  useEffect(() => {
    if (canFetchStudents) {
      fetchStudents();
    }
  }, [saPage, saRowsPerPage, tableSearch]);

  useEffect(() => {
    if (students.length === 0) {
      setParentsMap({});
      return;
    }
    let cancelled = false;
    const run = async () => {
      const results = await Promise.allSettled(
        students.map((s) => learnerApi.getParents(s.user_id || s.student_registration_id)),
      );
      if (cancelled) return;
      const map = {};
      results.forEach((result, idx) => {
        const sid = students[idx].student_registration_id;
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
    return () => {
      cancelled = true;
    };
  }, [students]);

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

  const handleOpenStatusModal = () => {
    setSelectedStatus(selectedRow?.status || 'student');
    handleMenuClose();
    setStatusModalOpen(true);
  };

  const handleOpenRemoveModal = () => {
    handleMenuClose();
    setRemoveModalOpen(true);
  };

  const handleApplyFilter = () => {
    setSaPage(0);
    fetchStudents();
  };

  // Always runs, unconditionally, with whatever is in the dropdowns/input
  // right now — doesn't rely on tableSearch/saPage state having changed
  // (they may not have, e.g. clicking Search again with the same text, or
  // with no text at all but dropdown filters set), so the button works
  // every time it's clicked rather than only when React sees a state diff.
  const handleSearch = () => {
    setTableSearch(searchInput);
    setSaPage(0);
    fetchStudents({ search: searchInput, page: 0 });
  };

  // Live search: debounce so the table also filters as the user types,
  // without waiting on a Search click. The button/Enter key still exist for
  // an immediate, no-wait trigger.
  useEffect(() => {
    const handle = setTimeout(() => {
      setTableSearch(searchInput);
      setSaPage(0);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const handleClearFilters = () => {
    setSaProgramme('');
    setSaClass('');
    setSaArm('');
    setSearchInput('');
    setTableSearch('');
    setSaPage(0);
  };

  const activeFilterChips = [
    saProgramme && {
      key: 'programme',
      label: `Programme: ${programmes.find((p) => p.id === saProgramme)?.programme_name || saProgramme}`,
      onDelete: () => setSaProgramme(''),
    },
    saClass && {
      key: 'class',
      label: `Class: ${classes.find((c) => c.id === saClass)?.class_name || saClass}`,
      onDelete: () => setSaClass(''),
    },
    saArm && {
      key: 'arm',
      label: `Arm: ${arms.find((a) => a.id === saArm)?.class_arm_names || saArm}`,
      onDelete: () => setSaArm(''),
    },
    tableSearch && {
      key: 'search',
      label: `Search: "${tableSearch}"`,
      onDelete: () => {
        setSearchInput('');
        setTableSearch('');
      },
    },
  ].filter(Boolean);

  const handleSaveStatus = async () => {
    if (!selectedRow || !selectedStatus) return;
    setSavingStatus(true);
    try {
      await classRegisterApi.updateStudentStatus(
        selectedRow.student_registration_id,
        selectedStatus,
      );
      notify.success('Student status updated successfully');
      setStudents((prev) =>
        prev.map((s) =>
          s.student_registration_id === selectedRow.student_registration_id
            ? { ...s, status: selectedStatus }
            : s,
        ),
      );
      setStatusModalOpen(false);
      if (onEnrollmentChange) onEnrollmentChange();
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
      await classRegisterApi.removeFromClass(selectedRow.student_registration_id);
      notify.success(`${selectedRow.name} removed from class`);
      setStudents((prev) =>
        prev.filter((s) => s.student_registration_id !== selectedRow.student_registration_id),
      );
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
    try {
      const res = await classRegisterApi.exportStudentList({
        class_arm_id: saArm || null,
        class_id: saClass || null,
        programme_id: saProgramme || null,
        session_term_id: saTerm || null,
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
        class_arm_id: saArm || null,
        class_id: saClass || null,
        programme_id: saProgramme || null,
        session_term_id: saTerm || null,
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
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select
              value={saSession}
              label="Session"
              onChange={(e) => setSaSession(e.target.value)}
            >
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.session_name || s.name || s.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Term</InputLabel>
            <Select value={saTerm} label="Term" onChange={(e) => setSaTerm(e.target.value)}>
              {terms.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.term_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select
              value={saProgramme}
              label="Programme"
              onChange={(e) => setSaProgramme(e.target.value)}
            >
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.programme_name || p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select value={saClass} label="Class" onChange={(e) => setSaClass(e.target.value)}>
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.class_name || c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Arm</InputLabel>
            <Select value={saArm} label="Arm" onChange={(e) => setSaArm(e.target.value)}>
              {arms.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.class_arm_names || a.name}
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
              placeholder="Search students by name, ID, gender, class..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSearch}
              sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Search
            </Button>
            {activeFilterChips.length > 0 && (
              <Button
                size="small"
                onClick={handleClearFilters}
                sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Clear Filters
              </Button>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            {/* Left side */}
            <Stack direction="row" spacing={1.5}>
              {/* <Button
                variant="contained"
                size="small"
                startIcon={<FilterIcon />}
                onClick={handleApplyFilter}
              >
                Apply Filter
              </Button> */}

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
              <TableChartIcon fontSize="small" sx={{ mr: 1.5, color: 'success.main' }} />
              Export Excel
            </MenuItem>
            <MenuItem onClick={handleExportPdf}>
              <PictureAsPdfIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
              Export PDF
            </MenuItem>
          </Menu>
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
        <Table size="small" sx={{ minWidth: 800 }} stickyHeader>
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
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton variant="text" width={20} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Skeleton variant="circular" width={38} height={38} />
                      <Box>
                        <Skeleton variant="text" width={140} height={20} />
                        <Skeleton variant="text" width={90} height={16} />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={100} height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={60} height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton
                      variant="rounded"
                      width={70}
                      height={22}
                      sx={{ borderRadius: '12px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={120} height={20} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="circular" width={28} height={28} sx={{ ml: 'auto' }} />
                  </TableCell>
                </TableRow>
              ))
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Alert
                    severity="info"
                    sx={{
                      justifyContent: 'center',
                      textAlign: 'center',
                      '& .MuiAlert-icon': { mr: 1.5 },
                    }}
                  >
                    {tableSearch
                      ? `No students match "${tableSearch}".`
                      : saArm
                        ? 'No students found for the selected class/arm.'
                        : saClass
                          ? 'No students found for the selected class.'
                          : saProgramme
                            ? 'No students found for the selected programme.'
                            : 'Select a class, or search by name/ID, to view students.'}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student, index) => {
                const statusCfg = getStatusConfig(student.status);
                return (
                  <TableRow key={student.student_registration_id || index} hover>
                    <TableCell>{(meta?.current_page - 1) * meta?.per_page + index + 1}</TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                            student.gender?.toUpperCase() === 'MALE' ? 'info.main' : 'success.main',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {student.class_arm || `${student.class_name} (${student.arm_name})`}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={statusCfg.label}
                        size="small"
                        color={statusCfg.color}
                        sx={{ fontWeight: 700, borderRadius: '6px' }}
                      />
                    </TableCell>

                    <TableCell>
                      {(() => {
                        const guardians = parentsMap[student.student_registration_id];
                        if (guardians === undefined)
                          return (
                            <Typography variant="body2" color="text.disabled">
                              Loading...
                            </Typography>
                          );
                        if (!guardians || guardians.length === 0)
                          return (
                            <Typography variant="body2" color="text.disabled">
                              —
                            </Typography>
                          );
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
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

      <Dialog
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusIcon color="primary" />
          Change Student Status
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Update status for{' '}
              <Typography component="span" fontWeight={700} color="primary">
                {selectedRow?.name}
              </Typography>
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
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
          <Button onClick={() => setStatusModalOpen(false)} disabled={savingStatus}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveStatus} disabled={savingStatus}>
            {savingStatus ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Remove from Class</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ pt: 1 }}>
            Are you sure you want to remove{' '}
            <strong style={{ color: 'primary' }}>{selectedRow?.name}</strong> from{' '}
            <strong>{selectedRow?.class_arm}</strong>? This will unassign them from their current
            class arm.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveModalOpen(false)} disabled={removingStudent}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmRemove}
            disabled={removingStudent}
          >
            {removingStudent ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      <StudentDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        student={selectedRow}
      />
      <ChangeClassModal
        open={changeClassModalOpen}
        onClose={() => setChangeClassModalOpen(false)}
        student={selectedRow}
        onSuccess={() => {
          fetchStudents();
          if (onEnrollmentChange) onEnrollmentChange();
        }}
      />

      <AddToClassModal
        open={addToClassModalOpen}
        onClose={() => setAddToClassModalOpen(false)}
        onSuccess={() => {
          fetchStudents();
          if (onEnrollmentChange) onEnrollmentChange();
        }}
      />
    </Box>
  );
};

export default SingleArmView;
