import { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Link,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  useTheme,
  TablePagination,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  Skeleton,
} from '@mui/material';
import {
  IconCloudUpload,
  IconDownload,
  IconEye,
  IconCheck,
  IconSend,
  IconLayoutGrid,
  IconList,
  IconAlertTriangle,
  IconBulb,
} from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';
import {
  fetchSessionTerms,
  fetchActiveTenantSessionTerm,
} from '@/api/tenant/session-term/sessionTermApi';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

import DownloadSampleDialog from './DownloadSampleDialog';
import DownloadCombinedDialog from './DownloadCombinedDialog';
import UploadCombinedDialog from './UploadCombinedDialog';
import InputScoreDialog from './InputScoreDialog';
import ActionSelectionDialog from './ActionSelectionDialog';
import ScoreUploadAnalytics from './ScoreUploadAnalytics';
import ScoreUploadCard from './ScoreUploadCard';
import AnalyticsModal from '@/pages/tenant/attendance/components/AnalyticsModal';
import { encodeLinkParams } from '@/utils/scoreLinks';
import { TenantAuthContext } from '@/context/TenantContext/auth';

const ADMIN_ROLES = ['super_admin', 'school_admin'];

/**
 * Mirrors ScoreUploadCard's actual layout (header chip + subject name +
 * registered-learners/status row + teacher line, then two progress-bar
 * sections, a status banner, and a two-button footer) so the loading state
 * reads as "this card is arriving" rather than a generic placeholder box —
 * same specificity as ApplicationCardSkeleton on the admission cards.
 */
const ScoreUploadCardSkeleton = () => (
  <Paper
    elevation={0}
    sx={{ borderRadius: '10px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
  >
    <Box
      sx={{ p: 1.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.75 }}>
        <Skeleton variant="rounded" width={60} height={22} />
      </Box>
      <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Skeleton variant="text" width={110} height={18} />
        <Skeleton variant="rounded" width={70} height={22} />
      </Box>
      <Skeleton variant="text" width={140} height={16} />
    </Box>
    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      {[0, 1].map((i) => (
        <Box key={i}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Skeleton variant="text" width={120} height={16} />
            <Skeleton variant="text" width={30} height={16} />
          </Box>
          <Skeleton variant="rounded" height={6} sx={{ borderRadius: 3 }} />
          <Skeleton variant="text" width={160} height={14} sx={{ mx: 'auto', mt: 0.5 }} />
        </Box>
      ))}
      <Skeleton variant="rounded" height={26} />
    </Box>
    <Box sx={{ p: 1.25, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
      <Skeleton variant="rounded" width="100%" height={28} />
      <Skeleton variant="rounded" width="100%" height={28} />
    </Box>
  </Paper>
);

const UploadScoresTab = () => {
  const { roles } = useContext(TenantAuthContext);
  const isAdminRole = Array.isArray(roles)
    ? roles.some((r) => ADMIN_ROLES.includes(typeof r === 'string' ? r : r?.name))
    : false;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classArms, setClassArms] = useState([]);
  const [filter, setFilter] = useState({
    session_id: '',
    term_id: '',
    programme_id: '',
    class_id: '',
    class_arm_id: '',
  });
  const [sessionTerms, setSessionTerms] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // Allocation ids with a submit request in flight — drives each card's
  // "Processing..." badge and blocks double-submits while it's pending.
  const [submittingIds, setSubmittingIds] = useState(() => new Set());
  const [analyticsData, setAnalyticsData] = useState(null);

  // Dialog States
  // Submit confirmation prompt state (single + submit-all)
  const [submitConfirm, setSubmitConfirm] = useState({ open: false, allocation: null, all: false });
  // Per-subject "Upload" opens this 3-way choice first (download / upload /
  // direct entry) — a teacher without a filled-in template should still be
  // able to key scores straight into the browser, so the choice stays even
  // though the standalone Download button on the card covers the "just
  // download" path too.
  const [actionSelectionDialog, setActionSelectionDialog] = useState({
    open: false,
    allocation: null,
  });
  const [downloadSampleDialog, setDownloadSampleDialog] = useState({
    open: false,
    allocation: null,
  });
  const [downloadCombinedDialog, setDownloadCombinedDialog] = useState(false);
  // One upload dialog, reused for the bulk ("Upload Scoresheet") button and
  // the "Upload Score Sheet" choice inside ActionSelectionDialog — the
  // upload endpoint reads which subject(s) a file covers from hidden
  // metadata baked in at download time, not from which button opened the
  // dialog, so there's nothing bulk- or subject-specific about the upload
  // call itself. `subjectName` only changes the dialog's title so the
  // teacher can confirm what they meant to upload.
  const [uploadDialog, setUploadDialog] = useState({ open: false, subjectName: null });
  const [inputScoreDialog, setInputScoreDialog] = useState({ open: false, allocation: null });
  const [learnersModal, setLearnersModal] = useState({
    open: false,
    title: '',
    students: [],
    loading: false,
  });

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // ── Fetch dropdown data on mount (Class Register endpoints) ─
  const activeSessionTermRef = useRef(null);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [sessRes, progRes, activeRes, stRes] = await Promise.all([
          fetchSessions(),
          fetchProgrammes(),
          fetchActiveTenantSessionTerm(),
          fetchSessionTerms(),
        ]);

        const sessionsData = Array.isArray(sessRes.data?.data || sessRes.data)
          ? sessRes.data?.data || sessRes.data
          : [];
        const programmesData = Array.isArray(progRes.data?.data || progRes.data)
          ? progRes.data?.data || progRes.data
          : [];

        setSessions(sessionsData);
        setProgrammes(programmesData);
        setSessionTerms(stRes?.data || []);

        const activeSessionTerm = activeRes?.status ? activeRes.data : null;
        activeSessionTermRef.current = activeSessionTerm;

        const defaultSession =
          (activeSessionTerm && sessionsData.find((s) => s.id === activeSessionTerm.session_id)) ||
          sessionsData[0];
        if (defaultSession) setFilter((prev) => ({ ...prev, session_id: defaultSession.id }));

        // Preselect the first programme too, so Class/Class Arm (and then a
        // fetch) can cascade immediately without the teacher picking anything.
        if (programmesData[0])
          setFilter((prev) => ({
            ...prev,
            programme_id: prev.programme_id || programmesData[0].id,
          }));
      } catch (err) {
        console.error('Failed to load dropdowns:', err);
      }
    };
    loadDropdowns();
  }, []);

  // ── Terms for the selected session (defaults to the active term) ──
  useEffect(() => {
    if (!filter.session_id) {
      setTerms([]);
      return;
    }
    fetchTerms(filter.session_id)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setTerms(data);
        const activeSessionTerm = activeSessionTermRef.current;
        const activeTermId =
          activeSessionTerm?.session_id === filter.session_id ? activeSessionTerm.term_id : null;
        const active = (activeTermId && data.find((t) => t.id === activeTermId)) || data[0];
        if (active) setFilter((prev) => ({ ...prev, term_id: active.id }));
      })
      .catch(console.error);
  }, [filter.session_id]);

  // ── Classes for the selected programme — preselect the first one ──
  useEffect(() => {
    if (!filter.programme_id) {
      setClasses([]);
      return;
    }
    fetchClassesByProgramme(filter.programme_id)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClasses(data);
        if (data[0]) {
          setFilter((prev) => (prev.class_id ? prev : { ...prev, class_id: data[0].id }));
        }
      })
      .catch(console.error);
  }, [filter.programme_id]);

  // ── Class arms for the selected class — preselect the first one.
  // Strictly arms the caller has a SUBJECT allocation in (not just
  // class-teaches) — a class teacher with no subject there has nothing to
  // upload/view here for it. ─────────────────────────────────────────────
  useEffect(() => {
    if (!filter.class_id) {
      setClassArms([]);
      return;
    }
    scoreManagerApi
      .getMyClassArms({ class_id: filter.class_id, programme_id: filter.programme_id || undefined })
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClassArms(data);
        if (data[0]) {
          setFilter((prev) => (prev.class_arm_id ? prev : { ...prev, class_arm_id: data[0].id }));
        }
      })
      .catch(console.error);
  }, [filter.class_id, filter.programme_id]);

  const filteredClasses = classes;
  const filteredClassArms = classArms;

  const filteredAllocations = allocations;

  const selectedClassName = useMemo(() => {
    if (!filter.class_arm_id) return '';
    const armName = classArms.find((c) => c.id === filter.class_arm_id)?.class_arm_names || '';
    const className = classes.find((c) => c.id === filter.class_id)?.class_name || '';
    return [className, armName].filter(Boolean).join(' ');
  }, [filter.class_arm_id, filter.class_id, classArms, classes]);

  // Build lookup: session_id + term_id → session_term_id (the session_terms row id)
  const sessionTermId = useMemo(() => {
    if (!filter.session_id || !filter.term_id) return null;
    const match = sessionTerms.find(
      (st) =>
        String(st.session?.id) === String(filter.session_id) &&
        String(st.term?.id) === String(filter.term_id),
    );
    return match?.id || null;
  }, [filter.session_id, filter.term_id, sessionTerms]);

  const canShowBulkActions =
    filter.session_id && filter.term_id && filter.programme_id && filter.class_arm_id;
  const canShowSubmitAll =
    filter.session_id && filter.term_id && filter.programme_id && filter.class_arm_id;
  const allFiltersSelected = Boolean(
    filter.session_id &&
    filter.term_id &&
    filter.programme_id &&
    filter.class_id &&
    filter.class_arm_id,
  );
  const bulkTooltip = allFiltersSelected
    ? ''
    : 'Select Session, Term, Programme, Class and Class Arm first';

  // ── Fetch allocations and analytics ────────────────────────
  const fetchAllocations = useCallback(async () => {
    if (!filter.session_id || !filter.term_id || !filter.programme_id) return;
    setLoading(true);
    try {
      const params = {
        session_id: filter.session_id,
        term_id: filter.term_id,
        programme_id: filter.programme_id,
      };
      if (filter.class_id) params.class_id = filter.class_id;
      if (filter.class_arm_id) params.class_arm_id = filter.class_arm_id;

      const [allocRes, analyticsRes] = await Promise.all([
        scoreManagerApi.getScoreUploadOverview(params),
        scoreManagerApi.getScoreUploadAnalytics(params),
      ]);

      setAllocations(allocRes?.data?.data || []);
      setAnalyticsData(analyticsRes?.data?.data || null);
      setDataFetched(true);
    } catch (err) {
      console.error('Failed to fetch allocations:', err);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [
    filter.session_id,
    filter.term_id,
    filter.programme_id,
    filter.class_id,
    filter.class_arm_id,
  ]);

  // Auto-fetch once every filter needed for a result is preselected, so the
  // page already has data the moment a teacher lands on it — no manual Fetch
  // click needed for the default view. Only fires once, the first time all
  // four are present; Fetch stays available for any later filter change.
  const autoFetchedRef = useRef(false);
  useEffect(() => {
    if (autoFetchedRef.current) return;
    if (
      filter.session_id &&
      filter.term_id &&
      filter.programme_id &&
      filter.class_id &&
      filter.class_arm_id
    ) {
      autoFetchedRef.current = true;
      fetchAllocations();
    }
  }, [
    filter.session_id,
    filter.term_id,
    filter.programme_id,
    filter.class_id,
    filter.class_arm_id,
    fetchAllocations,
  ]);

  const openActionMenu = (e, row) => {
    setActionMenuAnchor(e.currentTarget);
    setActionMenuRow(row);
  };

  // Results (info banner + cards/table) only appear after a Fetch request
  const resetResults = () => {
    setDataFetched(false);
    setAllocations([]);
  };

  const closeActionMenu = () => {
    setActionMenuAnchor(null);
    setActionMenuRow(null);
  };

  // Every mutating action (bulk or per-subject upload, submit) funnels
  // through this so the stat cards and card list are always current —
  // no manual refresh needed anywhere on this page.
  const handleUploaded = (message) => {
    if (message) showSnackbar(message);
    fetchAllocations();
  };

  const handleProceedActionSelection = (action, allocation) => {
    setActionSelectionDialog({ open: false, allocation: null });
    if (action === 'download') {
      setDownloadSampleDialog({ open: true, allocation });
    } else if (action === 'upload') {
      setUploadDialog({ open: true, subjectName: allocation.subject_name });
    } else if (action === 'direct') {
      setInputScoreDialog({ open: true, allocation });
    }
  };

  const openSubmitConfirm = (allocation = null) =>
    setSubmitConfirm({ open: true, allocation, all: !allocation });

  const closeSubmitConfirm = () => setSubmitConfirm({ open: false, allocation: null, all: false });

  const handleSubmitScore = async (allocation) => {
    setSubmittingIds((prev) => new Set(prev).add(allocation.id));
    try {
      await scoreManagerApi.submitScores({
        subject_id: allocation.subject_id,
        class_arm_id: allocation.class_arm_id,
        session_term_id: sessionTermId,
      });
      // Full refetch (not just a local patch) so the analytics summary
      // cards above the list reflect the new submission count immediately
      // too, not just this one card's badge.
      await fetchAllocations();
      showSnackbar(
        `Scores for ${allocation.subject_name} (${allocation.class_name}) submitted successfully!`,
      );
    } catch (err) {
      showSnackbar('Failed to submit scores', 'error');
    } finally {
      setSubmittingIds((prev) => {
        const next = new Set(prev);
        next.delete(allocation.id);
        return next;
      });
    }
  };

  const handleSubmitAllScores = async () => {
    const allIds = new Set(filteredAllocations.map((a) => a.id));
    setSubmittingIds(allIds);
    try {
      const res = await scoreManagerApi.submitAllScoresValidated({
        class_arm_id: filter.class_arm_id,
        session_term_id: sessionTermId,
        allocations: filteredAllocations.map((a) => ({
          id: a.id,
          subject_id: a.subject_id,
        })),
      });

      const data = res?.data?.data || {};
      const submittedCount = data.submitted_count || 0;
      const skipped = data.skipped || [];

      await fetchAllocations();

      if (skipped.length > 0) {
        showSnackbar(
          `${submittedCount} subject(s) submitted. ${skipped.length} skipped — exam scores must be uploaded first.`,
          submittedCount > 0 ? 'warning' : 'error',
        );
      } else {
        showSnackbar(`All ${submittedCount} subject scores submitted! Waiting for approval.`);
      }
    } catch (err) {
      showSnackbar('Failed to submit all scores', 'error');
    } finally {
      setSubmittingIds(new Set());
    }
  };

  const openScoreSheet = (allocation) => {
    const token = encodeLinkParams({
      subject_id: allocation.subject_id,
      class_arm_id: allocation.class_arm_id,
      session_term_id: sessionTermId,
    });
    window.open(`/result-scoresheet?t=${token}`, '_blank', 'noopener,noreferrer');
  };

  const openLearnersModal = async (allocation) => {
    setLearnersModal({
      open: true,
      title: `${allocation.subject_name} — Registered Learners`,
      students: [],
      loading: true,
    });
    try {
      const res = await scoreManagerApi.getRegisteredStudents({
        subject_id: allocation.subject_id,
        class_arm_id: allocation.class_arm_id,
        session_term_id: sessionTermId,
      });
      setLearnersModal((prev) => ({ ...prev, students: res?.data?.data || [], loading: false }));
    } catch (err) {
      console.error('Failed to fetch registered learners:', err);
      setLearnersModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <Box>
      {/* ── Top Analytics Summary Header ────────────────────── */}
      <ScoreUploadAnalytics analyticsData={analyticsData} loading={loading} />

      {/* ── Guidance banner — what this page is for, and what to do next ── */}

      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        }}
      >
        {/* ── Card Header with Bulk Actions & View Toggle ──────── */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
            Score Upload
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {canShowBulkActions && (
              <>
                <Tooltip
                  title={
                    allFiltersSelected
                      ? 'Downloads ONE Excel file with a column for every subject in this class arm — fill it in and upload it back with the button next to this one.'
                      : bulkTooltip
                  }
                >
                  <span>
                    <Button
                      variant="contained"
                      size="small"
                      color="info"
                      startIcon={<IconDownload size={16} />}
                      disabled={!allFiltersSelected}
                      onClick={() => setDownloadCombinedDialog(true)}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
                    >
                      Download All Subjects{selectedClassName ? ` (${selectedClassName})` : ''}
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    allFiltersSelected
                      ? "Uploads a previously downloaded all-subjects Excel file — every subject's scores in it are saved at once."
                      : bulkTooltip
                  }
                >
                  <span>
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      startIcon={<IconCloudUpload size={16} />}
                      disabled={!allFiltersSelected}
                      onClick={() => setUploadDialog({ open: true, subjectName: null })}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
                    >
                      Upload All Subjects{selectedClassName ? ` (${selectedClassName})` : ''}
                    </Button>
                  </span>
                </Tooltip>
              </>
            )}

            {canShowSubmitAll && (
              <Tooltip title={bulkTooltip}>
                <span>
                  <Button
                    variant="contained"
                    size="small"
                    color="warning"
                    startIcon={<IconSend size={16} />}
                    disabled={!allFiltersSelected}
                    onClick={() => openSubmitConfirm()}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
                  >
                    Submit All Scores
                  </Button>
                </span>
              </Tooltip>
            )}

            {/* View Mode Toggle */}
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              aria-label="view mode"
              sx={{ ml: 0.5 }}
            >
              <ToggleButton value="cards" aria-label="card view" sx={{ p: 0.75 }}>
                <Tooltip title="Card Grid View">
                  <IconLayoutGrid size={16} />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view" sx={{ p: 0.75 }}>
                <Tooltip title="Table View">
                  <IconList size={16} />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* ── Filters Section — Curriculum/Subject removed: curriculum is
             already tied to the class, and every subject for the class arm
             shows up below without needing to pre-pick one. ───────────── */}
        <Box sx={{ p: 2, borderBottom: viewMode === 'cards' ? 'none' : '1px solid divider' }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session</InputLabel>
                <Select
                  value={filter.session_id}
                  label="Session"
                  onChange={(e) => {
                    resetResults();
                    setFilter({
                      ...filter,
                      session_id: e.target.value,
                      programme_id: '',
                      class_id: '',
                      class_arm_id: '',
                    });
                  }}
                >
                  <MenuItem value="">-- Choose --</MenuItem>
                  {sessions.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.session_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Term</InputLabel>
                <Select
                  value={filter.term_id}
                  label="Term"
                  onChange={(e) => {
                    resetResults();
                    setFilter({
                      ...filter,
                      term_id: e.target.value,
                      programme_id: '',
                      class_id: '',
                      class_arm_id: '',
                    });
                  }}
                >
                  <MenuItem value="">-- Choose --</MenuItem>
                  {terms.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.term_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select
                  value={filter.programme_id}
                  label="Programme"
                  onChange={(e) => {
                    resetResults();
                    setFilter({
                      ...filter,
                      programme_id: e.target.value,
                      class_id: '',
                      class_arm_id: '',
                    });
                  }}
                >
                  <MenuItem value="">-- Choose --</MenuItem>
                  {programmes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.programme_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select
                  value={filter.class_id}
                  label="Class"
                  onChange={(e) => {
                    resetResults();
                    setFilter({ ...filter, class_id: e.target.value, class_arm_id: '' });
                  }}
                >
                  <MenuItem value="">-- Choose --</MenuItem>
                  {filteredClasses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.class_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class Arm</InputLabel>
                <Select
                  value={filter.class_arm_id}
                  label="Class Arm"
                  onChange={(e) => {
                    resetResults();
                    setFilter({ ...filter, class_arm_id: e.target.value });
                  }}
                >
                  <MenuItem value="">-- Choose --</MenuItem>
                  {filteredClassArms.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.class_arm_names}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={fetchAllocations}
                disabled={
                  loading ||
                  !filter.session_id ||
                  !filter.term_id ||
                  !filter.programme_id ||
                  !filter.class_id
                }
                sx={{ fontWeight: 600, height: '40px' }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Fetch'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* ── Skeleton — shown for the first fetch and every refetch, so
             a filter change or Fetch click never looks frozen ───────── */}
        {loading && (
          <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
            <Grid container spacing={2}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                  <ScoreUploadCardSkeleton />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* ── Prompt when not fetched yet ─────────────────────── */}
        {!loading && !dataFetched && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert
              severity="info"
              sx={{ borderRadius: '8px', display: 'inline-flex', py: 0.5, px: 2 }}
            >
              {filter.programme_id && filter.class_id
                ? 'Click Fetch to load subject score upload status.'
                : 'Select Session, Term, Programme and Class, then click Fetch to view subject score upload status.'}
            </Alert>
          </Box>
        )}

        {/* ── Empty result → subjects not allocated to a teacher ── */}
        {!loading && dataFetched && filteredAllocations.length === 0 && (
          <Box sx={{ px: 2, pt: 1 }}>
            <Alert
              severity="info"
              variant="outlined"
              sx={{ borderRadius: '8px', py: 0.25, fontSize: '0.8125rem' }}
            >
              {isAdminRole ? (
                <>
                  No subjects found — subjects must be{' '}
                  <strong>allocated to a subject teacher</strong> for this session term to appear
                  here. Assign teachers under{' '}
                  <Link
                    component={RouterLink}
                    to="/staff-setup?tab=allocations&sub=subject-teacher"
                    fontWeight={700}
                  >
                    Staff Manager → Subject Teacher Allocation
                  </Link>
                  , then click Fetch again.
                </>
              ) : (
                <>
                  No subjects have been allocated to you for this class arm this term yet. Contact
                  your school administrator to get assigned, then click Fetch again.
                </>
              )}
            </Alert>
          </Box>
        )}

        {/* ── CARD GRID VIEW (Primary Layout matching essential_v2) ──────── */}
        {!loading && dataFetched && viewMode === 'cards' && filteredAllocations.length > 0 && (
          <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
            <Grid container spacing={2}>
              {filteredAllocations.map((alloc) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={alloc.id}>
                  <ScoreUploadCard
                    allocation={{ ...alloc, isSubmitting: submittingIds.has(alloc.id) }}
                    onUploadScore={(a) => setActionSelectionDialog({ open: true, allocation: a })}
                    onViewScoreSheet={openScoreSheet}
                    onSubmitScore={(a) => openSubmitConfirm(a)}
                    onViewLearners={openLearnersModal}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* ── TABLE VIEW (Fallback Option) ────────────────────── */}
        {!loading && dataFetched && viewMode === 'table' && filteredAllocations.length > 0 && (
          <Box>
            <Box sx={{ p: 2 }}>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table
                  stickyHeader
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '& .MuiTableCell-root': {
                      py: 1,
                      px: 1.5,
                      borderRight: '1px solid',
                      borderColor: 'divider',
                    },
                    whiteSpace: 'nowrap',
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          width: '3%',
                          bgcolor: isDark ? 'grey.900' : 'grey.50',
                        }}
                      >
                        #
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }}>
                        Class
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }}>
                        Subject
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }}>
                        Subject Teacher
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          width: '10%',
                          bgcolor: isDark ? 'grey.900' : 'grey.50',
                        }}
                      >
                        Total Registered
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          width: '10%',
                          bgcolor: isDark ? 'grey.900' : 'grey.50',
                        }}
                      >
                        Total CA1
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          width: '10%',
                          bgcolor: isDark ? 'grey.900' : 'grey.50',
                        }}
                      >
                        Total CA2
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          width: '10%',
                          bgcolor: isDark ? 'grey.900' : 'grey.50',
                        }}
                      >
                        Total Exam
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          width: '8%',
                          bgcolor: isDark ? 'grey.900' : 'grey.50',
                        }}
                      >
                        Submission
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          width: '5%',
                          bgcolor: isDark ? 'grey.900' : 'grey.50',
                        }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAllocations
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((a, i) => (
                        <TableRow key={a.id} hover>
                          <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                          <TableCell>{a.class_name}</TableCell>
                          <TableCell>{a.subject_name}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={a.teacher_name || 'Unassigned'}
                              color={a.has_teacher === false ? 'default' : 'primary'}
                              variant="outlined"
                              sx={{ fontSize: '11px', maxWidth: 160 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box
                              component="span"
                              onClick={() => a.total_reg > 0 && openLearnersModal(a)}
                              sx={{
                                cursor: a.total_reg > 0 ? 'pointer' : 'default',
                                '&:hover':
                                  a.total_reg > 0
                                    ? { textDecoration: 'underline', color: 'primary.main' }
                                    : undefined,
                              }}
                            >
                              {a.total_reg}
                            </Box>
                          </TableCell>
                          <TableCell>{a.ca1_count}</TableCell>
                          <TableCell>{a.ca2_count}</TableCell>
                          <TableCell>{a.exam_upload_count}</TableCell>
                          <TableCell>
                            {a.teacher_submit === 'yes' ? (
                              <Chip
                                icon={<IconCheck size={14} />}
                                label="Submitted"
                                size="small"
                                color="success"
                              />
                            ) : (
                              <Chip label="Pending" size="small" color="warning" />
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={(e) => openActionMenu(e, a)}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredAllocations.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Box>
          </Box>
        )}
      </Paper>

      {/* ── Table Row Action Menu ────────────────────────────── */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={closeActionMenu}>
        <MenuItem
          onClick={() => {
            closeActionMenu();
            setDownloadSampleDialog({ open: true, allocation: actionMenuRow });
          }}
        >
          <ListItemIcon>
            <IconDownload size={18} />
          </ListItemIcon>
          <ListItemText>Download Score Sheet</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const row = actionMenuRow;
            closeActionMenu();
            if (row) setActionSelectionDialog({ open: true, allocation: row });
          }}
        >
          <ListItemIcon>
            <IconCloudUpload size={18} />
          </ListItemIcon>
          <ListItemText>Upload Scores</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const row = actionMenuRow;
            closeActionMenu();
            if (row) openScoreSheet(row);
          }}
        >
          <ListItemIcon>
            <IconEye size={18} />
          </ListItemIcon>
          <ListItemText>Score Sheet</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Submit Confirmation Prompt ─────────────────────── */}
      <Dialog open={submitConfirm.open} onClose={closeSubmitConfirm} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconAlertTriangle size={22} color={theme.palette.warning.main} />
          {submitConfirm.all ? 'Submit All Scores' : 'Submit Score'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {submitConfirm.all ? (
              <>
                You are about to submit scores for <strong>all subjects</strong> in{' '}
                <strong>{selectedClassName || 'this class arm'}</strong>. Subjects without exam
                scores uploaded will be skipped.
              </>
            ) : (
              <>
                You are about to submit scores for{' '}
                <strong>{submitConfirm.allocation?.subject_name}</strong> (
                {submitConfirm.allocation?.class_name}).
              </>
            )}{' '}
            This action flags the scores as ready for approval. Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeSubmitConfirm} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<IconSend size={16} />}
            onClick={async () => {
              const target = submitConfirm.allocation;
              const isAll = submitConfirm.all;
              closeSubmitConfirm();
              if (isAll) {
                await handleSubmitAllScores();
              } else if (target) {
                await handleSubmitScore(target);
              }
            }}
          >
            Yes, Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialogs & Modals ───────────────────────────────── */}
      <ActionSelectionDialog
        open={actionSelectionDialog.open}
        allocation={actionSelectionDialog.allocation}
        onClose={() => setActionSelectionDialog({ open: false, allocation: null })}
        onProceed={handleProceedActionSelection}
      />

      <InputScoreDialog
        open={inputScoreDialog.open}
        onClose={() => setInputScoreDialog({ open: false, allocation: null })}
        allocation={inputScoreDialog.allocation}
        filter={{ ...filter, session_term_id: sessionTermId }}
        onSaved={handleUploaded}
      />

      <DownloadSampleDialog
        open={downloadSampleDialog.open}
        onClose={() => setDownloadSampleDialog({ open: false, allocation: null })}
        allocation={downloadSampleDialog.allocation}
        filter={{ ...filter, session_term_id: sessionTermId }}
      />

      <DownloadCombinedDialog
        open={downloadCombinedDialog}
        onClose={() => setDownloadCombinedDialog(false)}
        allocations={filteredAllocations}
        filter={{ ...filter, session_term_id: sessionTermId }}
        sessionTermId={sessionTermId}
      />

      <UploadCombinedDialog
        open={uploadDialog.open}
        onClose={() => setUploadDialog({ open: false, subjectName: null })}
        allocations={filteredAllocations}
        filter={{ ...filter, session_term_id: sessionTermId }}
        subjectName={uploadDialog.subjectName}
        onUploaded={() => handleUploaded()}
      />

      <AnalyticsModal
        open={learnersModal.open}
        onClose={() => setLearnersModal({ open: false, title: '', students: [], loading: false })}
        title={learnersModal.title}
        loading={learnersModal.loading}
        content={
          learnersModal.students.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No registered learners found.
            </Typography>
          ) : (
            <List dense>
              {learnersModal.students.map((s) => (
                <ListItem key={s.user_id || s.student_id}>
                  <ListItemAvatar>
                    <Avatar src={s.avatar} sx={{ width: 32, height: 32, fontSize: 14 }}>
                      {(s.fname || '?').charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${s.lname || ''} ${s.fname || ''} ${s.mname || ''}`.trim()}
                    secondary={s.student_id ? `Admission No: ${s.student_id}` : undefined}
                  />
                </ListItem>
              ))}
            </List>
          )
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadScoresTab;
