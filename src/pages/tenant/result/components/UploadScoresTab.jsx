import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert,
  IconButton, Menu, ListItemIcon, ListItemText, useTheme, TablePagination, Tooltip, ToggleButtonGroup, ToggleButton,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  IconCloudUpload, IconDownload, IconEye, IconCheck, IconFileSpreadsheet,
  IconUpload, IconEdit, IconTrash, IconSend, IconLayoutGrid, IconList,
  IconFilter, IconAlertTriangle,
} from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';
import { fetchSessionTerms, fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import {
  fetchSessions, fetchTerms, fetchProgrammes, fetchClassesByProgramme, fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

import DownloadSampleDialog from './DownloadSampleDialog';
import DownloadCombinedDialog from './DownloadCombinedDialog';
import UploadResultDialog from './UploadResultDialog';
import UploadCombinedDialog from './UploadCombinedDialog';
import UploadCaExamDialog from './UploadCaExamDialog';
import InputScoreDialog from './InputScoreDialog';
import ScoreUploadAnalytics from './ScoreUploadAnalytics';
import ScoreUploadCard from './ScoreUploadCard';
import ActionSelectionDialog from './ActionSelectionDialog';

const UploadScoresTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classArms, setClassArms] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState({ session_id: '', term_id: '', programme_id: '', class_id: '', class_arm_id: '', curriculum_id: '', subject_id: '' });
  const [sessionTerms, setSessionTerms] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [analyticsData, setAnalyticsData] = useState(null);

  // Dialog States
  // Submit confirmation prompt state (single + submit-all)
  const [submitConfirm, setSubmitConfirm] = useState({ open: false, allocation: null, all: false });
  const [actionSelectionDialog, setActionSelectionDialog] = useState({ open: false, allocation: null });
  const [downloadSampleDialog, setDownloadSampleDialog] = useState({ open: false, allocation: null });
  const [downloadCombinedDialog, setDownloadCombinedDialog] = useState(false);
  const [uploadResultDialog, setUploadResultDialog] = useState({ open: false, allocation: null });
  const [uploadCombinedDialog, setUploadCombinedDialog] = useState(false);
  const [uploadCaExamDialog, setUploadCaExamDialog] = useState({ open: false, allocation: null });
  const [inputScoreDialog, setInputScoreDialog] = useState({ open: false, allocation: null });

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

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

  // ── Classes for the selected programme ─────────────────────
  useEffect(() => {
    if (!filter.programme_id) {
      setClasses([]);
      return;
    }
    fetchClassesByProgramme(filter.programme_id)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClasses(data);
      })
      .catch(console.error);
  }, [filter.programme_id]);

  // ── Class arms for the selected class ──────────────────────
  useEffect(() => {
    if (!filter.class_id) {
      setClassArms([]);
      return;
    }
    fetchClassArmsByClass(filter.class_id, filter.programme_id ? { programme_id: filter.programme_id } : {})
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClassArms(data);
      })
      .catch(console.error);
  }, [filter.class_id, filter.programme_id]);

  const filteredClasses = classes;
  const filteredClassArms = classArms;

  const filteredAllocations = allocations;

  const selectedClassName = useMemo(() => {
    if (!filter.class_arm_id) return '';
    return classArms.find(c => c.id === filter.class_arm_id)?.class_arm_names || '';
  }, [filter.class_arm_id, classArms]);

  // Build lookup: session_id + term_id → session_term_id (the session_terms row id)
  const sessionTermId = useMemo(() => {
    if (!filter.session_id || !filter.term_id) return null;
    const match = sessionTerms.find(
      (st) => String(st.session?.id) === String(filter.session_id) && String(st.term?.id) === String(filter.term_id)
    );
    return match?.id || null;
  }, [filter.session_id, filter.term_id, sessionTerms]);

  const canShowBulkActions = filter.session_id && filter.term_id && filter.programme_id && filter.class_arm_id;
  const canShowSubmitAll = filter.session_id && filter.term_id && filter.programme_id && filter.class_arm_id;
  // Bulk download/upload/submit-all work across every subject in the class arm —
  // Subject filter is optional for them (only narrows the list when set).
  const allFiltersSelected = Boolean(
    filter.session_id && filter.term_id && filter.programme_id && filter.class_id && filter.class_arm_id
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
      if (filter.subject_id) params.subject_id = filter.subject_id;

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
  }, [filter.session_id, filter.term_id, filter.programme_id, filter.class_id, filter.class_arm_id, filter.subject_id]);

  // ── Fetch curriculums when class_arm changes ───────────────
  useEffect(() => {
    if (!filter.class_arm_id || !filter.session_id || !filter.term_id) {
      setCurriculums([]);
      return;
    }
    const loadCurriculums = async () => {
      try {
        const res = await scoreManagerApi.getClassCurriculums({
          class_arm_id: filter.class_arm_id,
          session_id: filter.session_id,
          term_id: filter.term_id,
        });
        setCurriculums(res?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch curriculums:', err);
      }
    };
    loadCurriculums();
  }, [filter.class_arm_id, filter.session_id, filter.term_id]);

  // ── Fetch subjects when class_arm or curriculum changes ─────
  useEffect(() => {
    if (!filter.class_arm_id || !filter.session_id || !filter.term_id) {
      setSubjects([]);
      return;
    }
    const loadSubjects = async () => {
      try {
        const params = {
          class_arm_id: filter.class_arm_id,
          session_id: filter.session_id,
          term_id: filter.term_id,
        };
        if (filter.curriculum_id) params.curriculum_id = filter.curriculum_id;
        const res = await scoreManagerApi.getClassSubjects(params);
        setSubjects(res?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
      }
    };
    loadSubjects();
  }, [filter.class_arm_id, filter.session_id, filter.term_id, filter.curriculum_id]);

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

  const handleUploaded = () => {
    // No toast here — UploadResultDialog/UploadCaExamDialog already show
    // their own inline success message, and this fires while their dialog
    // is still open, where a separate toast would render behind it anyway.
    fetchAllocations();
  };

  const handleProceedActionSelection = (action, allocation) => {
    setActionSelectionDialog({ open: false, allocation: null });
    if (action === 'download') {
      setDownloadSampleDialog({ open: true, allocation });
    } else if (action === 'upload') {
      setUploadCaExamDialog({ open: true, allocation });
    } else if (action === 'direct') {
      setInputScoreDialog({ open: true, allocation });
    }
  };

  const openSubmitConfirm = (allocation = null) => setSubmitConfirm({ open: true, allocation, all: !allocation });

  const closeSubmitConfirm = () => setSubmitConfirm({ open: false, allocation: null, all: false });

  const handleSubmitScore = async (allocation) => {
    try {
      await scoreManagerApi.submitScores({
        subject_id: allocation.subject_id,
        class_arm_id: allocation.class_arm_id,
        session_term_id: sessionTermId,
      });
      setAllocations(prev =>
        prev.map(a => (a.id === allocation.id ? { ...a, teacher_submit: 'yes' } : a))
      );
      showSnackbar(`Scores for ${allocation.subject_name} (${allocation.class_name}) submitted successfully!`);
    } catch (err) {
      showSnackbar('Failed to submit scores', 'error');
    }
  };

  const handleSubmitAllScores = async () => {
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

      if (submittedCount > 0) {
        const submittedIds = filteredAllocations
          .filter((a) => !skipped.some((s) => s.subject_id === a.subject_id))
          .map((a) => a.id);
        setAllocations((prev) =>
          prev.map((a) => (submittedIds.includes(a.id) ? { ...a, teacher_submit: 'yes' } : a))
        );
      }

      if (skipped.length > 0) {
        showSnackbar(
          `${submittedCount} subject(s) submitted. ${skipped.length} skipped — exam scores must be uploaded first.`,
          submittedCount > 0 ? 'warning' : 'error'
        );
      } else {
        showSnackbar(`All ${submittedCount} subject scores submitted! Waiting for approval.`);
      }
    } catch (err) {
      showSnackbar('Failed to submit all scores', 'error');
    }
  };

  return (
    <Box>
      {/* ── Top Analytics Summary Header ────────────────────── */}
      <ScoreUploadAnalytics analyticsData={analyticsData} />

      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        {/* ── Card Header with Bulk Actions & View Toggle ──────── */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
             Score Upload
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {canShowBulkActions && (
              <>
                <Tooltip title={bulkTooltip}>
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
                      Download {selectedClassName ? `(${selectedClassName})` : ''} Scoresheet
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title={bulkTooltip}>
                  <span>
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      startIcon={<IconCloudUpload size={16} />}
                      disabled={!allFiltersSelected}
                      onClick={() => setUploadCombinedDialog(true)}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
                    >
                      Upload {selectedClassName ? `(${selectedClassName})` : ''} Scoresheet
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
                <Tooltip title="Card Grid View"><IconLayoutGrid size={16} /></Tooltip>
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view" sx={{ p: 0.75 }}>
                <Tooltip title="Table View"><IconList size={16} /></Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* ── Filters Section ───────────────────────────────── */}
        <Box sx={{ p: 2, borderBottom: viewMode === 'cards' ? 'none' : '1px solid divider' }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session</InputLabel>
                <Select value={filter.session_id} label="Session" onChange={e => { resetResults(); setFilter({ ...filter, session_id: e.target.value, programme_id: '', class_id: '', class_arm_id: '', curriculum_id: '', subject_id: '' }); }}>
                  <MenuItem value="">-- Choose --</MenuItem>
                  {sessions.map(s => <MenuItem key={s.id} value={s.id}>{s.session_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Term</InputLabel>
                <Select value={filter.term_id} label="Term" onChange={e => { resetResults(); setFilter({ ...filter, term_id: e.target.value, programme_id: '', class_id: '', class_arm_id: '', curriculum_id: '', subject_id: '' }); }}>
                  <MenuItem value="">-- Choose --</MenuItem>
                  {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select value={filter.programme_id} label="Programme" onChange={e => { resetResults(); setFilter({ ...filter, programme_id: e.target.value, class_id: '', class_arm_id: '', curriculum_id: '', subject_id: '' }); }}>
                  <MenuItem value="">-- Choose --</MenuItem>
                  {programmes.map(p => <MenuItem key={p.id} value={p.id}>{p.programme_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select value={filter.class_id} label="Class" onChange={e => { resetResults(); setFilter({ ...filter, class_id: e.target.value, class_arm_id: '', curriculum_id: '', subject_id: '' }); }}>
                  <MenuItem value="">-- Choose --</MenuItem>
                  {filteredClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.class_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class Arm</InputLabel>
                <Select value={filter.class_arm_id} label="Class Arm" onChange={e => { resetResults(); setFilter({ ...filter, class_arm_id: e.target.value, curriculum_id: '', subject_id: '' }); }}>
                  <MenuItem value="">-- Choose --</MenuItem>
                  {filteredClassArms.map(c => <MenuItem key={c.id} value={c.id}>{c.class_arm_names}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Curriculum</InputLabel>
                <Select value={filter.curriculum_id} label="Curriculum" onChange={e => { resetResults(); setFilter({ ...filter, curriculum_id: e.target.value, subject_id: '' }); }}>
                  <MenuItem value="">-- All --</MenuItem>
                  {curriculums.map(c => <MenuItem key={c.id} value={c.id}>{c.curriculum_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject</InputLabel>
                <Select value={filter.subject_id} label="Subject" onChange={e => { resetResults(); setFilter({ ...filter, subject_id: e.target.value }); }}>
                  <MenuItem value="">-- Select Subject --</MenuItem>
                  {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.subject_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={fetchAllocations}
                disabled={loading || !filter.session_id || !filter.term_id || !filter.programme_id || !filter.class_id}
                sx={{ fontWeight: 600, height: '40px' }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Fetch'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* ── Prompt when not fetched yet ─────────────────────── */}
        {!dataFetched && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="info" sx={{ borderRadius: '8px', display: 'inline-flex', py: 0.5, px: 2 }}>
              {filter.programme_id && filter.class_id
                ? 'Click Fetch to load subject score upload status.'
                : 'Select Session, Term, Programme and Class, then click Fetch to view subject score upload status.'}
            </Alert>
          </Box>
        )}

        {/* ── Empty result → subjects not allocated to a teacher ── */}
        {dataFetched && filteredAllocations.length === 0 && (
          <Box sx={{ px: 2, pt: 1 }}>
            <Alert severity="info" variant="outlined" sx={{ borderRadius: '8px', py: 0.25, fontSize: '0.8125rem' }}>
              No subjects found — subjects must be <strong>allocated to a subject teacher</strong> for this
              session term to appear here. Assign teachers under{' '}
              <strong>Staff Manager → Subject Teacher Allocation</strong>, then click Fetch again.
            </Alert>
          </Box>
        )}

        {/* ── CARD GRID VIEW (Primary Layout matching essential_v2) ──────── */}
        {dataFetched && viewMode === 'cards' && filteredAllocations.length > 0 && (
          <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
            <Grid container spacing={2}>
              {filteredAllocations.map((alloc) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={alloc.id}>
                  <ScoreUploadCard
                    allocation={alloc}
                    onUploadScore={(a) => setActionSelectionDialog({ open: true, allocation: a })}
                    onViewScoreSheet={(a) => setInputScoreDialog({ open: true, allocation: a })}
                    onSubmitScore={(a) => openSubmitConfirm(a)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* ── TABLE VIEW (Fallback Option) ────────────────────── */}
        {dataFetched && viewMode === 'table' && filteredAllocations.length > 0 && (
          <Box>
            <Box sx={{ p: 2 }}>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table stickyHeader sx={{ border: '1px solid', borderColor: 'divider', '& .MuiTableCell-root': { py: 1, px: 1.5, borderRight: '1px solid', borderColor: 'divider' }, whiteSpace: 'nowrap' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: '3%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Class</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Subject Teacher</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Total Registered</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Total CA1</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Total CA2</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Total Exam</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '8%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Submission</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '5%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAllocations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((a, i) => (
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
                        <TableCell>{a.total_reg}</TableCell>
                        <TableCell>{a.ca1_count}</TableCell>
                        <TableCell>{a.ca2_count}</TableCell>
                        <TableCell>{a.exam_upload_count}</TableCell>
                        <TableCell>
                          {a.teacher_submit === 'yes' ? (
                            <Chip icon={<IconCheck size={14} />} label="Submitted" size="small" color="success" />
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
                onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Box>
          </Box>
        )}
      </Paper>

      {/* ── Table Row Action Menu ────────────────────────────── */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={closeActionMenu}
      >
        <MenuItem onClick={() => {
          closeActionMenu();
          setDownloadSampleDialog({ open: true, allocation: actionMenuRow });
        }}>
          <ListItemIcon><IconDownload size={18} /></ListItemIcon>
          <ListItemText>Download Score Sheet</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          closeActionMenu();
          showSnackbar('CA/Exam scoresheet downloaded!');
        }}>
          <ListItemIcon><IconFileSpreadsheet size={18} /></ListItemIcon>
          <ListItemText>CA/Exam Scoresheet</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          closeActionMenu();
          setUploadResultDialog({ open: true, allocation: actionMenuRow });
        }}>
          <ListItemIcon><IconCloudUpload size={18} /></ListItemIcon>
          <ListItemText>Upload Scores</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          closeActionMenu();
          setUploadCaExamDialog({ open: true, allocation: actionMenuRow });
        }}>
          <ListItemIcon><IconUpload size={18} /></ListItemIcon>
          <ListItemText>Upload CA & Exam Scores</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          closeActionMenu();
          setInputScoreDialog({ open: true, allocation: actionMenuRow });
        }}>
          <ListItemIcon><IconEdit size={18} /></ListItemIcon>
          <ListItemText>Input Scores</ListItemText>
        </MenuItem>
        {actionMenuRow?.ca1_count > 0 && (
          <MenuItem onClick={() => {
            closeActionMenu();
            setInputScoreDialog({ open: true, allocation: actionMenuRow });
          }}>
            <ListItemIcon><IconEye size={18} /></ListItemIcon>
            <ListItemText>View Score Sheet</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* ── Submit Confirmation Prompt ─────────────────────── */}
      <Dialog
        open={submitConfirm.open}
        onClose={closeSubmitConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconAlertTriangle size={22} color={theme.palette.warning.main} />
          {submitConfirm.all ? 'Submit All Scores' : 'Submit Score'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {submitConfirm.all ? (
              <>
                You are about to submit scores for <strong>all subjects</strong> in{' '}
                <strong>{selectedClassName || 'this class arm'}</strong>. Subjects without exam scores uploaded
                will be skipped.
              </>
            ) : (
              <>
                You are about to submit scores for <strong>{submitConfirm.allocation?.subject_name}</strong> (
                {submitConfirm.allocation?.class_name}).
              </>
            )}
            {' '}This action flags the scores as ready for approval. Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeSubmitConfirm} color="inherit">Cancel</Button>
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

      <UploadResultDialog
        open={uploadResultDialog.open}
        onClose={() => setUploadResultDialog({ open: false, allocation: null })}
        allocation={uploadResultDialog.allocation}
        onUploaded={handleUploaded}
      />

      <UploadCombinedDialog
        open={uploadCombinedDialog}
        onClose={() => setUploadCombinedDialog(false)}
        allocations={filteredAllocations}
        filter={{ ...filter, session_term_id: sessionTermId }}
        onUploaded={handleUploaded}
      />

      <UploadCaExamDialog
        open={uploadCaExamDialog.open}
        onClose={() => setUploadCaExamDialog({ open: false, allocation: null })}
        allocation={uploadCaExamDialog.allocation}
        onUploaded={handleUploaded}
      />

      <InputScoreDialog
        open={inputScoreDialog.open}
        onClose={() => setInputScoreDialog({ open: false, allocation: null })}
        allocation={inputScoreDialog.allocation}
        filter={{ ...filter, session_term_id: sessionTermId }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
      >
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadScoresTab;
