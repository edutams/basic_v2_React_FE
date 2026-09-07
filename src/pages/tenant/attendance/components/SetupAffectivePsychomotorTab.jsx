import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Chip,
  useTheme,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Snackbar,
  Tooltip,
  Skeleton,
  Switch,
  alpha,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Psychology as PsychologyIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  AccessibilityNew as AccessibilityNewIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import StatCard from '@/components/shared/StatCard';
import AnalyticsModal from './AnalyticsModal';
import resultSetupApi from '@/api/tenant/result-setup/resultSetupApi';
import attendanceApi from '@/api/tenant/attendance/attendanceApi';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

// ── Inner TabPanel ─────────────────────────────────────────────
function InnerTabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`setup-inner-tabpanel-${index}`}
      aria-labelledby={`setup-inner-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// ── Theme-aware sub-card ─────────────────────────────────────────
const DomainCard = ({ title, children, color, isEmpty, onSync, syncing, onAdd, addLabel }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : theme.palette.grey[200]}`,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.grey[200]}`,
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} color="#fff">
          {title}
        </Typography>
        <Stack direction="row" spacing={1}>
          {onAdd && (
            <Tooltip title={addLabel || 'Add new'}>
              <Button
                size="small"
                variant="contained"
                color="inherit"
                startIcon={<AddIcon />}
                onClick={onAdd}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                Add
              </Button>
            </Tooltip>
          )}
          {isEmpty && onSync && (
            <Button
              size="small"
              variant="contained"
              color="inherit"
              startIcon={syncing ? <CircularProgress size={14} color="inherit" /> : <SyncIcon />}
              onClick={onSync}
              disabled={syncing}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              {syncing ? 'Syncing...' : 'Sync'}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Body */}
      <Box sx={{ p: 2 }}>{children}</Box>
    </Paper>
  );
};

// ── Main Component ───────────────────────────────────────────────
const SetupAffectivePsychomotorTab = ({ showWeeklyReports = true }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── State ─────────────────────────────────────────────────────
  const [affectives, setAffectives] = useState([]);
  const [psychomotors, setPsychomotors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  // ── Inner tab state ───────────────────────────────────────────
  const [innerTab, setInnerTab] = useState(0);

  // ── Weekly Report summary stats (for this tab's own stat cards) ──
  const [reportSummary, setReportSummary] = useState({
    total_class_arms: 0,
    reports_enabled: 0,
    reports_disabled: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  // ── Weekly Report State ───────────────────────────────────────
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);
  const [selProgramme, setSelProgramme] = useState('');
  const [selClass, setSelClass] = useState('');
  const [selArm, setSelArm] = useState('');
  const [autoSendReport, setAutoSendReport] = useState(false);
  const [togglingReport, setTogglingReport] = useState(false);
  const [weeklySnackbar, setWeeklySnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [weeklyReportLoading, setWeeklyReportLoading] = useState(false);
  // Cache weekly report states per arm so they persist across arm selections
  const reportCacheRef = useRef({});

  // Edit modal state
  const [editModal, setEditModal] = useState({ open: false, type: '', domain: null });
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', domain: null });
  const [deleting, setDeleting] = useState(false);

  // Add new state
  const [addModal, setAddModal] = useState({ open: false, type: '' });
  const [addName, setAddName] = useState('');

  // Drill-down modal state — every stat card on this tab opens one of these.
  const [analyticsModal, setAnalyticsModal] = useState({
    open: false,
    title: '',
    content: null,
    loading: false,
  });
  const closeAnalyticsModal = () =>
    setAnalyticsModal({ open: false, title: '', content: null, loading: false });
  // Toggling an arm's report status from inside the arms-list modal
  const [togglingArmId, setTogglingArmId] = useState(null);

  // ── Fetch Domains ─────────────────────────────────────────────
  const fetchDomains = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [affRes, psyRes] = await Promise.all([
        resultSetupApi.getAffectiveDomains(),
        resultSetupApi.getPsychomotorDomains(),
      ]);

      setAffectives(affRes.data?.data || []);
      setPsychomotors(psyRes.data?.data || []);
    } catch (e) {
      console.error('Failed to fetch domains:', e);
      setError('Failed to load domain configurations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // ── Fetch weekly-report coverage summary (for the Weekly Reports tab's
  // own stat cards — separate from the psychomotor domain stats below).
  // Scoped to whichever Programme/Class/Class-Arm is currently selected in
  // the filter below, same as every other stat card in this module reacts
  // to its page's filters — school-wide when nothing is selected yet. ──
  const fetchReportSummary = useCallback(async (params = {}) => {
    setSummaryLoading(true);
    try {
      const res = await attendanceApi.getWeeklyReportSummary(params);
      if (res.data?.data) {
        setReportSummary(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch weekly report summary:', e);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetches on mount (school-wide, nothing selected yet) and re-fetches
  // whenever the Programme/Class/Class-Arm filter changes, so the stat
  // cards reflect the selected scope instead of staying frozen at the
  // school-wide totals from first load.
  useEffect(() => {
    fetchReportSummary({
      programme_id: selProgramme || undefined,
      class_id: selClass || undefined,
      class_arm_id: selArm || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selProgramme, selClass, selArm]);

  // ── Fetch programmes on mount for weekly report selector ──────
  useEffect(() => {
    fetchProgrammes()
      .then((r) => {
        const data = r.data?.data || r.data || [];
        setProgrammes(Array.isArray(data) ? data : []);
      })
      .catch((e) => console.error('Failed to fetch programmes:', e));
  }, []);

  // ── Fetch classes when programme changes ─────────────────────
  useEffect(() => {
    if (!selProgramme) return;
    setSelClass('');
    setSelArm('');
    setArms([]);
    setAutoSendReport(false);
    fetchClassesByProgramme(selProgramme)
      .then((r) => {
        const data = r.data?.data || r.data || [];
        setClasses(Array.isArray(data) ? data : []);
      })
      .catch((e) => console.error('Failed to fetch classes:', e));
  }, [selProgramme]);

  // ── Fetch arms when class changes ────────────────────────────
  useEffect(() => {
    if (!selClass) return;
    setSelArm('');
    setAutoSendReport(false);
    fetchClassArmsByClass(selClass, { programme_id: selProgramme || undefined })
      .then((r) => {
        const data = r.data || [];
        setArms(Array.isArray(data) ? data : []);
      })
      .catch((e) => console.error('Failed to fetch arms:', e));
  }, [selClass, selProgramme]);

  // ── Load weekly report setting when arm changes ──────────────
  useEffect(() => {
    if (!selArm) {
      setAutoSendReport(false);
      return;
    }

    setWeeklyReportLoading(true);
    attendanceApi
      .getWeeklyReportStatus(selArm)
      .then((res) => {
        const data = res.data?.data;
        const val = data?.auto_send_weekly_report === true;
        reportCacheRef.current[selArm] = val;
        setAutoSendReport(val);
      })
      .catch(() => {
        // If API fails, fall back to cache if available, else default to false
        if (selArm in reportCacheRef.current) {
          setAutoSendReport(reportCacheRef.current[selArm]);
        } else {
          setAutoSendReport(false);
        }
      })
      .finally(() => setWeeklyReportLoading(false));
  }, [selArm]);

  // ── Handlers ──────────────────────────────────────────────────

  // Sync Configuration
  const handleSync = async () => {
    setSyncing(true);
    try {
      await resultSetupApi.syncConfig();
      await fetchDomains();
    } catch (e) {
      console.error('Sync failed:', e);
      setError('Failed to synchronize configuration.');
    } finally {
      setSyncing(false);
    }
  };

  // Open Edit Modal
  const openEdit = (type, domain) => {
    setEditModal({ open: true, type, domain });
    setEditName(domain.name);
  };

  // Close Edit Modal
  const closeEdit = () => {
    setEditModal({ open: false, type: '', domain: null });
    setEditName('');
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const saveFn =
        editModal.type === 'affective'
          ? resultSetupApi.saveAffectiveDomain
          : resultSetupApi.savePsychomotorDomain;

      await saveFn({ id: editModal.domain.id, name: editName.trim() });
      await fetchDomains();
      closeEdit();
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  // Open Delete Confirm
  const openDelete = (type, domain) => {
    setDeleteConfirm({ open: true, type, domain });
  };

  // Close Delete Confirm
  const closeDelete = () => {
    setDeleteConfirm({ open: false, type: '', domain: null });
  };

  // Confirm Delete
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const deleteFn =
        deleteConfirm.type === 'affective'
          ? resultSetupApi.deleteAffectiveDomain
          : resultSetupApi.deletePsychomotorDomain;

      await deleteFn(deleteConfirm.domain.id);
      await fetchDomains();
      closeDelete();
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setDeleting(false);
    }
  };

  // Open Add Modal
  const openAdd = (type) => {
    setAddModal({ open: true, type });
    setAddName('');
  };

  // Close Add Modal
  const closeAdd = () => {
    setAddModal({ open: false, type: '' });
    setAddName('');
  };

  // Confirm Add
  const handleAdd = async () => {
    if (!addName.trim()) return;
    setSaving(true);
    try {
      const saveFn =
        addModal.type === 'affective'
          ? resultSetupApi.saveAffectiveDomain
          : resultSetupApi.savePsychomotorDomain;

      await saveFn({ name: addName.trim() });
      await fetchDomains();
      closeAdd();
    } catch (e) {
      console.error('Add failed:', e);
    } finally {
      setSaving(false);
    }
  };

  // ── Domain list modal (Affective Domains / Psychomotor Skills cards) ──
  // Synchronous — reuses the already-loaded affectives/psychomotors state,
  // no extra network call. Edit/Delete reuse the existing handlers so the
  // modal is a real drill-down, not a read-only duplicate of the table below.
  const openDomainListModal = (type) => {
    const isAffective = type === 'affective';
    const list = isAffective ? affectives : psychomotors;
    const activeCount = list.filter((d) => d.status === 'active').length;
    const title = isAffective ? 'Affective Domains' : 'Psychomotor Skills';

    setAnalyticsModal({
      open: true,
      loading: false,
      title,
      content: (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {list.length} configured — {activeCount} active, {list.length - activeCount} inactive.
          </Typography>
          {list.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              None configured yet. Use Sync Configuration or Add to create one.
            </Typography>
          ) : (
            <TableContainer variant="outlined" sx={{ borderRadius: 2, maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>{isAffective ? 'Key' : 'Skill'}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((d) => (
                    <TableRow key={d.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {d.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={d.status === 'active' ? 'Active' : 'Inactive'}
                          size="small"
                          color={d.status === 'active' ? 'success' : 'default'}
                          sx={{ fontWeight: 600, fontSize: '11px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={`Edit ${d.name}`}>
                          <IconButton
                            size="small"
                            aria-label={`Edit ${d.name}`}
                            onClick={() => {
                              closeAnalyticsModal();
                              openEdit(type, d);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={`Delete ${d.name}`}>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Delete ${d.name}`}
                            onClick={() => {
                              closeAnalyticsModal();
                              openDelete(type, d);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ),
    });
  };

  // ── Configuration Status modal ──────────────────────────────────
  // Replaces the old click-to-resync-immediately card behaviour with a
  // confirm-first modal, so a stray click never silently re-syncs.
  const openSyncStatusModal = () => {
    setAnalyticsModal({
      open: true,
      loading: false,
      title: 'Configuration Status',
      content: (
        <Box>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Affective Domains
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {affectives.length}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Psychomotor Skills
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {psychomotors.length}
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isEmpty
              ? 'No domain/skill keys have been synced yet for the active session term.'
              : affectives.length > 0 && psychomotors.length > 0
                ? 'Both domains are synced for the active session term.'
                : 'Only one domain has been synced — resync to fill in the other.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={syncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
            disabled={syncing}
            onClick={async () => {
              await handleSync();
              closeAnalyticsModal();
            }}
          >
            {syncing ? 'Syncing...' : 'Sync Configuration'}
          </Button>
        </Box>
      ),
    });
  };

  // ── Weekly Report arms modal (Class Arms / Reports Enabled / Reports
  // Disabled cards) — a real drill-down: lists the arms behind whichever
  // card was clicked, scoped to the current Programme/Class/Arm filter,
  // with an inline switch so an admin can act right from the modal. ──
  const openWeeklyReportArmsModal = async (filterType) => {
    const titles = {
      all: 'Class Arms — Weekly Reports',
      enabled: 'Reports Enabled',
      disabled: 'Reports Disabled',
    };
    setAnalyticsModal({ open: true, loading: true, title: titles[filterType], content: null });
    try {
      const res = await attendanceApi.getWeeklyReportArms({
        programme_id: selProgramme || undefined,
        class_id: selClass || undefined,
        class_arm_id: selArm || undefined,
      });
      // Mutable — reassigned after each successful toggle below so a second
      // toggle in the same modal session builds on the latest state instead
      // of the stale list from the initial fetch.
      let currentArms = res.data?.data || [];
      const applyFilter = (arms) =>
        filterType === 'enabled'
          ? arms.filter((a) => a.auto_send_weekly_report)
          : filterType === 'disabled'
            ? arms.filter((a) => !a.auto_send_weekly_report)
            : arms;
      const filtered = applyFilter(currentArms);

      const renderArmsList = (arms) => (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {arms.length} class arm(s)
            {selProgramme || selClass || selArm ? ' matching the selected filter' : ' school-wide'}.
            Toggle a switch to change its weekly-report setting.
          </Typography>
          {arms.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              No class arms match this view.
            </Typography>
          ) : (
            <TableContainer variant="outlined" sx={{ borderRadius: 2, maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Programme</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Arm</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Weekly Report
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {arms.map((arm) => (
                    <TableRow key={arm.class_arm_id} hover>
                      <TableCell>{arm.programme_name || '—'}</TableCell>
                      <TableCell>{arm.class_name || '—'}</TableCell>
                      <TableCell>{arm.class_arm_names}</TableCell>
                      <TableCell align="center">
                        <Switch
                          size="small"
                          checked={arm.auto_send_weekly_report}
                          disabled={togglingArmId === arm.class_arm_id}
                          onChange={async (e) => {
                            const newVal = e.target.checked;
                            setTogglingArmId(arm.class_arm_id);
                            try {
                              await attendanceApi.toggleWeeklyReport(arm.class_arm_id, newVal);
                              currentArms = currentArms.map((a) =>
                                a.class_arm_id === arm.class_arm_id
                                  ? { ...a, auto_send_weekly_report: newVal }
                                  : a,
                              );
                              setAnalyticsModal((prev) => ({
                                ...prev,
                                content: renderArmsList(applyFilter(currentArms)),
                              }));
                              fetchReportSummary({
                                programme_id: selProgramme || undefined,
                                class_id: selClass || undefined,
                                class_arm_id: selArm || undefined,
                              });
                              // Keep the Weekly Report Configuration panel's own
                              // checkbox in sync if this is the currently-selected arm.
                              if (String(arm.class_arm_id) === String(selArm)) {
                                setAutoSendReport(newVal);
                                reportCacheRef.current[selArm] = newVal;
                              }
                            } catch (err) {
                              setWeeklySnackbar({
                                open: true,
                                message: 'Failed to update weekly report setting',
                                severity: 'error',
                              });
                            } finally {
                              setTogglingArmId(null);
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      );

      setAnalyticsModal({
        open: true,
        loading: false,
        title: titles[filterType],
        content: renderArmsList(filtered),
      });
    } catch (e) {
      console.error('Failed to fetch weekly report arms:', e);
      setAnalyticsModal({
        open: true,
        loading: false,
        title: titles[filterType],
        content: <Typography color="error">Failed to load data.</Typography>,
      });
    }
  };

  const isEmpty = affectives.length === 0 && psychomotors.length === 0;
  const affectiveActiveCount = affectives.filter((a) => a.status === 'active').length;
  const psychomotorActiveCount = psychomotors.filter((p) => p.status === 'active').length;
  const syncStatusLabel = isEmpty
    ? 'Not Synced'
    : affectives.length > 0 && psychomotors.length > 0
      ? 'Synced'
      : 'Partial';

  const reportsEnabled = reportSummary.reports_enabled || 0;
  const reportsDisabled = reportSummary.reports_disabled || 0;
  const totalClassArms = reportSummary.total_class_arms || 0;

  // ── Render ────────────────────────────────────────────────────
  return (
    <Box>
      {/* Stat Cards — each inner tab gets its own stats, since they cover two
          unrelated concerns (weekly report delivery vs. domain/skill config). */}
      <Box sx={{ mb: 2 }}>
        {innerTab === 0 ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <StatCard
              loading={summaryLoading}
              count={totalClassArms}
              label="Class Arms"
              subtitle={
                selProgramme || selClass || selArm
                  ? 'Matching selected filter'
                  : 'Eligible for weekly reports'
              }
              icon={GroupsIcon}
              colorIndex={0}
              onClick={() => openWeeklyReportArmsModal('all')}
              tooltip="Click to view and manage every class arm's weekly-report setting"
            />
            <StatCard
              loading={summaryLoading}
              count={reportsEnabled}
              label="Reports Enabled"
              subtitle={
                totalClassArms > 0
                  ? `${Math.round((reportsEnabled / totalClassArms) * 100)}% of arms`
                  : 'No class arms yet'
              }
              icon={NotificationsActiveIcon}
              colorIndex={2}
              onClick={() => openWeeklyReportArmsModal('enabled')}
              tooltip="Click to view arms with weekly reports enabled"
            />
            <StatCard
              loading={summaryLoading}
              count={reportsDisabled}
              label="Reports Disabled"
              subtitle="Click to view and enable"
              icon={NotificationsOffIcon}
              colorIndex={3}
              onClick={() => openWeeklyReportArmsModal('disabled')}
              tooltip="Click to view arms with weekly reports disabled"
            />
          </Stack>
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <StatCard
              loading={loading}
              count={affectives.length}
              label="Affective Domains"
              subtitle={`${affectiveActiveCount} active`}
              icon={EmojiEmotionsIcon}
              colorIndex={0}
              onClick={() => openDomainListModal('affective')}
              tooltip="Click to view all affective domain keys"
            />
            <StatCard
              loading={loading}
              count={psychomotors.length}
              label="Psychomotor Skills"
              subtitle={`${psychomotorActiveCount} active`}
              icon={AccessibilityNewIcon}
              colorIndex={1}
              onClick={() => openDomainListModal('psychomotor')}
              tooltip="Click to view all psychomotor skill keys"
            />
            <StatCard
              loading={loading}
              count={syncStatusLabel}
              label="Configuration Status"
              subtitle={isEmpty ? 'Click to sync now' : 'Click to re-sync defaults'}
              icon={CheckCircleIcon}
              colorIndex={syncStatusLabel === 'Synced' ? 2 : 3}
              onClick={openSyncStatusModal}
              tooltip="Click to view configuration status and sync"
            />
          </Stack>
        )}
      </Box>

      {/* Loading skeleton for the two-column setup area below, matching its real layout —
          only relevant on the Psychomotor Setup tab, which is what actually loads it */}
      {innerTab === 1 && loading && (
        <Grid container spacing={3}>
          {[0, 1].map((col) => (
            <Grid size={{ xs: 12, md: 6 }} key={col}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : theme.palette.grey[200]}`,
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ px: 3, py: 2 }}>
                  <Skeleton variant="text" width="40%" height={28} />
                </Box>
                <Box sx={{ p: 2 }}>
                  {[0, 1, 2].map((row) => (
                    <Skeleton key={row} variant="rounded" height={40} sx={{ mb: 1 }} />
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Sync Banner when empty — only once the domain fetch has actually
            resolved, so this doesn't flash for a school that already has
            domains configured while the initial fetch is still in flight. */}
        {!loading && isEmpty && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              borderRadius: '16px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : theme.palette.grey[200]}`,
              textAlign: 'center',
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
            }}
          >
            <SyncIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Affective & Psychomotor Domain Not Configured
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}
            >
              The affective and psychomotor domain keys are yet to be configured. Click the{' '}
              <b>Sync Configuration</b> button below to synchronize the configuration and create the
              default domain keys for the current session term.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={syncing ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? 'Syncing...' : 'Sync Configuration'}
            </Button>
          </Paper>
        )}

        {/* Inner Tabs: Weekly Reports (conditional) & Psychomotor Setup */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <Tabs
            value={innerTab}
            onChange={(_, v) => setInnerTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                minHeight: 44,
                py: 1,
              },
            }}
          >
            {showWeeklyReports && (
              <Tab
                icon={<NotificationsActiveIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Weekly Reports"
                id="setup-inner-tab-0"
                aria-controls="setup-inner-tabpanel-0"
              />
            )}
            <Tab
              icon={<PsychologyIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Psychomotor Setup"
              id={`setup-inner-tab-${showWeeklyReports ? 1 : 0}`}
              aria-controls={`setup-inner-tabpanel-${showWeeklyReports ? 1 : 0}`}
            />
          </Tabs>
        </Box>

        {/* ── Weekly Reports (auto-send configuration per class arm) ── */}
        {showWeeklyReports && (
          <InnerTabPanel value={innerTab} index={0}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : theme.palette.grey[200]}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <NotificationsActiveIcon color="primary" fontSize="small" />
              <Typography variant="h6" fontWeight={700}>
                Weekly Report Configuration
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Select a class arm below to configure whether weekly attendance reports are
              automatically sent to parents/guardians via the scheduler.
            </Typography>

            {/* Class Arm Selector */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Programme</InputLabel>
                  <Select
                    value={selProgramme}
                    label="Programme"
                    onChange={(e) => setSelProgramme(e.target.value)}
                  >
                    {programmes.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.programme_name || p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small" disabled={!selProgramme}>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={selClass}
                    label="Class"
                    onChange={(e) => setSelClass(e.target.value)}
                  >
                    {classes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.class_name || c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small" disabled={!selClass}>
                  <InputLabel>Class/Arm</InputLabel>
                  <Select
                    value={selArm}
                    label="Class/Arm"
                    onChange={(e) => setSelArm(e.target.value)}
                  >
                    {arms.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.class_arm_names}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Weekly Report Toggle */}
            {selArm ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: isDark
                    ? 'rgba(255,255,255,0.04)'
                    : alpha(theme.palette.primary.main, 0.04),
                  border: '1px solid',
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : alpha(theme.palette.primary.main, 0.12),
                  opacity: togglingReport ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Checkbox
                    checked={autoSendReport}
                    disabled={togglingReport || weeklyReportLoading}
                    onChange={async (e) => {
                      const newVal = e.target.checked;
                      const previousVal = autoSendReport;
                      setAutoSendReport(newVal);
                      reportCacheRef.current[selArm] = newVal;
                      setTogglingReport(true);
                      try {
                        await attendanceApi.toggleWeeklyReport(selArm, newVal);
                        setWeeklySnackbar({
                          open: true,
                          message: newVal
                            ? 'Weekly report enabled. Parents will receive attendance summaries via email.'
                            : 'Weekly report disabled.',
                          severity: 'success',
                        });
                        // Keep this tab's stat cards in sync with the change,
                        // same real-time-refresh pattern used elsewhere in the module.
                        fetchReportSummary({
                          programme_id: selProgramme || undefined,
                          class_id: selClass || undefined,
                          class_arm_id: selArm || undefined,
                        });
                      } catch (err) {
                        setAutoSendReport(previousVal);
                        reportCacheRef.current[selArm] = previousVal;
                        setWeeklySnackbar({
                          open: true,
                          message: 'Failed to update weekly report setting',
                          severity: 'error',
                        });
                      } finally {
                        setTogglingReport(false);
                      }
                    }}
                    size="small"
                    sx={{ p: 0.25, mt: -0.25 }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25 }}>
                      Weekly Report to Guardians
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {autoSendReport
                        ? 'A weekly attendance summary with PDF and Excel report will be automatically emailed to parents/guardians every week via the scheduler.'
                        : 'Enable to automatically send weekly attendance reports to parents/guardians via the scheduler.'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <Alert severity="info" variant="outlined" sx={{ borderRadius: 1 }}>
                <Typography variant="body2">
                  Select a <strong>Programme</strong>, <strong>Class</strong>, and{' '}
                  <strong>Class/Arm</strong> above to configure the weekly report setting for that
                  class arm.
                </Typography>
              </Alert>
            )}
          </Paper>
        </InnerTabPanel>
        )}

        {/* ── Psychomotor Setup (Domain Keys) ───────────── */}
        <InnerTabPanel value={innerTab} index={showWeeklyReports ? 1 : 0}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Manage affective and psychomotor domain keys for the current session term.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={syncing ? <CircularProgress size={14} color="inherit" /> : <SyncIcon />}
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? 'Syncing...' : 'Resync'}
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={3}>
            {/* Affective Domain Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DomainCard
                title="Affective Domain"
                color={theme.palette.success.main}
                isEmpty={affectives.length === 0}
                onSync={handleSync}
                syncing={syncing}
                onAdd={() => openAdd('affective')}
                addLabel="Add affective domain"
              >
                {affectives.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 4 }}
                  >
                    No affective domain keys configured.
                  </Typography>
                ) : (
                  <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Key</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {affectives.map((af, idx) => (
                          <TableRow key={af.id} hover>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {af.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={af.status === 'active' ? 'Active' : 'Inactive'}
                                size="small"
                                color={af.status === 'active' ? 'success' : 'default'}
                                variant="soft"
                                sx={{ fontWeight: 600, fontSize: '11px' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title={`Edit ${af.name}`}>
                                <IconButton
                                  size="small"
                                  aria-label={`Edit ${af.name}`}
                                  onClick={() => openEdit('affective', af)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={`Delete ${af.name}`}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  aria-label={`Delete ${af.name}`}
                                  onClick={() => openDelete('affective', af)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DomainCard>
            </Grid>

            {/* Psychomotor Domain Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DomainCard
                title="Psychomotor Domain"
                color={theme.palette.primary.main}
                isEmpty={psychomotors.length === 0}
                onSync={handleSync}
                syncing={syncing}
                onAdd={() => openAdd('psychomotor')}
                addLabel="Add psychomotor skill"
              >
                {psychomotors.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 4 }}
                  >
                    No psychomotor domain keys configured.
                  </Typography>
                ) : (
                  <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Skill</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {psychomotors.map((ps, idx) => (
                          <TableRow key={ps.id} hover>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {ps.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={ps.status === 'active' ? 'Active' : 'Inactive'}
                                size="small"
                                color={ps.status === 'active' ? 'success' : 'default'}
                                variant="soft"
                                sx={{ fontWeight: 600, fontSize: '11px' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title={`Edit ${ps.name}`}>
                                <IconButton
                                  size="small"
                                  aria-label={`Edit ${ps.name}`}
                                  onClick={() => openEdit('psychomotor', ps)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={`Delete ${ps.name}`}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  aria-label={`Delete ${ps.name}`}
                                  onClick={() => openDelete('psychomotor', ps)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DomainCard>
            </Grid>
          </Grid>
        </InnerTabPanel>
      </>

      {/* ── Edit Modal ───────────────────────────────────── */}
      <Dialog open={editModal.open} onClose={closeEdit} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Edit {editModal.type === 'affective' ? 'Affective Domain' : 'Psychomotor Skill'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={saving || !editName.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Add Modal ────────────────────────────────────── */}
      <Dialog open={addModal.open} onClose={closeAdd} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Add {addModal.type === 'affective' ? 'Affective Domain Key' : 'Psychomotor Skill'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeAdd}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={saving || !addName.trim()}>
            {saving ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────── */}
      <Dialog open={deleteConfirm.open} onClose={closeDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete{' '}
            <Typography component="span" fontWeight={700}>
              "{deleteConfirm.domain?.name}"
            </Typography>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDelete}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Weekly Report Snackbar ────────────────────────── */}
      <Snackbar
        open={weeklySnackbar.open}
        autoHideDuration={4000}
        onClose={() => setWeeklySnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={weeklySnackbar.severity}
          onClose={() => setWeeklySnackbar((p) => ({ ...p, open: false }))}
          variant="filled"
        >
          {weeklySnackbar.message}
        </Alert>
      </Snackbar>

      {/* ── Stat card drill-down modal ───────────────────── */}
      <AnalyticsModal
        open={analyticsModal.open}
        onClose={closeAnalyticsModal}
        title={analyticsModal.title}
        content={analyticsModal.content}
        loading={analyticsModal.loading}
      />
    </Box>
  );
};

export default SetupAffectivePsychomotorTab;
