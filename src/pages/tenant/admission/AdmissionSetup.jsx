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
import {
  IconEye,
  IconPencil,
  IconSchool,
  IconCalendar,
  IconHash,
  IconId,
  IconCopy,
  IconCheck,
  IconSparkles,
  IconWand,
  IconPlus,
  IconInfoCircle,
} from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import AdmissionLetterEditor from '@/components/tenant/admission/setup/AdmissionLetterEditor';
import admissionImg from '@/assets/images/admission/graduation.png';
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
    {value === index && <Box sx={{ pt: 1.5 }}>{children}</Box>}
  </div>
);

// ─── Student number length options ────────────────────────────────────────────
const STD_NUM_OPTIONS = [
  { key: '[:stdNum_2]', label: '2 digits', example: '01' },
  { key: '[:stdNum_3]', label: '3 digits', example: '001' },
  { key: '[:stdNum_4]', label: '4 digits', example: '0001' },
  { key: '[:stdNum_5]', label: '5 digits', example: '00001' },
];

const FORMAT_PRESETS = [
  { label: 'Shortname / Year / Seq', value: '[:shortname]/[:year]/[:stdNum_3]', stdNum: '[:stdNum_3]' },
  { label: 'Year / Shortname / Seq', value: '[:year]/[:shortname]/[:stdNum_3]', stdNum: '[:stdNum_3]' },
  { label: 'Year / Seq (4 digits)', value: '[:year]/[:stdNum_4]', stdNum: '[:stdNum_4]' },
  { label: 'Shortname / Seq (4 digits)', value: '[:shortname]/[:stdNum_4]', stdNum: '[:stdNum_4]' },
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
          `${selected.session.session_name} - ${selected.term?.term_name}`,
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
      `${session_term.session.session_name} - ${session_term.term?.term_name}`,
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

  const handleApplyPreset = (preset) => {
    setCodeFormatInput(preset.value);
    setSelectedStdNum(preset.stdNum);
    setCopiedPlaceholder(`Preset applied`);
    setTimeout(() => setCopiedPlaceholder(null), 1500);
  };

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
      .replace(/\[:stdNum_5\]/g, '00001');
    // .replace(/\[:stdNum_6\]/g, '000001');
  };

  // Dynamic session name for header chip
  const currentSessionObj = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const currentSessionName = currentSessionObj?.session_name || currentSessionObj?.name || '';

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
                          {s.session_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  {sessionTerms.length === 0 ? (
                    <Alert severity="info">No session terms found.</Alert>
                  ) : (
                    <Box>
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
                                    {session_term?.session?.session_name}{' '}
                                    {session_term?.term?.term_name}
                                  </TableCell>
                                  <TableCell align="center">
                                    <StatusChip status={session_term?.status} />
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => handleMenuOpen(e, term)}
                                    >
                                      <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
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
                <Box>
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
                </Box>
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
          <Grid size={{ xs: 12 }}>
            <ParentCard
              title="Admission Code Format Configurator"
              sx={{
                '& .MuiCardHeader-root': { pb: 0.5, pt: 2 },
                '& .MuiCardContent-root': { pt: 1 },
              }}
            >
              <Alert severity="info" sx={{ mb: 2 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  spacing={1.5}
                  sx={{ width: '100%' }}
                >
                  <Box>
                    Define the admission code format for your school. Type your school&apos;s short name,
                    insert <strong>[:year]</strong>, and choose the student number digit length. A slash{' '}
                    <strong>/</strong> is automatically added between segments.
                  </Box>
                  {currentSessionName && (
                    <Chip
                      icon={<IconSchool size={14} />}
                      label={`Session: ${currentSessionName}`}
                      size="small"
                      color="info"
                      sx={{ fontWeight: 600, flexShrink: 0 }}
                    />
                  )}
                </Stack>
              </Alert>

              {codeFormatLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <Grid container spacing={2.5}>
                  {/* ── Left Column (xs=12, md=6) — Component Controls ── */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        border: '2px solid #c7c9cbff',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle1" fontWeight={700}>
                              Format Building Blocks
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Step 1 of 2
                          </Typography>
                        </Box>

                        <Stack spacing={2}>
                          {/* ── Component 1: School Short Name ── */}
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.6}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <IconSchool size={18} color="var(--mui-palette-primary-main)" />
                                <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13.5 }}>
                                  School Short Name
                                </Typography>
                              </Stack>
                              <Chip
                                label={codeFormatInput.includes('[:shortname]') ? 'Active' : 'Optional'}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  bgcolor: codeFormatInput.includes('[:shortname]') ? 'success.light' : 'warning.light',
                                  color: codeFormatInput.includes('[:shortname]') ? 'success.dark' : 'warning.dark',
                                }}
                              />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                              Abbreviation used in admission numbers (e.g., STPAULS)
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="e.g. STPAULS"
                              value={schoolShortName}
                              onChange={handleShortNameChange}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  bgcolor: 'background.paper',
                                },
                                '& .MuiOutlinedInput-input': {
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  fontSize: 14,
                                  letterSpacing: 0.5,
                                  textTransform: 'uppercase',
                                },
                              }}
                            />
                          </Box>

                          <Divider sx={{ borderStyle: 'dashed' }} />

                          {/* ── Component 2: Admission Year Token ── */}
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.6}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <IconCalendar size={18} color="var(--mui-palette-primary-main)" />
                                <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13.5 }}>
                                  Admission Year Token
                                </Typography>
                              </Stack>
                              <Chip
                                label={codeFormatInput.includes('[:year]') ? 'Inserted' : 'Available'}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  bgcolor: codeFormatInput.includes('[:year]') ? 'primary.light' : 'info.light',
                                  color: codeFormatInput.includes('[:year]') ? 'primary.main' : 'info.dark',
                                }}
                              />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                              Click token button below to append dynamic year placeholder <strong>[:year]</strong>
                            </Typography>
                            <Button
                              variant={codeFormatInput.includes('[:year]') ? 'soft' : 'outlined'}
                              size="medium"
                              onClick={handleYearClick}
                              startIcon={
                                copiedPlaceholder === '[:year]' ? (
                                  <IconCheck size={16} />
                                ) : (
                                  <IconPlus size={16} />
                                )
                              }
                              sx={{
                                borderRadius: 2,
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                px: 2,
                                py: 0.8,
                                textTransform: 'none',
                                borderColor: codeFormatInput.includes('[:year]') ? 'primary.main' : 'divider',
                                bgcolor: codeFormatInput.includes('[:year]') ? 'primary.light' : 'transparent',
                                color: 'primary.main',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  borderColor: 'primary.main',
                                },
                              }}
                            >
                              {copiedPlaceholder === '[:year]' ? 'Inserted [:year]!' : '[:year] (Admission Year)'}
                            </Button>
                          </Box>

                          {/* ── Component 3: Student Number Digit Length (Visible only when [:year] is present) ── */}
                          {codeFormatInput.includes('[:year]') && (
                            <>
                              <Divider sx={{ borderStyle: 'dashed' }} />

                              <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.6}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <IconHash size={18} color="var(--mui-palette-primary-main)" />
                                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13.5 }}>
                                      Sequential Student Number
                                    </Typography>
                                  </Stack>
                                  <Chip
                                    label="Pick 1 Length"
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: 10,
                                      fontWeight: 700,
                                      bgcolor: 'warning.light',
                                      color: 'warning.dark',
                                    }}
                                  />
                                </Stack>
                                <Typography variant="caption" color="text.secondary" display="block" mb={1.2}>
                                  Select the padding length for sequential student registration numbers
                                </Typography>

                                <RadioGroup value={selectedStdNum} onChange={handleStdNumChange}>
                                  <Grid container spacing={1.5}>
                                    {STD_NUM_OPTIONS.map((opt) => {
                                      const isSelected = selectedStdNum === opt.key;
                                      return (
                                        <Grid size={{ xs: 6 }} key={opt.key}>
                                          <Box
                                            onClick={() => handleStdNumChange({ target: { value: opt.key } })}
                                            sx={{
                                              p: 1.2,
                                              borderRadius: 2,
                                              border: '1.5px solid',
                                              borderColor: isSelected ? 'primary.main' : 'divider',
                                              bgcolor: isSelected
                                                ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(238, 242, 255, 0.8)')
                                                : 'background.paper',
                                              cursor: 'pointer',
                                              transition: 'all 0.2s ease',
                                              boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.2)' : 'none',
                                              '&:hover': {
                                                borderColor: 'primary.main',
                                                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(238, 242, 255, 0.4)'),
                                              },
                                            }}
                                          >
                                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                                              <Typography variant="caption" fontWeight={700} color={isSelected ? 'primary.main' : 'text.primary'}>
                                                {opt.label}
                                              </Typography>
                                              <Radio
                                                checked={isSelected}
                                                size="small"
                                                sx={{ p: 0, '&.Mui-checked': { color: 'primary.main' } }}
                                              />
                                            </Stack>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                              <Typography
                                                variant="body2"
                                                fontWeight={700}
                                                sx={{ fontFamily: 'monospace', fontSize: 13, color: 'text.secondary' }}
                                              >
                                                {opt.key}
                                              </Typography>
                                              <Chip
                                                label={opt.example}
                                                size="small"
                                                color={isSelected ? 'primary' : 'default'}
                                                sx={{
                                                  height: 18,
                                                  fontSize: 10,
                                                  fontFamily: 'monospace',
                                                  fontWeight: 700,
                                                }}
                                              />
                                            </Stack>
                                          </Box>
                                        </Grid>
                                      );
                                    })}
                                  </Grid>
                                </RadioGroup>
                              </Box>
                            </>
                          )}

                          <Divider sx={{ borderStyle: 'dashed' }} />

                          {/* ── Component 4: Quick Presets ── */}
                          <Box>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13, mb: 1 }}>
                              Quick Format Presets
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                              {FORMAT_PRESETS.map((preset, idx) => (
                                <Chip
                                  key={idx}
                                  icon={<IconWand size={12} />}
                                  label={preset.label}
                                  clickable
                                  size="small"
                                  onClick={() => handleApplyPreset(preset)}
                                  sx={{
                                    borderRadius: 2,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    bgcolor: 'primary.light',
                                    color: 'primary.main',
                                    border: '1px solid',
                                    borderColor: 'primary.light',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                      color: 'white',
                                    },
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        height: '100%',
                        border: '2px solid #c7c9cbff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
                      }}
                    >
                      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle1" fontWeight={700}>
                              Format Canvas & Live Preview
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Step 2 of 2
                          </Typography>
                        </Box>

                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                          Format tokens automatically construct your student code pattern. You can also fine-tune or trim components below.
                        </Typography>

                        {/* ── Visual Token Pills Preview ── */}
                        {getFullCodeFormat() && (
                          <Box mb={2.5}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                              Active Format Token Pattern:
                            </Typography>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 1.5,
                                borderRadius: 2.5,
                                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.9)'),
                                border: '1px dashed',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 1,
                              }}
                            >
                              {getFullCodeFormat()
                                .split('/')
                                .filter(Boolean)
                                .map((token, i) => {
                                  let isShort = token === '[:shortname]';
                                  let isYear = token === '[:year]';
                                  let isStdNum = STD_NUM_OPTIONS.some((o) => o.key === token);

                                  return (
                                    <Stack key={i} direction="row" alignItems="center" spacing={1}>
                                      {i > 0 && (
                                        <Typography variant="body2" fontWeight={800} color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                                          /
                                        </Typography>
                                      )}
                                      <Chip
                                        size="medium"
                                        label={
                                          isShort
                                            ? `Shortname [${schoolShortName.trim() || 'STPAULS'}]`
                                            : isYear
                                              ? 'Year [:year]'
                                              : isStdNum
                                                ? `Seq No [${token.replace('[:stdNum_', '').replace(']', '')} Digits]`
                                                : token
                                        }
                                        color={isShort ? 'primary' : isYear ? 'info' : isStdNum ? 'success' : 'default'}
                                        sx={{
                                          fontFamily: 'monospace',
                                          fontWeight: 700,
                                          fontSize: 12,
                                          borderRadius: 2,
                                        }}
                                      />
                                    </Stack>
                                  );
                                })}
                            </Paper>
                          </Box>
                        )}

                        {/* ── Monospace Format Field ── */}
                        <Box mb={3}>
                          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.8}>
                            Raw Format String (Editable)
                          </Typography>
                          <OutlinedInput
                            fullWidth
                            value={codeFormatInput}
                            onChange={handleCodeFormatInputChange}
                            placeholder="Construct components from the left panel..."
                            size="small"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: 14,
                              borderRadius: 2.5,
                              '& .MuiOutlinedInput-input': {
                                py: 1.5,
                                px: 2,
                              },
                            }}
                          />
                        </Box>

                        {/* ── Live Example Output Container ── */}
                        {getFullCodeFormat() ? (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2.5,
                              borderRadius: 3,
                              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(6, 78, 59, 0.25)' : 'rgba(236, 253, 245, 0.9)'),
                              border: '1.5px solid',
                              borderColor: 'success.main',
                              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.12)',
                              position: 'relative',
                            }}
                          >
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <IconSparkles size={18} color="var(--mui-palette-success-main)" />
                                <Typography variant="caption" fontWeight={800} color="success.dark" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                  Live Generated Sample Output
                                </Typography>
                              </Stack>
                              <Tooltip title="Copy example format">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    navigator.clipboard.writeText(getExampleOutput());
                                    showSnackbar('Copied example code to clipboard', 'info');
                                  }}
                                  sx={{ color: 'success.dark', bgcolor: 'rgba(16, 185, 129, 0.15)' }}
                                >
                                  <IconCopy size={15} />
                                </IconButton>
                              </Tooltip>
                            </Stack>

                            <Typography
                              variant="h5"
                              fontWeight={800}
                              color="success.dark"
                              sx={{
                                fontFamily: 'monospace',
                                letterSpacing: 1,
                                py: 1,
                                px: 2,
                                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)'),
                                borderRadius: 2,
                                display: 'inline-block',
                                border: '1px solid',
                                borderColor: 'rgba(16, 185, 129, 0.3)',
                                mb: 1.5,
                              }}
                            >
                              {getExampleOutput()}
                            </Typography>

                            <Typography variant="caption" color="success.dark" display="block" sx={{ opacity: 0.9, fontSize: 12.5, lineHeight: 1.5 }}>
                              <strong>Breakdown:</strong> Prefix: &quot;{schoolShortName.trim() || 'STPAULS'}&quot; &bull; Admission Year: 2026 &bull; Sequential Number starting from {selectedStdNum ? STD_NUM_OPTIONS.find(o => o.key === selectedStdNum)?.example : '001'}
                            </Typography>
                          </Paper>
                        ) : (
                          <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Select or type components on the left to start building your admission code format.
                          </Alert>
                        )}
                      </CardContent>

                      {/* ── Save Action Footer ── */}
                      <Box p={3} pt={0}>
                        <Divider sx={{ mb: 2.5 }} />
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          startIcon={
                            codeFormatSaving ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <SaveIcon />
                            )
                          }
                          onClick={handleSaveCodeFormat}
                          disabled={codeFormatSaving || !getFullCodeFormat().trim()}
                          sx={{
                            fontWeight: 700,
                            py: 1.4,
                            borderRadius: 2.5,
                            fontSize: 15,
                            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.45)',
                            },
                          }}
                        >
                          {codeFormatSaving ? 'Saving Code Format...' : 'Update Code Format'}
                        </Button>
                      </Box>
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
    </PageContainer >
  );
};

export default AdmissionSetup;
