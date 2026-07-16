import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Tooltip,
  Tabs,
  Tab,
  Card,
  CardContent,
  OutlinedInput,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { IconEye, IconPencil } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import AdmissionLetterEditor from '@/components/tenant/admission/setup/AdmissionLetterEditor';
import {
  fetchSessions,
  fetchSessionTermsBySession,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import {
  fetchAdmissionBatches,
  toggleAdmissionBatchStatus,
  updateAdmissionBatch,
  fetchAdmissionCodeFormat,
  updateAdmissionCodeFormat,
} from '@/api/tenant/admission/admissionApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Admission Setup' }];

// helper — safely extract array from various API response shapes
const extractList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

const StatusChip = ({ status }) => {
  const isActive = status === 'active';
  return (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        bgcolor: isActive ? 'success.light' : 'error.light',
        color: isActive ? 'success.dark' : 'error.dark',
        fontWeight: 600,
        fontSize: 11,
      }}
    />
  );
};
const BatchStatusChip = ({ status }) => {
  const isOpen = status === 'open';
  return (
    <Chip
      label={isOpen ? 'Open' : 'Close'}
      size="small"
      sx={{
        bgcolor: isOpen ? 'success.light' : 'error.light',
        color: isOpen ? 'success.dark' : 'error.dark',
        fontWeight: 700,
        fontSize: 11,
        minWidth: 52,
      }}
    />
  );
};

const YesNoPill = ({ value }) => (
  <Chip
    label={value ? 'Yes' : 'No'}
    size="small"
    sx={{
      bgcolor: value ? 'primary.light' : 'warning.light',
      color: value ? 'primary.main' : 'warning.main',
      fontWeight: 700,
      fontSize: 11,
      minWidth: 36,
    }}
  />
);

const FeePills = ({ requirePayment, appFee, acceptanceFee, onViewPayments }) => {
  if (!requirePayment) return <YesNoPill value={false} />;
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <YesNoPill value />

      <Tooltip title="View payment breakdown">
        <IconButton
          size="small"
          onClick={onViewPayments}
          sx={{
            bgcolor: 'info.light',
            color: 'info.main',
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'info.main',
              color: 'white',
            },
          }}
        >
          <IconEye size={12} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

const ViewEditPair = ({ onView, onEdit }) => (
  <Stack direction="row" spacing={0.5}>
    <Tooltip title="View">
      <IconButton
        size="small"
        onClick={onView}
        sx={{
          bgcolor: 'primary.light',
          color: 'primary.main',
          borderRadius: 1,
          p: 0.5,
        }}
      >
        <IconEye size={14} sx={{ color: 'primary.main' }} />
      </IconButton>
    </Tooltip>
    <Tooltip title="Edit">
      <IconButton
        size="small"
        onClick={onEdit}
        sx={{
          bgcolor: 'success.light',
          color: 'success.main',
          borderRadius: 1,
          p: 0.5,
        }}
      >
        <IconPencil size={14} />
      </IconButton>
    </Tooltip>
  </Stack>
);

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`admission-tabpanel-${index}`}
    aria-labelledby={`admission-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

// ─── Student number length options ────────────────────────────────────────────
const STD_NUM_OPTIONS = [
  { key: '[:stdNum_2]', label: '2 digits', example: '01' },
  { key: '[:stdNum_3]', label: '3 digits', example: '001' },
  { key: '[:stdNum_4]', label: '4 digits', example: '0001' },
  { key: '[:stdNum_5]', label: '5 digits', example: '00001' },
  // { key: '[:stdNum_6]', label: '6 digits', example: '000001' },
];

const AdmissionSetup = () => {
  const navigate = useNavigate();

  // ── Tabs state ──────────────────────────────────────────────────────────────
  const [tabValue, setTabValue] = useState(0);

  // ── Existing state (Admission Setup tab) ────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedSessionTermId, setSelectedSessionTermId] = useState(null);
  const [selectedSessionTermLabel, setSelectedSessionTermLabel] = useState('');

  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTerm, setMenuTerm] = useState(null);

  const [batchMenuAnchor, setBatchMenuAnchor] = useState(null);
  const [menuBatch, setMenuBatch] = useState(null);

  const [confirmToggleBatch, setConfirmToggleBatch] = useState({ open: false, batch: null });

  const [letterEditorOpen, setLetterEditorOpen] = useState(false);
  const [letterEditorBatch, setLetterEditorBatch] = useState(null);
  const [letterEditorReadOnly, setLetterEditorReadOnly] = useState(false);
  const [letterEditorContent, setLetterEditorContent] = useState('');

  const [paymentViewOpen, setPaymentViewOpen] = useState(false);
  const [paymentViewBatch, setPaymentViewBatch] = useState(null);

  // ── Code Format state (school-level, not per-batch) ─────────────────────────
  const [codeFormatInput, setCodeFormatInput] = useState('');
  const [schoolShortName, setSchoolShortName] = useState('');
  const [selectedStdNum, setSelectedStdNum] = useState('');
  // hasShortNameInFormat removed — everything lives in codeFormatInput directly
  const [codeFormatSaving, setCodeFormatSaving] = useState(false);
  const [codeFormatLoading, setCodeFormatLoading] = useState(false);
  const [copiedPlaceholder, setCopiedPlaceholder] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionTermId) {
      loadBatches(selectedSessionTermId);
    } else {
      setBatches([]);
    }
  }, [selectedSessionTermId]);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await fetchSessions();
      const list = extractList(res);
      setSessions(list);
      if (list.length > 0) {
        setSelectedSessionId(list[0].id);
        await loadSessionTerms(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load sessions', err);
      showSnackbar('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionTerms = async (sessionId) => {
    try {
      const res = await fetchSessionTermsBySession(sessionId);
      const session_terms = extractList(res);
      setSessionTerms(session_terms);
      const selected = session_terms[0] ?? null;
      if (selected) {
        setSelectedSessionTermId(selected.id);
        setSelectedSessionTermLabel(
          `${selected.session.sesname} - ${selected.display_term.display_name}`,
        );
      } else {
        setSelectedSessionTermId(null);
        setSelectedSessionTermLabel('');
      }
    } catch (err) {
      console.error('Failed to load session terms', err);
      showSnackbar('Failed to load session terms', 'error');
    }
  };

  const loadBatches = async (termId) => {
    setBatchesLoading(true);
    try {
      const res = await fetchAdmissionBatches(termId);
      setBatches(extractList(res));
    } catch (err) {
      console.error('Failed to load batches', err);
      showSnackbar('Failed to load admission batches', 'error');
    } finally {
      setBatchesLoading(false);
    }
  };

  // ── Load admission code format (school-level, no batch needed) ────────────
  const loadAdmissionCodeFormat = async () => {
    setCodeFormatLoading(true);
    try {
      const res = await fetchAdmissionCodeFormat();
      const savedFormat = res?.data?.code_format ?? '';
      const savedShortName = res?.data?.school_short_name ?? '';

      // Put the full format directly into the input field
      setCodeFormatInput(savedFormat);
      setSchoolShortName(savedShortName || '');

      // Detect which student number is selected
      let foundStdNum = '';
      for (const opt of STD_NUM_OPTIONS) {
        if (savedFormat.includes(opt.key)) {
          foundStdNum = opt.key;
          break;
        }
      }
      setSelectedStdNum(foundStdNum);
    } catch (err) {
      console.error('Failed to load admission code format', err);
    } finally {
      setCodeFormatLoading(false);
    }
  };

  const handleSessionChange = (e) => {
    const id = Number(e.target.value);
    setSelectedSessionId(id);
    setSelectedSessionTermId(null);
    setSelectedSessionTermLabel('');
    setBatches([]);
    loadSessionTerms(id);
  };

  const handleTermSelect = (session_term) => {
    setSelectedSessionTermId(session_term.id);
    setSelectedSessionTermLabel(
      `${session_term.session.sesname} - ${session_term.display_term.display_name}`,
    );
  };

  const handleMenuOpen = (e, session_term) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setMenuTerm(session_term);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTerm(null);
  };

  const handleToggleTermStatus = () => {
    if (!menuTerm) return;
    setSessionTerms((prev) =>
      prev.map((term) =>
        term.session_term_id === menuTerm.session_term_id
          ? { ...term, status: term.status === 'active' ? 'inactive' : 'active' }
          : term,
      ),
    );
    showSnackbar(
      `Term ${menuTerm.display_name} ${menuTerm.status === 'active' ? 'deactivated' : 'activated'} successfully`,
      'success',
    );
    handleMenuClose();
  };

  const handleToggleBatchStatus = async () => {
    const batch = confirmToggleBatch.batch;
    setConfirmToggleBatch({ open: false, batch: null });
    if (!batch) return;
    // Optimistic update
    const newStatus = batch.status === 'open' ? 'close' : 'open';
    setBatches((prev) => prev.map((b) => (b.id === batch.id ? { ...b, status: newStatus } : b)));
    try {
      await toggleAdmissionBatchStatus(batch.id);
      showSnackbar(`Batch ${newStatus === 'open' ? 'opened' : 'closed'} successfully`);
    } catch (err) {
      // Revert on failure
      setBatches((prev) =>
        prev.map((b) => (b.id === batch.id ? { ...b, status: batch.status } : b)),
      );
      showSnackbar('Failed to update batch status', 'error');
    }
  };

  const handleSaveAdmissionLetter = async () => {
    if (!letterEditorBatch) return;
    try {
      const payload = {
        admission_letter_template: letterEditorContent,
      };

      await updateAdmissionBatch(letterEditorBatch.id, payload);

      // Update the batch in the local state
      setBatches((prev) =>
        prev.map((b) =>
          b.id === letterEditorBatch.id
            ? { ...b, admission_letter_template: letterEditorContent }
            : b,
        ),
      );

      showSnackbar('Admission letter saved successfully');
      setLetterEditorOpen(false);
    } catch (err) {
      console.error('Failed to save admission letter', err);
      showSnackbar('Failed to save admission letter', 'error');
    }
  };

  const handleCreateBatch = () => {
    navigate('/admission-setup/create-batch', {
      state: {
        sessionId: selectedSessionId,
        sessionTermId: selectedSessionTermId,
        sessionTermLabel: selectedSessionTermLabel,
      },
    });
  };

  const handleEditBatch = (batch) => {
    setBatchMenuAnchor(null);
    setMenuBatch(null);
    navigate(`/admission-setup/edit-batch/${batch.id}`, {
      state: {
        batch,
        sessionId: selectedSessionId,
        sessionTermId: selectedSessionTermId,
        sessionTermLabel: selectedSessionTermLabel,
      },
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Load code format data when switching to the Code Format tab
    if (newValue === 1) {
      loadAdmissionCodeFormat();
    }
  };

  // ── Code Format handlers (school-level, no batch) ──────────────────────────

  // Helper: append a placeholder to codeFormatInput with auto-slash
  const appendToFormat = (placeholder) => {
    setCodeFormatInput((prev) => {
      const trimmed = prev.trim();
      const prefix = trimmed.length > 0 ? '/' : '';
      return trimmed + prefix + placeholder;
    });
  };

  // Get the complete format string — everything is already in the input
  const getFullCodeFormat = () => codeFormatInput.trim();

  const handleShortNameChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSchoolShortName(value);

    if (value.trim()) {
      // Insert [:shortname] if not already present (functional updater avoids stale closure)
      setCodeFormatInput((prev) => {
        if (prev.includes('[:shortname]')) return prev;
        const trimmed = prev.trim();
        const prefix = trimmed.length > 0 ? '/' : '';
        return trimmed + prefix + '[:shortname]';
      });
    } else {
      // Remove [:shortname] when cleared (use split/join to avoid regex special chars)
      setCodeFormatInput((prev) =>
        prev
          .split('/[:shortname]')
          .join('')
          .split('[:shortname]/')
          .join('')
          .split('[:shortname]')
          .join('')
          .replace(/\/+$/, '')
          .replace(/^\/+/, '')
          .replace(/\/+/g, '/'),
      );
    }
  };

  const handleYearClick = () => {
    appendToFormat('[:year]');
    setCopiedPlaceholder('[:year]');
    setTimeout(() => setCopiedPlaceholder(null), 1500);
  };

  const handleStdNumChange = (event) => {
    const value = event.target.value;
    setSelectedStdNum(value);

    // Remove any existing stdNum placeholder first (use split/join to avoid regex issues)
    setCodeFormatInput((prev) => {
      let cleaned = prev;
      for (const opt of STD_NUM_OPTIONS) {
        cleaned = cleaned
          .split(`/${opt.key}`)
          .join('')
          .split(`${opt.key}/`)
          .join('')
          .split(opt.key)
          .join('');
      }
      cleaned = cleaned.replace(/\/+$/, '').replace(/^\/+/, '').replace(/\/+/g, '/').trim();
      const prefix = cleaned.length > 0 ? '/' : '';
      return cleaned + prefix + value;
    });

    setCopiedPlaceholder(value);
    setTimeout(() => setCopiedPlaceholder(null), 1500);
  };

  // Handle manual edits to the code format input field
  // Rules:
  //   1. No typing — any addition or replacement is reverted
  //   2. Delete inside a placeholder → remove the entire placeholder
  //   3. Delete outside a placeholder → clear everything before the deletion point
  const handleCodeFormatInputChange = (e) => {
    const oldValue = codeFormatInput;
    const newValue = e.target.value;

    const allPlaceholders = ['[:shortname]', '[:year]', ...STD_NUM_OPTIONS.map((o) => o.key)];

    // ── Rule 1: No typing allowed — reject additions & replacements ──────────
    if (newValue.length >= oldValue.length) {
      setCodeFormatInput(oldValue);
      return;
    }

    // ── Deletion: newValue is shorter ────────────────────────────────────────

    // Find the exact position where a character was removed
    let delPos = 0;
    while (delPos < newValue.length && oldValue[delPos] === newValue[delPos]) {
      delPos++;
    }

    // Check if the deletion point falls within a known placeholder in the OLD value
    let targetPlaceholder = null;
    let phStart = -1;

    for (const ph of allPlaceholders) {
      let idx = oldValue.indexOf(ph);
      while (idx !== -1) {
        const end = idx + ph.length - 1;
        if (delPos >= idx && delPos <= end) {
          targetPlaceholder = ph;
          phStart = idx;
          break;
        }
        idx = oldValue.indexOf(ph, idx + 1);
      }
      if (targetPlaceholder) break;
    }

    if (targetPlaceholder) {
      // ── Rule 2: Delete inside a placeholder → remove the entire placeholder ──
      // Remove everything from the placeholder's start in old up to the next /
      // or end of string in the new value
      const endIdx = newValue.indexOf('/', phStart);
      const removeEnd = endIdx !== -1 ? endIdx : newValue.length;

      let result = newValue.substring(0, phStart) + newValue.substring(removeEnd);

      // Clean up double slashes and trim
      result = result.replace(/\/+/g, '/').replace(/^\//, '').replace(/\/$/, '').trim();

      setCodeFormatInput(result || '');

      // Update component states
      if (targetPlaceholder === '[:shortname]') setSchoolShortName('');
      if (STD_NUM_OPTIONS.some((o) => o.key === targetPlaceholder)) setSelectedStdNum('');

      return;
    }

    // ── Rule 3: Delete outside any placeholder → clear everything before ────
    const preserved = newValue.substring(delPos).replace(/^\//, '').trim();

    setCodeFormatInput(preserved || '');

    // Sync component states based on what survived
    if (!preserved.includes('[:shortname]')) setSchoolShortName('');
    if (!STD_NUM_OPTIONS.some((o) => preserved.includes(o.key))) setSelectedStdNum('');
  };

  const handleSaveCodeFormat = async () => {
    const fullFormat = getFullCodeFormat().trim();
    if (!fullFormat) {
      showSnackbar('Please build a code format first', 'warning');
      return;
    }
    setCodeFormatSaving(true);
    try {
      await updateAdmissionCodeFormat({
        code_format: fullFormat,
        school_short_name: schoolShortName.trim(),
      });
      showSnackbar('Admission code format updated successfully');
    } catch (err) {
      console.error('Failed to save code format', err);
      showSnackbar('Failed to update admission code format', 'error');
    } finally {
      setCodeFormatSaving(false);
    }
  };

  // Generate example output
  const getExampleOutput = () => {
    const shortNameValue = schoolShortName.trim() || 'STPAULS';
    return getFullCodeFormat()
      .replace(/\[:shortname\]/g, shortNameValue)
      .replace(/\[:year\]/g, '2026')
      .replace(/\[:stdNum_2\]/g, '01')
      .replace(/\[:stdNum_3\]/g, '001')
      .replace(/\[:stdNum_4\]/g, '0001')
      .replace(/\[:stdNum_5\]/g, '00001')
    // .replace(/\[:stdNum_6\]/g, '000001');
  };

  return (
    <PageContainer title="Admission Setup" description="Manage admission batches">
      <Breadcrumb title="Admission Setup" items={BCrumb} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Admission setup tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 15,
              minWidth: 180,
            },
          }}
        >
          <Tab label="Admission Setup" id="admission-tab-0" aria-controls="admission-tabpanel-0" />
          <Tab
            label="Admission Code Format"
            id="admission-tab-1"
            aria-controls="admission-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 1 — ADMISSION SETUP (existing content)
          ══════════════════════════════════════════════════════════════════════════ */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, md: 4 }}>
            <ParentCard title="Manage Admissions">
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      select
                      fullWidth
                      label="Select Session Term"
                      value={selectedSessionId}
                      onChange={handleSessionChange}
                      size="small"
                    >
                      {sessions.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.sesname}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  {sessionTerms.length === 0 ? (
                    <Alert severity="info">No session terms found.</Alert>
                  ) : (
                    <Paper>
                      <TableContainer>
                        <Table size="small" sx={{ whiteSpace: 'nowrap' }}>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Session</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700 }}>
                                Status
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700 }}>
                                Actions
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sessionTerms.map((session_term, i) => {
                              const isSelected = selectedSessionTermId === session_term.id;
                              return (
                                <TableRow
                                  key={session_term.id}
                                  hover
                                  selected={isSelected}
                                  onClick={() => handleTermSelect(session_term)}
                                  sx={{ cursor: 'pointer' }}
                                >
                                  <TableCell>{i + 1}</TableCell>
                                  <TableCell sx={{ fontWeight: isSelected ? 700 : 400 }}>
                                    {session_term?.session?.sesname}{' '}
                                    {session_term?.display_term?.display_name}
                                  </TableCell>
                                  <TableCell align="center">
                                    {session_term?.is_subscribed === 'yes' ? (
                                      <StatusChip status={session_term?.status} />
                                    ) : (
                                      <Typography variant="caption" color="text.disabled">
                                        —
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, term)}>
                                      <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  )}
                </>
              )}
            </ParentCard>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <ParentCard
              title={
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  gap={{ xs: 1.5, sm: 0 }}
                >
                  <Typography variant="h5">
                    Manage Admission Batches
                    {selectedSessionTermLabel && (
                      <>
                        {' '}
                        For{' '}
                        <Box
                          component="span"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                          }}
                        >
                          {selectedSessionTermLabel}
                        </Box>
                      </>
                    )}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!selectedSessionTermId}
                    onClick={handleCreateBatch}
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap', ml: { xs: 0, sm: 2 } }}
                  >
                    Create New Admission
                  </Button>
                </Box>
              }
            >
              {!selectedSessionTermId ? (
                <Alert severity="info">Select a session term on the left to manage batches.</Alert>
              ) : batchesLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={28} />
                </Box>
              ) : batches.length === 0 ? (
                <Alert
                  severity="info"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  No admission batches yet for this term. Click &quot;Create New Admission&quot; to
                  add one.
                </Alert>
              ) : (
                <Paper>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Batch Name</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Entrance Exam
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Require Payment
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Admission Letter
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Status
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {batches.map((batch, i) => (
                          <TableRow key={batch.id} hover>
                            <TableCell>{i + 1}</TableCell>

                            <TableCell sx={{ fontWeight: 600 }}>{batch.batch_name}</TableCell>

                            {/* Entrance Exam */}
                            <TableCell align="center">
                              {batch.has_entrance_exam ? (
                                <Chip
                                  label="Set E-Exam"
                                  size="small"
                                  sx={{
                                    bgcolor: 'success.light',
                                    color: 'success.dark',
                                    fontWeight: 700,
                                    fontSize: 10,
                                  }}
                                />
                              ) : (
                                <YesNoPill value={false} />
                              )}
                            </TableCell>

                            {/* Require Payment */}
                            <TableCell align="center">
                              <FeePills
                                requirePayment={batch.require_payment}
                                appFee={batch.application_fee}
                                acceptanceFee={batch.acceptance_fee}
                                onViewPayments={() => {
                                  setPaymentViewBatch(batch);
                                  setPaymentViewOpen(true);
                                }}
                              />
                            </TableCell>

                            {/* Admission Letter */}
                            <TableCell align="center">
                              <ViewEditPair
                                onView={() => {
                                  setLetterEditorBatch(batch);
                                  setLetterEditorReadOnly(true);
                                  setLetterEditorOpen(true);
                                }}
                                onEdit={() => {
                                  setLetterEditorBatch(batch);
                                  setLetterEditorReadOnly(false);
                                  setLetterEditorOpen(true);
                                }}
                              />
                            </TableCell>

                            <TableCell align="center">
                              <BatchStatusChip status={batch.status} />
                            </TableCell>

                            {/* Action */}
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBatchMenuAnchor(e.currentTarget);
                                  setMenuBatch(batch);
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </ParentCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 2 — ADMISSION CODE FORMAT (school-level, no batch needed)
          ══════════════════════════════════════════════════════════════════════════ */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {/* ── Info alert ──────────────────────────────────────────────────── */}
          <Grid size={{ xs: 12 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              Define the admission code format for your school. Type your school&apos;s short
              name, insert <strong>[:year]</strong>, and choose the student number digit length. A
              slash <strong>/</strong> is automatically added between segments.
            </Alert>
          </Grid>

          {/* ── Main content — full width, no batch selector ──────────────── */}
          <Grid size={{ xs: 12 }}>
            <ParentCard title="Admission Code Format">
              {codeFormatLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* ── Left grid (md=6) — Inputs & placeholders ──────────── */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant="outlined" >
                      <CardContent>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          gutterBottom
                          sx={{ mb: 2 }}
                        >
                          Format Components
                        </Typography>

                        <Stack spacing={2.5}>
                          {/* ── School Short Name (text input) ───────────── */}
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              gutterBottom
                              sx={{ fontSize: 13 }}
                            >
                              School Short Name
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mb: 1, display: 'block' }}
                            >
                              Type your school abbreviation (optional)
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="e.g STPAULS"
                              value={schoolShortName}
                              onChange={handleShortNameChange}
                              sx={{
                                '& .MuiOutlinedInput-input': {
                                  fontFamily: 'monospace',
                                  fontWeight: 600,
                                  fontSize: 14,
                                  textTransform: 'uppercase',
                                },
                              }}
                            />
                          </Box>

                          <Divider />

                          {/* ── Admission Year (clickable) ──────────────── */}
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              gutterBottom
                              sx={{ fontSize: 13 }}
                            >
                              Admission Year
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mb: 1, display: 'block' }}
                            >
                              Click to insert <strong>[:year]</strong> into the format
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={handleYearClick}
                              startIcon={
                                <ContentCopyIcon
                                  fontSize="small"
                                  sx={{
                                    color:
                                      copiedPlaceholder === '[:year]'
                                        ? 'success.main'
                                        : 'inherit',
                                  }}
                                />
                              }
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                borderColor:
                                  copiedPlaceholder === '[:year]'
                                    ? 'success.main'
                                    : 'primary.main',
                                color:
                                  copiedPlaceholder === '[:year]'
                                    ? 'success.main'
                                    : 'primary.main',
                                bgcolor:
                                  copiedPlaceholder === '[:year]'
                                    ? 'success.light'
                                    : 'transparent',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: 'primary.light',
                                  borderColor: 'primary.main',
                                },
                              }}
                            >
                              {copiedPlaceholder === '[:year]' ? 'Inserted!' : '[:year]'}
                            </Button>
                          </Box>

                          <Divider />

                          {/* ── Student Number (radio options) ──────────── */}
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              gutterBottom
                              sx={{ fontSize: 13 }}
                            >
                              Student Number
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mb: 0.5, display: 'block' }}
                            >
                              Choose the digit length{' '}
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{ fontStyle: 'italic', color: 'warning.main' }}
                              >
                                (only one can be used)
                              </Typography>
                            </Typography>
                            <RadioGroup
                              value={selectedStdNum}
                              onChange={handleStdNumChange}
                              sx={{
                                '& .MuiFormControlLabel-root': {
                                  mr: 0,
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  bgcolor: 'background.paper',
                                  px: 1.5,
                                  py: 0.5,
                                  mb: 0.5,
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    borderColor: 'primary.light',
                                    bgcolor: 'primary.light',
                                  },
                                  '&.Mui-selected': {
                                    borderColor: 'primary.main',
                                    bgcolor: 'primary.light',
                                  },
                                },
                              }}
                            >
                              {STD_NUM_OPTIONS.map((opt) => (
                                <FormControlLabel
                                  key={opt.key}
                                  value={opt.key}
                                  control={
                                    <Radio
                                      size="small"
                                      sx={{
                                        '&.Mui-checked': { color: 'primary.main' },
                                      }}
                                    />
                                  }
                                  label={
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Typography
                                        variant="body2"
                                        fontWeight={700}
                                        sx={{ fontFamily: 'monospace', fontSize: 13 }}
                                      >
                                        {opt.key}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {opt.label}
                                      </Typography>
                                      <Chip
                                        label={opt.example}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          height: 20,
                                          fontSize: 10,
                                          fontFamily: 'monospace',
                                          fontWeight: 600,
                                        }}
                                      />
                                    </Box>
                                  }
                                />
                              ))}
                            </RadioGroup>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* ── Right grid (md=6) — Format builder & save ───────── */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          gutterBottom
                          sx={{ mb: 2 }}
                        >
                          Code Format
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mb: 1.5, display: 'block' }}
                        >
                          The format is built automatically from your selections above. You can
                          also edit it manually.
                        </Typography>

                        {/* Format input */}<OutlinedInput
  fullWidth
  value={codeFormatInput}
  onChange={handleCodeFormatInputChange}
  placeholder="Add components from the left..."
  size="small"
  sx={{
    fontFamily: 'monospace',
    fontSize: 14,
    mb: 2,
    '& .MuiOutlinedInput-input': {
      py: 1.5,
    },
  }}
/>

                        {/* Example output */}
                        {getFullCodeFormat() && (
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: 'success.light',
                              borderRadius: 1,
                              mb: 2,
                              border: '1px solid',
                              borderColor: 'success.main',
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              color="success.dark"
                              gutterBottom
                              display="block"
                            >
                              Example output:
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={700}
                              color="success.dark"
                              sx={{ fontFamily: 'monospace', fontSize: 18 }}
                            >
                              {getExampleOutput()}
                            </Typography>
                            <Typography variant="caption" color="success.dark" sx={{ mt: 0.5, display: 'block' }}>
                              Using shortname: &quot;{schoolShortName.trim() || 'STPAULS'}&quot;
                              | Year: 2026 | Sequential number starting from 001
                            </Typography>
                          </Box>
                        )}

                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          startIcon={
                            codeFormatSaving ? (
                              <CircularProgress size={18} color="inherit" />
                            ) : (
                              <SaveIcon />
                            )
                          }
                          onClick={handleSaveCodeFormat}
                          disabled={codeFormatSaving || !getFullCodeFormat().trim()}
                          sx={{ fontWeight: 700, py: 1.2 }}
                        >
                          {codeFormatSaving ? 'Saving...' : 'Update Code Format'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </ParentCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ── Shared menus & dialogs ────────────────────────────────────────────── */}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            handleTermSelect(menuTerm);
            handleMenuClose();
          }}
        >
          View Batches
        </MenuItem>
        <MenuItem
          sx={{ color: menuTerm?.status === 'active' ? 'error.main' : 'success.main' }}
          onClick={handleToggleTermStatus}
        >
          {menuTerm?.status === 'active' ? 'Deactivate Term' : 'Activate Term'}
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={batchMenuAnchor}
        open={Boolean(batchMenuAnchor)}
        onClose={() => {
          setBatchMenuAnchor(null);
          setMenuBatch(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleEditBatch(menuBatch)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Batch
        </MenuItem>
        <MenuItem
          onClick={() => {
            setConfirmToggleBatch({ open: true, batch: menuBatch });
            setBatchMenuAnchor(null);
            setMenuBatch(null);
          }}
          sx={{ color: menuBatch?.status === 'open' ? 'error.main' : 'success.main' }}
        >
          {menuBatch?.status === 'open' ? 'Close Batch' : 'Open Batch'}
        </MenuItem>
      </Menu>

      <Dialog
        open={confirmToggleBatch.open}
        onClose={() => setConfirmToggleBatch({ open: false, batch: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {confirmToggleBatch.batch?.status === 'open' ? 'Close Batch' : 'Open Batch'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{' '}
            <Box component="span">
              {confirmToggleBatch.batch?.status === 'open' ? 'close' : 'open'}
            </Box>{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {confirmToggleBatch.batch?.batch_name}
            </Box>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            onClick={() => setConfirmToggleBatch({ open: false, batch: null })}
          >
            Cancel
          </Button>
          <Button
            size="small"
            color={confirmToggleBatch.batch?.status === 'open' ? 'error' : 'success'}
            onClick={handleToggleBatchStatus}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={letterEditorOpen}
        onClose={() => setLetterEditorOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {letterEditorReadOnly ? 'View' : 'Edit'} Admission Letter —{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                {letterEditorBatch?.batch_name ?? ''}
              </Box>
            </Typography>
            {selectedSessionTermLabel && (
              <Typography variant="caption" color="text.secondary">
                {selectedSessionTermLabel}
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          <AdmissionLetterEditor
            key={`${letterEditorBatch?.id}-${letterEditorReadOnly}`}
            initialContent={letterEditorBatch?.admission_letter_template ?? ''}
            readOnly={letterEditorReadOnly}
            onChange={(html) => {
              setLetterEditorContent(html);
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setLetterEditorOpen(false)}
            color="inherit"
          >
            {letterEditorReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!letterEditorReadOnly && (
            <Button size="small" onClick={handleSaveAdmissionLetter} sx={{ fontWeight: 700 }}>
              Save Letter
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Payment View Modal */}
      <Dialog
        open={paymentViewOpen}
        onClose={() => setPaymentViewOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Payment Breakdown —{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                {paymentViewBatch?.batch_name ?? ''}
              </Box>
            </Typography>
            {selectedSessionTermLabel && (
              <Typography variant="caption" color="text.secondary">
                {selectedSessionTermLabel}
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {!paymentViewBatch?.require_payment ? (
            <Alert severity="info">No payment required for this batch.</Alert>
          ) : (
            <Stack spacing={3}>
              {/* Pre-Application Payments */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom color="primary.main">
                  Pre-Application Payments
                </Typography>
                {!paymentViewBatch?.pre_application_payments ||
                  paymentViewBatch.pre_application_payments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No pre-application payments set
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {paymentViewBatch.pre_application_payments.map((payment) => (
                      <Box
                        key={payment.id}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {payment.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {payment.bank_name} - {payment.account_number}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          ₦{payment.amount.toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        bgcolor: 'primary.light',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        Pre-Application Total:
                      </Typography>
                      <Typography variant="body1" fontWeight={700} color="primary.main">
                        ₦{paymentViewBatch.application_fee?.toLocaleString() ?? '0'}
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Box>

              {/* Post-Application Payments */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom color="success.main">
                  Post-Application Payments
                </Typography>
                {!paymentViewBatch?.post_application_payments ||
                  paymentViewBatch.post_application_payments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No post-application payments set
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {paymentViewBatch.post_application_payments.map((payment) => (
                      <Box
                        key={payment.id}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {payment.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {payment.bank_name} - {payment.account_number}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700} color="success.main">
                          ₦{payment.amount.toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        bgcolor: 'success.light',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        Post-Application Total:
                      </Typography>
                      <Typography variant="body1" fontWeight={700} color="success.main">
                        ₦{paymentViewBatch.acceptance_fee?.toLocaleString() ?? '0'}
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Box>

              {/* Grand Total */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: 2,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Grand Total:
                </Typography>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  ₦
                  {(
                    (paymentViewBatch?.pre_application_payments || []).reduce(
                      (sum, p) => sum + (p.amount || 0),
                      0,
                    ) +
                    (paymentViewBatch?.post_application_payments || []).reduce(
                      (sum, p) => sum + (p.amount || 0),
                      0,
                    )
                  ).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setPaymentViewOpen(false)}
            color="inherit"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default AdmissionSetup;
