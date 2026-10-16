import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import { useNotification } from '@/hooks/useNotification';
import { IconEdit, IconTrash, IconUser, IconUserPlus, IconFileDescription, IconToggleRight } from '@tabler/icons-react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Link,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Tabs,
  Tab,
  Badge,
  Slide,
} from '@mui/material';

import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

import learnerApi from '@/api/tenant/learners/learnerApi';
import { getClassesWithDivisions, createLearner } from '@/api/tenant/set-up/tenant-setup';
import api from '@/api/tenant/tenant_api';
import AddLearnerModal from '@/pages/tenant/school-setup/components/AddLearnerModal';
import LinkParentModal from '@/components/tenant/learners/LinkParentModal';
import ViewParentsModal from '@/components/tenant/learners/ViewParentsModal';
import UploadLearnerModal from '@/components/tenant/learners/UploadLearnerModal';
import AssignClassModal from '@/components/tenant/learners/AssignClassModal';
import LearnerOverviewPanel from '@/components/tenant/learners/LearnerOverviewPanel';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import StatCard from 'src/components/shared/StatCard';

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'Learner Management' }];

// countKey for 'active'/'inactive' points at the enrolment-stage figures
// (`enrolled`/`not_enrolled`) — distinct from the account-status figures
// (`active`/`inactive`) the overview cards above show, so this tab's count
// always matches the rows its own filter (tabFilters) actually returns.
const TABS = [
  { key: 'all', label: 'All Learners', countKey: 'total' },
  { key: 'active', label: 'Enrolled', countKey: 'enrolled' },
  { key: 'inactive', label: 'Not Enrolled', countKey: 'not_enrolled' },
  { key: 'new_enrolments', label: 'New Enrolments', countKey: 'new_enrolments' },
  { key: 'graduated', label: 'Graduated', countKey: 'graduated' },
  { key: 'needs_attention', label: 'Needs Attention', countKey: 'needs_attention' },
];

/** The reused Link/View-Parent components still expect the old
 * `{ users: {...} }` shape — this adapts a new Student-rooted row to it
 * without touching those already-working, shared components. */
const toLegacyLearnerShape = (row) =>
  row ? { users: { id: row.user_id, fname: row.user?.fname, lname: row.user?.lname } } : null;

const classArmLabel = (reg) => {
  const arm = reg?.class_arm;
  const armNames = arm?.class_arm_names;
  const armLabel = Array.isArray(armNames) ? armNames.filter(Boolean).join(', ') : armNames || '';
  const className = arm?.programme_class?.class?.class_name || '';
  return [className, armLabel].filter(Boolean).join(' ') || '—';
};

const LearnerManagement = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const { impersonateStudent } = useContext(TenantAuthContext);

  const [impersonateStudentConfirmOpen, setImpersonateStudentConfirmOpen] = useState(false);
  const [studentToImpersonate, setStudentToImpersonate] = useState(null);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [activeTab, setActiveTab] = useState('all');
  const [classId, setClassId] = useState('');
  const [armId, setArmId] = useState('');
  const [arms, setArms] = useState([]);
  const [gender, setGender] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [classes, setClasses] = useState([]);

  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, new_enrolments: 0, graduated: 0, needs_attention: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState(new Set());

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [addLearnerOpen, setAddLearnerOpen] = useState(false);
  const [addLearnerLoading, setAddLearnerLoading] = useState(false);

  const [editLearnerOpen, setEditLearnerOpen] = useState(false);
  const [learnerToEdit, setLearnerToEdit] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editValues, setEditValues] = useState({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [learnerToDelete, setLearnerToDelete] = useState(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  const [linkParentOpen, setLinkParentOpen] = useState(false);
  const [linkParentLearner, setLinkParentLearner] = useState(null);

  const [viewParentsOpen, setViewParentsOpen] = useState(false);
  const [viewParentsLearner, setViewParentsLearner] = useState(null);

  const [assignClassOpen, setAssignClassOpen] = useState(false);
  const [assignClassLearners, setAssignClassLearners] = useState([]);

  const [toggleStatusOpen, setToggleStatusOpen] = useState(false);
  const [learnerToToggle, setLearnerToToggle] = useState(null);

  // null | 'active' | 'inactive' — which bulk account-status action is
  // pending confirmation.
  const [bulkStatusConfirm, setBulkStatusConfirm] = useState(null);

  const [generateReportConfirmOpen, setGenerateReportConfirmOpen] = useState(false);
  const [reportTargetRow, setReportTargetRow] = useState(null);
  const [bulkReportConfirmOpen, setBulkReportConfirmOpen] = useState(false);

  // template download/upload
  const [uploadLearnerOpen, setUploadLearnerOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadClassId, setDownloadClassId] = useState('');

  // detail panel (click a row/checkbox)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLearner, setDrawerLearner] = useState(null);

  // Auto-open Add Learner modal when navigated from Quick Actions
  useEffect(() => {
    if (location.state?.openAdd) {
      setAddLearnerOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Debounce the search box so every keystroke doesn't fire its own request.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const tabFilters = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return { status: 'student' };
      case 'inactive':
        return { inactive: true };
      case 'new_enrolments':
        return { recent_days: 7 };
      case 'graduated':
        return { status: 'graduate' };
      case 'needs_attention':
        return { needs_attention: true };
      default:
        return {};
    }
  }, [activeTab]);

  const fetchLearners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await learnerApi.getAll({
        page: page + 1,
        per_page: rowsPerPage,
        search: debouncedSearch || undefined,
        ...(classId && { class_id: classId }),
        ...(armId && { arm_id: armId }),
        ...(gender && { gender }),
        ...(statusFilter && { status: statusFilter }),
        ...tabFilters,
      });
      setRows(res?.data?.data ?? []);
      setTotal(res?.data?.meta?.total ?? 0);
      setSelectedIds(new Set());
    } catch {
      notify.error('Failed to fetch learners');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, classId, armId, gender, statusFilter, tabFilters, notify]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await learnerApi.getOverviewStats();
      setStats(res?.data?.data ?? { total: 0, active: 0, inactive: 0, new_enrolments: 0, graduated: 0, needs_attention: 0 });
    } catch {
      notify.error('Failed to fetch stats');
    } finally {
      setStatsLoading(false);
    }
  }, [notify]);

  const fetchClasses = useCallback(async () => {
    try {
      const data = await getClassesWithDivisions();
      const flat = [];
      (data || []).forEach((division) => {
        (division.programmes || []).forEach((programme) => {
          (programme.classes || []).forEach((cls) => {
            flat.push({
              id: cls.pivot?.id,
              programme_class_id: cls.pivot?.id,
              label: `${programme.programme_code} - ${cls.class_code}`,
            });
          });
        });
      });
      setClasses(flat);
    } catch {
      notify.error('Failed to fetch classes');
    }
  }, [notify]);

  useEffect(() => {
    fetchLearners();
  }, [fetchLearners]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Reset to page 1 whenever a filter changes shape.
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, classId, armId, gender, statusFilter, activeTab]);

  // Cascading Arm options, scoped to the selected Class.
  useEffect(() => {
    if (!classId) {
      setArms([]);
      setArmId('');
      return;
    }
    learnerApi
      .getClassArms({ programme_class_id: classId })
      .then((res) => setArms(res?.data?.data ?? []))
      .catch(() => setArms([]));
  }, [classId]);

  const refreshAll = useCallback(() => {
    fetchLearners();
    fetchStats();
  }, [fetchLearners, fetchStats]);

  const confirmImpersonateStudent = (row) => {
    setStudentToImpersonate(row);
    setImpersonateStudentConfirmOpen(true);
    handleMenuClose();
  };

  const handleConfirmedImpersonateStudent = async () => {
    if (!studentToImpersonate) return;
    const result = await impersonateStudent(studentToImpersonate?.user_id);
    if (result.success) {
      notify.success(`Now logged in as ${studentToImpersonate.user?.fname} ${studentToImpersonate.user?.lname}`);
      navigate('/dashboard');
    } else {
      notify.error(result.error);
    }
    setImpersonateStudentConfirmOpen(false);
    setStudentToImpersonate(null);
  };

  const handleMenuOpen = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenEdit = (row) => {
    setLearnerToEdit(row);
    setEditValues({
      first_name: row.user?.fname ?? '',
      last_name: row.user?.lname ?? '',
      middle_name: row.user?.mname ?? '',
      gender: row.user?.sex ?? '',
      date_of_birth: row.user?.dob ?? '',
      learner_id: row.user?.user_id ?? '',
      class_id: row.current_registration?.class_arm?.programme_class?.class?.id ?? '',
      class_arm_id: row.current_registration?.class_arm_id ?? '',
    });
    setEditLearnerOpen(true);
    handleMenuClose();
    setDrawerOpen(false);
  };

  const handleConfirmEdit = async (values) => {
    try {
      setEditLoading(true);
      await learnerApi.update(learnerToEdit.user_id, {
        first_name: values.first_name,
        last_name: values.last_name,
        middle_name: values.middle_name,
        gender: values.gender,
        date_of_birth: values.date_of_birth,
      });
      if (values.class_arm_id && values.class_arm_id !== learnerToEdit.current_registration?.class_arm_id && learnerToEdit.current_registration?.id) {
        await learnerApi.updateRegistration(learnerToEdit.current_registration.id, {
          class_arm_id: values.class_arm_id,
        });
      }
      notify.success('Learner updated successfully');
      setEditLearnerOpen(false);
      setLearnerToEdit(null);
      refreshAll();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update learner');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenDelete = (row) => {
    setLearnerToDelete(row);
    setDeleteDialogOpen(true);
    handleMenuClose();
    setDrawerOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await learnerApi.remove(learnerToDelete.user_id);
      notify.success('Learner deleted successfully');
      setDeleteDialogOpen(false);
      setLearnerToDelete(null);
      setDrawerOpen(false);
      refreshAll();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to delete learner');
    }
  };

  const handleSaveLearner = async (values, parentIds = []) => {
    try {
      setAddLearnerLoading(true);
      const res = await createLearner(values);
      if (parentIds.length > 0) {
        const newUserId = res?.data?.id;
        if (newUserId) await learnerApi.syncParents(newUserId, parentIds);
      }
      notify.success('Learner added successfully');
      setAddLearnerOpen(false);
      refreshAll();
    } catch (err) {
      notify.error(err?.response?.data?.message || err?.message || 'Failed to add learner');
    } finally {
      setAddLearnerLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!downloadClassId) return;
    const selected = classes.find((c) => String(c.programme_class_id) === String(downloadClassId));
    if (!selected) return;

    try {
      const res = await api.get('school_setup/learner_template', {
        params: { programme_class_id: downloadClassId },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `learner_template_${selected.label}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Template downloaded');
      setDownloadDialogOpen(false);
      setDownloadClassId('');
    } catch {
      notify.error('Failed to download template');
    }
  };

  const handleUploadLearners = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('school_setup/learners', formData);
    if (!res.data.status) throw new Error(res.data.message || 'Upload failed');
    refreshAll();
    return res.data.message || 'Upload complete';
  };

  const isLearnerActive = (row) => (row?.user?.status ?? 'active') === 'active';

  const handleToggleStatus = (row) => {
    handleMenuClose();
    setLearnerToToggle(row);
    setToggleStatusOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!learnerToToggle) return;
    const wasActive = isLearnerActive(learnerToToggle);
    try {
      await learnerApi.toggleAccountStatus(learnerToToggle.user_id);
      notify.success(`Learner account ${wasActive ? 'deactivated' : 'activated'} successfully`);
      setToggleStatusOpen(false);
      setLearnerToToggle(null);
      setDrawerOpen(false);
      refreshAll();
    } catch {
      notify.error('Failed to update learner account status');
    }
  };

  const handleGenerateReport = (row) => {
    // Reuses the existing, already-built Student Dossier report view rather
    // than re-implementing report rendering here — it reads class_arm_id
    // and session_term_id from the URL's query string, not router state.
    const reg = row.current_registration;
    if (!reg?.class_arm_id || !reg?.session_term_id) {
      notify.error('This learner has no current-term registration to generate a report for');
      return;
    }
    handleMenuClose();
    setReportTargetRow(row);
    setGenerateReportConfirmOpen(true);
  };

  const handleConfirmGenerateReport = () => {
    const reg = reportTargetRow?.current_registration;
    if (reg?.class_arm_id && reg?.session_term_id) {
      navigate(`/result-class_dossier?class_arm_id=${reg.class_arm_id}&session_term_id=${reg.session_term_id}`);
    }
    setGenerateReportConfirmOpen(false);
    setReportTargetRow(null);
  };

  const hasFilters = debouncedSearch !== '' || classId !== '' || armId !== '' || gender !== '' || statusFilter !== '';

  const resetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setClassId('');
    setArmId('');
    setGender('');
    setStatusFilter('');
    setActiveTab('all');
    setPage(0);
  };

  // ─── Row selection (bulk actions) ───────────────────────────────────────
  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? new Set(rows.map((r) => r.user_id)) : new Set());
  };

  const handleSelectRow = (row) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(row.user_id)) {
        next.delete(row.user_id);
      } else {
        next.add(row.user_id);
      }
      return next;
    });
    setDrawerLearner(row);
    setDrawerOpen(true);
  };

  const selectedRows = rows.filter((r) => selectedIds.has(r.user_id));

  const distinctReportTargets = useMemo(() => {
    const seen = new Set();
    selectedRows.forEach((row) => {
      const reg = row.current_registration;
      if (reg?.class_arm_id && reg?.session_term_id) seen.add(`${reg.class_arm_id}-${reg.session_term_id}`);
    });
    return seen.size;
  }, [selectedRows]);

  const handleConfirmBulkSetStatus = async () => {
    const targetActive = bulkStatusConfirm === 'active';
    const eligible = selectedRows.filter((r) => isLearnerActive(r) !== targetActive);
    if (eligible.length === 0) {
      notify.info(`All selected learners are already ${bulkStatusConfirm}`);
      setBulkStatusConfirm(null);
      return;
    }
    try {
      await Promise.all(eligible.map((r) => learnerApi.toggleAccountStatus(r.user_id)));
      notify.success(`${eligible.length} learner account(s) ${targetActive ? 'activated' : 'deactivated'}`);
      setBulkStatusConfirm(null);
      refreshAll();
    } catch {
      notify.error('Failed to update one or more selected learner accounts');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRows.map((r) => learnerApi.remove(r.user_id)));
      notify.success(`${selectedRows.length} learner(s) deleted`);
      setBulkDeleteConfirmOpen(false);
      refreshAll();
    } catch {
      notify.error('Failed to delete one or more selected learners');
    }
  };

  const handleConfirmBulkGenerateReport = () => {
    // The Dossier view opens a whole class-arm roster, not a single
    // student — one tab per distinct arm+term among the selection, not one
    // per learner, so the same roster doesn't open multiple times.
    const seen = new Set();
    let opened = 0;
    selectedRows.forEach((row) => {
      const reg = row.current_registration;
      if (!reg?.class_arm_id || !reg?.session_term_id) return;
      const key = `${reg.class_arm_id}-${reg.session_term_id}`;
      if (seen.has(key)) return;
      seen.add(key);
      opened += 1;
      window.open(`/result-class_dossier?class_arm_id=${reg.class_arm_id}&session_term_id=${reg.session_term_id}`, '_blank');
    });
    if (opened === 0) {
      notify.error('None of the selected learners have a current-term registration');
    }
    setBulkReportConfirmOpen(false);
  };

  return (
    <PageContainer title="Learner Management" description="Manage learner information, track academic progress, link parents and monitor enrolment status">
      <Breadcrumb title="Learner Management" items={BCrumb} />

      {/* Stats */}
      <Box sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <StatCard count={stats.total} label="Total Learners" icon={GroupsIcon} colorIndex={0} loading={statsLoading} subtitle="All learners in the school" tooltip="All learners in the school." />
          <StatCard count={stats.active} label="Active Learners" icon={PeopleIcon} colorIndex={1} loading={statsLoading} subtitle="Can currently log in" tooltip="Learners whose account is active and can log in." />
          <StatCard count={stats.inactive} label="Inactive Learners" icon={AccessTimeIcon} colorIndex={3} loading={statsLoading} subtitle="Login access revoked" tooltip="Learners whose account has been deactivated — they can no longer log in." />
          <StatCard count={stats.new_enrolments} label="New Enrolments" icon={PersonAddAltIcon} colorIndex={2} loading={statsLoading} subtitle="This session" tooltip="Registered in the last 7 days." />
          <StatCard count={stats.graduated} label="Graduated / Completed" icon={SchoolIcon} colorIndex={4} loading={statsLoading} subtitle="Final year completed" tooltip="Final year completed." />
        </Stack>
      </Box>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems="flex-start">
      <ParentCard
        sx={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 1.5 },
          '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
        }}
        title={
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="h5">Learners</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
              <Button variant="contained" size="small" startIcon={<AddIcon />} sx={{ width: { xs: '100%', sm: 'auto' } }} onClick={() => setAddLearnerOpen(true)}>
                Add Learner
              </Button>
              <Button variant="contained" size="small" startIcon={<DownloadIcon />} sx={{ width: { xs: '100%', sm: 'auto' } }} onClick={() => { setDownloadClassId(''); setDownloadDialogOpen(true); }}>
                Download Template
              </Button>
              <Button variant="contained" size="small" startIcon={<UploadIcon />} sx={{ width: { xs: '100%', sm: 'auto' } }} onClick={() => setUploadLearnerOpen(true)}>
                Upload Template
              </Button>
            </Box>
          </Box>
        }
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider' }}
        >
          {TABS.map((t) => (
            <Tab
              key={t.key}
              value={t.key}
              label={
                t.key === 'needs_attention' ? (
                  <Badge badgeContent={stats[t.countKey] ?? 0} color="error" sx={{ pr: 1 }}>
                    {t.label}
                  </Badge>
                ) : (
                  `${t.label} (${stats[t.countKey] ?? 0})`
                )
              }
            />
          ))}
        </Tabs>

        {/* Filters */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, admission number or parent..."
            value={searchInput}
            size="small"
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
            sx={{ width: { xs: '100%', sm: 300, md: 320 } }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Class</InputLabel>
            <Select value={classId} label="Class" onChange={(e) => setClassId(e.target.value)}>
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }} disabled={!classId}>
            <InputLabel>Arm</InputLabel>
            <Select value={armId} label="Arm" onChange={(e) => setArmId(e.target.value)}>
              <MenuItem value="">All Arms</MenuItem>
              {arms.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {Array.isArray(a.class_arm_names) ? a.class_arm_names.join(', ') : a.class_arm_names}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Gender</InputLabel>
            <Select value={gender} label="Gender" onChange={(e) => setGender(e.target.value)}>
              <MenuItem value="">All Genders</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Enrolment Status</InputLabel>
            <Select value={statusFilter} label="Enrolment Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="student">Active</MenuItem>
              <MenuItem value="graduate">Graduated</MenuItem>
              <MenuItem value="withdrawn">Withdrawn</MenuItem>
              <MenuItem value="transferred">Transferred</MenuItem>
              <MenuItem value="absconded">Absconded</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>

          {hasFilters && (
            <Button variant="contained" color="primary" size="small" onClick={resetFilters} sx={{ height: 40 }}>
              Reset
            </Button>
          )}
        </Box>

        {selectedIds.size > 0 && (
          <Alert
            severity="info"
            sx={{ mb: 1.5 }}
            action={
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" size="small" color="success" onClick={() => setBulkStatusConfirm('active')}>
                  Activate
                </Button>
                <Button variant="contained" size="small" color="error" onClick={() => setBulkStatusConfirm('inactive')}>
                  Deactivate
                </Button>
                <Button variant="contained" size="small" onClick={() => { setAssignClassLearners(selectedRows); setAssignClassOpen(true); }}>
                  Assign Class
                </Button>
                <Button variant="contained" size="small" onClick={() => { setLinkParentLearner(selectedRows[0]); setLinkParentOpen(true); }}>
                  Link Parent
                </Button>
                <Button variant="contained" size="small" onClick={() => setBulkReportConfirmOpen(true)}>
                  Generate Report
                </Button>
                <Button variant="contained" size="small" color="error" onClick={() => setBulkDeleteConfirmOpen(true)}>
                  Delete
                </Button>
              </Stack>
            }
          >
            {selectedIds.size} selected
          </Alert>
        )}

        <Box>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" indeterminate={selectedIds.size > 0 && selectedIds.size < rows.length} checked={rows.length > 0 && selectedIds.size === rows.length} onChange={handleSelectAll} />
                  </TableCell>
                  <TableCell>#</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Class / Arm</TableCell>
                  <TableCell align="center">Parent</TableCell>
                  <TableCell>Student Status</TableCell>
                  <TableCell>Account Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton variant="rounded" width={18} height={18} /></TableCell>
                      <TableCell><Skeleton variant="text" width={20} /></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Skeleton variant="circular" width={36} height={36} />
                          <Box>
                            <Skeleton variant="text" width={140} height={20} />
                            <Skeleton variant="text" width={90} height={16} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Skeleton variant="text" width={110} height={20} /></TableCell>
                      <TableCell align="center"><Skeleton variant="rounded" width={50} height={22} sx={{ borderRadius: '12px', mx: 'auto' }} /></TableCell>
                      <TableCell><Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: '12px' }} /></TableCell>
                      <TableCell><Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: '12px' }} /></TableCell>
                      <TableCell align="center"><Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} /></TableCell>
                    </TableRow>
                  ))
                ) : rows.length > 0 ? (
                  rows.map((row, index) => {
                    const isHighlighted = selectedIds.has(row.user_id) || (drawerOpen && drawerLearner?.user_id === row.user_id);
                    const statusStyle =
                      row.status === 'student'
                        ? { bg: 'success.light', color: 'success.dark' }
                        : row.status === 'graduate'
                          ? { bg: 'info.light', color: 'info.dark' }
                          : { bg: 'error.light', color: 'error.dark' };
                    const isMale = row.user?.sex?.toUpperCase() === 'MALE';

                    return (
                      <TableRow
                        key={row.user_id}
                        hover
                        selected={isHighlighted}
                        onClick={() => {
                          setDrawerLearner(row);
                          setDrawerOpen(true);
                          setSelectedIds(new Set([row.user_id]));
                        }}
                        sx={{
                          cursor: 'pointer',
                          borderLeft: '3px solid transparent',
                          '&.Mui-selected': { bgcolor: 'rgba(89, 49, 150, 0.14)', borderLeft: '3px solid #593196' },
                          '&.Mui-selected:hover': { bgcolor: 'rgba(89, 49, 150, 0.2)' },
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox size="small" checked={selectedIds.has(row.user_id)} onClick={(e) => e.stopPropagation()} onChange={() => handleSelectRow(row)} />
                        </TableCell>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar src={row.user?.avatar || ''} alt={row.user?.fname} sx={{ width: 36, height: 36 }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Stack direction="row" alignItems="center" spacing={0.6}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {row.user ? `${row.user.fname} ${row.user.lname}` : '—'}
                                </Typography>
                                <Box
                                  sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.6rem',
                                    flexShrink: 0,
                                    bgcolor: isMale ? 'info.light' : 'success.light',
                                    color: isMale ? 'info.main' : 'success.main',
                                  }}
                                >
                                  {isMale ? 'M' : 'F'}
                                </Box>
                              </Stack>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {row.user?.user_id || '—'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{classArmLabel(row.current_registration)}</TableCell>
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <Box
                            sx={{
                              bgcolor: row.guardians_count > 0 ? '#F0F9FF' : '#FEF3C7',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              justifyContent: 'center',
                            }}
                          >
                            {row.guardians_count > 0 ? (
                              <PeopleIcon sx={{ fontSize: 15, color: '#2563EB' }} />
                            ) : (
                              <WarningAmberIcon sx={{ fontSize: 15, color: '#B45309' }} />
                            )}
                            <Typography variant="subtitle2">
                              <Link sx={{ cursor: 'pointer' }} onClick={() => { setViewParentsLearner(row); setViewParentsOpen(true); }}>
                                {row.guardians_count ?? 0} linked
                              </Link>
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            size="small"
                            sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, borderRadius: '8px', fontWeight: 600, textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isLearnerActive(row) ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              bgcolor: isLearnerActive(row) ? 'success.light' : 'error.light',
                              color: isLearnerActive(row) ? 'success.dark' : 'error.dark',
                              borderRadius: '8px',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && selectedRow?.user_id === row.user_id} onClose={handleMenuClose}>
                            <MenuItem onClick={() => confirmImpersonateStudent(row)}>
                              <IconUser size={18} style={{ marginRight: 8 }} />
                              Login As Student
                            </MenuItem>
                            <MenuItem onClick={() => { setLinkParentLearner(row); setLinkParentOpen(true); handleMenuClose(); }}>
                              <IconUserPlus size={18} style={{ marginRight: 8 }} />
                              Link Parent
                            </MenuItem>
                            <MenuItem onClick={() => { setAssignClassLearners([row]); setAssignClassOpen(true); handleMenuClose(); }} disabled={!row.current_registration}>
                              <IconToggleRight size={18} style={{ marginRight: 8 }} />
                              Assign Class
                            </MenuItem>
                            <MenuItem onClick={() => handleGenerateReport(row)}>
                              <IconFileDescription size={18} style={{ marginRight: 8 }} />
                              Generate Report
                            </MenuItem>
                            <MenuItem onClick={() => handleToggleStatus(row)}>
                              <IconToggleRight size={18} style={{ marginRight: 8 }} />
                              {isLearnerActive(row) ? 'Deactivate Account' : 'Activate Account'}
                            </MenuItem>
                            <MenuItem onClick={() => handleOpenEdit(row)}>
                              <IconEdit size={18} style={{ marginRight: 8 }} />
                              Edit
                            </MenuItem>
                            <MenuItem onClick={() => handleOpenDelete(row)} sx={{ color: 'error.main' }}>
                              <IconTrash size={18} style={{ marginRight: 8 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Alert severity="info" sx={{ mb: 3, justifyContent: 'center', textAlign: 'center', '& .MuiAlert-icon': { mr: 1.5 } }}>
                        {hasFilters ? 'No learners match the current search.' : 'No learners found.'}
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          </TableContainer>
        </Box>
      </ParentCard>

      <Slide direction="left" in={drawerOpen} mountOnEnter unmountOnExit>
        <Box sx={{ width: { xs: '100%', lg: 420 }, flexShrink: 0 }}>
          <LearnerOverviewPanel
            learner={drawerLearner}
            onClose={() => setDrawerOpen(false)}
            onEdit={handleOpenEdit}
            onLinkParent={(l) => { setLinkParentLearner(l); setLinkParentOpen(true); }}
            onAssignClass={(l) => { setAssignClassLearners([l]); setAssignClassOpen(true); }}
            onGenerateReport={handleGenerateReport}
            onToggleStatus={handleToggleStatus}
            onDelete={handleOpenDelete}
            onImpersonate={confirmImpersonateStudent}
          />
        </Box>
      </Slide>
      </Stack>

      <AddLearnerModal open={addLearnerOpen} onClose={() => setAddLearnerOpen(false)} onSave={handleSaveLearner} isLoading={addLearnerLoading} showLinkParents />

      <UploadLearnerModal open={uploadLearnerOpen} onClose={() => setUploadLearnerOpen(false)} onUpload={handleUploadLearners} />

      <Dialog open={downloadDialogOpen} onClose={() => setDownloadDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Download Learner Template</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the class to generate a template for.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Class</InputLabel>
            <Select value={downloadClassId} label="Class" onChange={(e) => setDownloadClassId(e.target.value)}>
              <MenuItem value="">Select Class</MenuItem>
              {classes.filter((c) => c.programme_class_id).map((cls) => (
                <MenuItem key={cls.programme_class_id} value={cls.programme_class_id}>
                  {cls.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setDownloadDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleDownloadTemplate} disabled={!downloadClassId}>Download</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={impersonateStudentConfirmOpen} onClose={() => { setImpersonateStudentConfirmOpen(false); setStudentToImpersonate(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Login as Student</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to login as <strong>{studentToImpersonate?.user?.fname} {studentToImpersonate?.user?.lname}</strong>? You can return to your account at any time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" size="small" color="inherit" onClick={() => { setImpersonateStudentConfirmOpen(false); setStudentToImpersonate(null); }}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleConfirmedImpersonateStudent} sx={{ bgcolor: '#593196', '&:hover': { bgcolor: '#4a2880' }, color: '#fff' }}>Yes, Login As</Button>
        </DialogActions>
      </Dialog>

      <LinkParentModal
        open={linkParentOpen}
        onClose={() => setLinkParentOpen(false)}
        learner={toLegacyLearnerShape(linkParentLearner)}
        onSaved={refreshAll}
      />

      <ViewParentsModal open={viewParentsOpen} onClose={() => setViewParentsOpen(false)} learner={toLegacyLearnerShape(viewParentsLearner)} />

      <AssignClassModal
        open={assignClassOpen}
        onClose={() => setAssignClassOpen(false)}
        learners={assignClassLearners}
        classes={classes}
        onSaved={refreshAll}
      />

      <AddLearnerModal
        open={editLearnerOpen}
        onClose={() => { setEditLearnerOpen(false); setLearnerToEdit(null); }}
        onSave={handleConfirmEdit}
        isLoading={editLoading}
        isEdit
        initialValues={editValues}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Learner</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{learnerToDelete?.user ? `${learnerToDelete.user.fname} ${learnerToDelete.user.lname}` : 'this learner'}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" color="error" onClick={handleConfirmDelete} autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkDeleteConfirmOpen} onClose={() => setBulkDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Selected Learners</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedRows.length}</strong> selected learner(s)? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setBulkDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" color="error" onClick={handleBulkDelete} autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={toggleStatusOpen} onClose={() => setToggleStatusOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{isLearnerActive(learnerToToggle) ? 'Deactivate Learner Account' : 'Activate Learner Account'}</DialogTitle>
        <DialogContent>
          <Typography>
            This will <strong>{isLearnerActive(learnerToToggle) ? 'revoke login access from' : 'restore login access for'}</strong>{' '}
            <strong>{learnerToToggle?.user ? `${learnerToToggle.user.fname} ${learnerToToggle.user.lname}` : 'this learner'}</strong>
            {isLearnerActive(learnerToToggle) ? ' — they will no longer be able to log in' : ', letting them log in again'}. Their enrolment
            status (class, graduation, withdrawal, etc.) will not change.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setToggleStatusOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" color={isLearnerActive(learnerToToggle) ? 'error' : 'success'} onClick={handleConfirmToggle} autoFocus>
            {isLearnerActive(learnerToToggle) ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(bulkStatusConfirm)} onClose={() => setBulkStatusConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{bulkStatusConfirm === 'active' ? 'Activate' : 'Deactivate'} Selected Learners</DialogTitle>
        <DialogContent>
          <Typography>
            This will {bulkStatusConfirm === 'active' ? 'restore login access for' : 'revoke login access from'}{' '}
            <strong>{selectedRows.filter((r) => isLearnerActive(r) !== (bulkStatusConfirm === 'active')).length}</strong> of the{' '}
            <strong>{selectedRows.length}</strong> selected learner(s) (already-{bulkStatusConfirm} ones are skipped). Their enrolment status
            will not change.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setBulkStatusConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            size="small"
            color={bulkStatusConfirm === 'active' ? 'success' : 'error'}
            onClick={handleConfirmBulkSetStatus}
            autoFocus
          >
            {bulkStatusConfirm === 'active' ? 'Activate' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={generateReportConfirmOpen} onClose={() => setGenerateReportConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <Typography>
            This opens the full class report sheet for{' '}
            <strong>{reportTargetRow ? classArmLabel(reportTargetRow.current_registration) : 'this learner\'s class'}</strong> in the current
            term — the whole class roster, not just{' '}
            <strong>{reportTargetRow?.user ? `${reportTargetRow.user.fname} ${reportTargetRow.user.lname}` : 'this learner'}</strong>'s own
            record.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setGenerateReportConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleConfirmGenerateReport} autoFocus>Open Report</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkReportConfirmOpen} onClose={() => setBulkReportConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Generate Reports</DialogTitle>
        <DialogContent>
          <Typography>
            This will open <strong>{distinctReportTargets}</strong> new browser tab(s) — one per distinct class/term among the selected
            learners — each showing that class's full report roster.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setBulkReportConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleConfirmBulkGenerateReport} autoFocus>Open Reports</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default LearnerManagement;
